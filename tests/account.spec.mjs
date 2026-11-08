import { test, expect, openPage } from './support/site.mjs';

// Answers the account API, recording each request. `responses` maps a path such as 'user/signin' to
// { status, body }, or to a function returning one. Roles default to signed out.
async function api(page, responses = {}) {
    const calls = [];
    await page.route('https://api.myfi.ws/**', async route => {
        const request = route.request();
        const headers = {
            'access-control-allow-origin': request.headers().origin || '*',
            'access-control-allow-credentials': 'true',
            'access-control-allow-headers': '*',
            'access-control-allow-methods': '*',
        };
        if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
        const path = new URL(request.url()).pathname.replace(/^\//, '');
        const text = request.postData();
        let body;
        try { body = text ? JSON.parse(text) : undefined; } catch { body = text; }
        calls.push({ path, method: request.method(), body });
        let answer = responses[path] ?? (path === 'user/roles' ? { body: '0' } : {});
        if (typeof answer === 'function') answer = answer(body);
        return route.fulfill({ status: answer.status ?? 200, body: answer.body ?? '', contentType: 'text/plain', headers });
    });
    return calls;
}
const signedIn = { 'user/roles': { body: '1' } };
const callsTo = (calls, path) => calls.filter(call => call.path === path);
const input = (scope, name) => scope.locator(`webui-input-text[name="${name}"] input`);
const dialog = page => page.locator('dialog[open]').last();
const dialogButton = (page, text) => dialog(page).getByText(text, { exact: true }).last();

test.describe('app-account', () => {
    test('signed out, it goes to the sign-in page', async ({ page }) => {
        await api(page);
        await openPage(page, '/');
        const account = page.locator('app-account');
        await expect(account).toHaveAttribute('title', 'Go to signin page');
        await account.click();
        await page.waitForURL('**/signin');
    });

    test('signed in, it opens the account panel', async ({ page }) => {
        await api(page, signedIn);
        await openPage(page, '/');
        const account = page.locator('app-account');
        await expect(account).toHaveAttribute('title', 'Toggle Account Panel');
        await account.click();
        await expect(page.locator('app-account-sidebar')).toBeVisible();
    });
});

test.describe('app-signin', () => {
    const form = page => page.locator('app-signin');
    const alert = page => form(page).locator('form > webui-alert');
    const tab = (page, label) => form(page).locator('webui-button[slot="tabs"]', { hasText: label });
    const submit = (page, label) => form(page).locator('webui-button[type="submit"]', { hasText: label }).click();
    const openSignIn = async (page, responses) => {
        const calls = await api(page, responses);
        await openPage(page, '/signin');
        await tab(page, 'Sign-In').click();
        await input(form(page), 'email').first().waitFor();
        return calls;
    };

    test('signing in needs an email and a password', async ({ page }) => {
        const calls = await openSignIn(page);
        await submit(page, 'Sign-In');
        await expect(alert(page)).toContainText('Email is required');
        await input(form(page), 'email').first().fill('someone@example.com');
        await submit(page, 'Sign-In');
        await expect(alert(page)).toContainText('Password is required');
        expect(callsTo(calls, 'user/signin')).toEqual([]);
    });

    test('a successful sign-in loads the roles and goes home', async ({ page }) => {
        let signedInNow = false;
        const calls = await openSignIn(page, {
            'user/signin': () => { signedInNow = true; return { body: 'Welcome back' }; },
            'user/roles': () => ({ body: signedInNow ? '1' : '0' }),
        });
        await input(form(page), 'email').first().fill('someone@example.com');
        await input(form(page), 'password').fill('test-password-not-real');
        await submit(page, 'Sign-In');
        await page.waitForURL(url => url.pathname === '/');
        const [signIn] = callsTo(calls, 'user/signin');
        expect(signIn.body).toMatchObject({ email: 'someone@example.com', password: 'test-password-not-real' });
        expect(signIn.body).not.toHaveProperty('x-cookie-age');
        expect(callsTo(calls, 'cookie/age')).toHaveLength(1);
    });

    test('a refused sign-in shows why and stays on the page', async ({ page }) => {
        await openSignIn(page, { 'user/signin': { status: 401, body: 'Invalid email or password' } });
        await input(form(page), 'email').first().fill('someone@example.com');
        await input(form(page), 'password').fill('wrong-test-password');
        await submit(page, 'Sign-In');
        await expect(alert(page)).toContainText('Invalid email or password');
        expect(new URL(page.url()).pathname).toBe('/signin');
    });

    test('a sign-in the API accepts without giving a role says something went wrong', async ({ page }) => {
        await openSignIn(page, { 'user/signin': { body: '' } });
        await input(form(page), 'email').first().fill('someone@example.com');
        await input(form(page), 'password').fill('test-password-not-real');
        await submit(page, 'Sign-In');
        await expect(alert(page)).toContainText('An issue occurred signing you in');
    });

    test('creating an account sends the email', async ({ page }) => {
        const calls = await api(page, { 'user/create': { body: 'Check your email to finish creating your account' } });
        await openPage(page, '/signin');
        await tab(page, 'Create Account').click();
        const email = form(page).locator('webui-content').nth(1).locator('webui-input-text[name="email"] input');
        await email.fill('new@example.com');
        await submit(page, 'Create Account');
        await expect.poll(() => callsTo(calls, 'user/create').map(call => call.body.email)).toEqual(['new@example.com']);
        await expect(page.locator('.webui-alerts-popup')).toContainText('Check your email to finish creating your account');
    });

    test('forgot password needs an email, then asks the API to send one', async ({ page }) => {
        const calls = await openSignIn(page);
        await form(page).locator('webui-button[name="forgotpassword"]').click();
        await dialogButton(page, 'Request Password Reset Email').click();
        await expect(dialog(page).locator('webui-alert')).toContainText('Please enter your email');
        await input(dialog(page), 'email').fill('someone@example.com');
        await dialogButton(page, 'Request Password Reset Email').click();
        await expect.poll(() => callsTo(calls, 'user/forgotpassword').map(call => call.body.email)).toEqual(['someone@example.com']);
        await expect(page.locator('dialog[open]')).toHaveCount(0);
    });

    test('a refused password reset request says why and keeps the dialog open', async ({ page }) => {
        await openSignIn(page, { 'user/forgotpassword': { status: 429, body: 'Too many requests' } });
        await form(page).locator('webui-button[name="forgotpassword"]').click();
        await input(dialog(page), 'email').fill('someone@example.com');
        await dialogButton(page, 'Request Password Reset Email').click();
        await expect(dialog(page).locator('webui-alert')).toContainText('Too many requests');
    });

    test('signed in, it says so and offers the sign-out time', async ({ page }) => {
        await api(page, signedIn);
        await openPage(page, '/signin');
        await expect(form(page)).toContainText('You are already signed in');
        await expect(form(page).locator('webui-input-range[name="autosignout"]')).toHaveCount(1);
    });

    test('signed in with a domain, it asks to sign in to that site', async ({ page }) => {
        const calls = await api(page, { ...signedIn, 'user/signin/domain': { status: 403, body: 'That site is not linked to your account' } });
        await openPage(page, '/signin?domain=example.com');
        await expect(form(page)).toContainText('Signin to example.com');
        await form(page).locator('webui-button[type="submit"]').click();
        await expect.poll(() => callsTo(calls, 'user/signin/domain').map(call => call.body)).toEqual([{ signin_domain: 'example.com' }]);
        await expect(form(page).locator('webui-alert')).toContainText('That site is not linked to your account');
    });

    test('a domain that is not a host name is ignored, so markup in it never reaches the page', async ({ page }) => {
        await api(page, signedIn);
        await openPage(page, `/signin?domain=${encodeURIComponent('<img src=x onerror="window.__xss=1">.com')}`);
        await expect(form(page)).toContainText('You are already signed in');
        await expect(form(page).locator('img')).toHaveCount(0);
        expect(await page.evaluate(() => window.__xss)).toBeUndefined();
    });
});

for (const [route, component, path, extra] of [
    ['/resetpassword', 'app-passwordreset', 'user/confirm/passwordreset', {}],
    ['/confirmemail', 'app-confirmemail', 'user/confirm', { displayName: 'Test User' }],
]) {
    test.describe(component, () => {
        const token = Buffer.from('test-token').toString('base64');
        const form = page => page.locator(component);
        const alert = page => form(page).locator('webui-alert');
        const fill = async (page, values) => {
            for (const [name, value] of Object.entries(values)) await input(form(page), name).fill(value);
        };
        const submit = page => form(page).locator('webui-button[type="submit"]').click();

        test('an address without a token is refused', async ({ page }) => {
            const calls = await api(page);
            await openPage(page, `${route}/`);
            await fill(page, { ...extra, password: 'test-password-not-real', confirmPassword: 'test-password-not-real' });
            await submit(page);
            await expect(alert(page)).toContainText('Missing expected token');
            expect(callsTo(calls, path)).toEqual([]);
        });

        test('every field is needed, and the passwords must match', async ({ page }) => {
            const calls = await api(page);
            await openPage(page, `${route}/${token}`);
            if (extra.displayName) {
                await submit(page);
                await expect(alert(page)).toContainText('Please enter a display name');
                await fill(page, extra);
            }
            await submit(page);
            await expect(alert(page)).toContainText('Password is required');
            await fill(page, { password: 'test-password-not-real' });
            await submit(page);
            await expect(alert(page)).toContainText('Please confirm your password');
            await fill(page, { confirmPassword: 'a-different-test-password' });
            await submit(page);
            await expect(alert(page)).toContainText('do not match');
            expect(callsTo(calls, path)).toEqual([]);
        });

        test('a matching password is sent with the token, then it goes to sign-in', async ({ page }) => {
            const calls = await api(page);
            await openPage(page, `${route}/${token}`);
            await fill(page, { ...extra, password: 'test-password-not-real', confirmPassword: 'test-password-not-real' });
            await submit(page);
            await page.waitForURL('**/signin');
            expect(callsTo(calls, path).map(call => call.body)).toEqual([{ ...extra, password: 'test-password-not-real', confirmPassword: 'test-password-not-real', token }]);
        });

        test('a refusal from the API says why', async ({ page }) => {
            await api(page, { [path]: { status: 400, body: 'This link has expired' } });
            await openPage(page, `${route}/${token}`);
            await fill(page, { ...extra, password: 'test-password-not-real', confirmPassword: 'test-password-not-real' });
            await submit(page);
            await expect(alert(page)).toContainText('This link has expired');
        });
    });
}

test.describe('app-account-sidebar', () => {
    const openPanel = async (page, responses = {}) => {
        const calls = await api(page, { ...signedIn, ...responses });
        await openPage(page, '/');
        await page.locator('app-account').click();
        await expect(page.locator('app-account-sidebar')).toBeVisible();
        return calls;
    };
    const sidebarButton = (page, name) => page.locator(`app-account-sidebar webui-button[name="${name}"]`);

    test('changing the password checks the fields before sending them', async ({ page }) => {
        const calls = await openPanel(page);
        await sidebarButton(page, 'passwordupdate').click();
        const confirm = () => dialogButton(page, 'Request Password Reset Email').click();
        const message = dialog(page).locator('webui-alert');
        await confirm();
        await expect(message).toContainText('Please enter your old password');
        await input(dialog(page), 'old_password').fill('old-test-password');
        await confirm();
        await expect(message).toContainText('Please enter a new password');
        await input(dialog(page), 'new_password').fill('too-short');
        await confirm();
        await expect(message).toContainText('at least 20 characters');
        await input(dialog(page), 'new_password').fill('a-long-enough-test-password');
        await input(dialog(page), 'confirm_password').fill('something-else-entirely');
        await confirm();
        await expect(message).toContainText('do not match');
        expect(callsTo(calls, 'user/password')).toEqual([]);
    });

    test('a valid new password is sent', async ({ page }) => {
        const calls = await openPanel(page);
        await sidebarButton(page, 'passwordupdate').click();
        await input(dialog(page), 'old_password').fill('old-test-password');
        await input(dialog(page), 'new_password').fill('a-long-enough-test-password');
        await input(dialog(page), 'confirm_password').fill('a-long-enough-test-password');
        await dialogButton(page, 'Request Password Reset Email').click();
        await expect.poll(() => callsTo(calls, 'user/password').map(call => call.method)).toEqual(['PATCH']);
        await expect(page.locator('.webui-alerts-popup')).toContainText('Your password has been updated.');
    });

    test('sign out tells the API, reloads the roles, and closes the panel', async ({ page }) => {
        let signedOut = false;
        const calls = await openPanel(page, {
            'user/signout': () => { signedOut = true; return {}; },
            'user/roles': () => ({ body: signedOut ? '0' : '1' }),
        });
        await sidebarButton(page, 'signout').click();
        await expect.poll(() => callsTo(calls, 'user/signout').length).toBe(1);
        await expect(page.locator('.webui-alerts-popup')).toContainText('You have been signed out.');
        await expect(page.locator('app-account')).toHaveAttribute('title', 'Go to signin page');
    });
});

test('app-account-settings saves a new sign-out time with the API', async ({ page }) => {
    const calls = await api(page, signedIn);
    await openPage(page, '/');
    await page.evaluate(() => {
        const settings = document.createElement('app-account-settings');
        document.querySelector('webui-app main, main, body').append(settings);
    });
    const range = page.locator('app-account-settings webui-input-range[name="autosignout"]');
    await expect(range).toHaveCount(1);
    // Moving the slider writes session-autosignout through the range's data-trigger.
    await range.locator('input[type="range"]').fill('60');
    await expect.poll(() => page.evaluate(() => `${webui.getData('session-autosignout')}`)).toBe('60');
    await expect.poll(() => callsTo(calls, 'cookie/age').length, { timeout: 3000 }).toBe(1);
});

test('app-myfi-pricing-table lists the starter features and the add-ons', async ({ page }) => {
    await api(page);
    await openPage(page, '/');
    await page.evaluate(() => document.querySelector('webui-app main, main, body').append(document.createElement('app-myfi-pricing-table')));
    await expect.poll(() => page.evaluate(() => webui.getData('page-starter-pricing')?.length)).toBeGreaterThan(0);
    await expect.poll(() => page.evaluate(() => webui.getData('page-addon-pricing')?.length)).toBeGreaterThan(0);
    await expect(page.locator('app-myfi-pricing-table webui-table').first()).toContainText('Single User');
});
