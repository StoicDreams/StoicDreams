import { test, expect, openPage } from './support/site.mjs';

// Answers the account API, recording each request. `responses` maps a path such as 'user/signin' to
// { status, body }, or to a function of the request's body and method returning one. Roles default to signed out.
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
        if (typeof answer === 'function') answer = answer(body, request.method());
        return route.fulfill({ status: answer.status ?? 200, body: answer.body ?? '', contentType: 'text/plain', headers });
    });
    return calls;
}
const signedIn = { 'user/roles': { body: '1' } };
const callsTo = (calls, path) => calls.filter(call => call.path === path);
const input = (scope, name) => scope.locator(`webui-input-text[name="${name}"] input`);
// A webui.dialog shows its content in a slot of webui-dialogs, outside the shadow dialog element.
const dialog = page => page.locator('webui-dialogs:has(dialog[open])');
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

    test('confirming a domain sign-in sends the visitor there with the one-time code', async ({ page }) => {
        const answer = { body: JSON.stringify({ message: 'You have successfully signed in to example.com', code: 'abc123' }) };
        await api(page, { ...signedIn, 'user/signin/domain': answer });
        await openPage(page, '/signin?domain=example.com');
        await page.route('https://example.com/**', route => route.fulfill({ contentType: 'text/html', body: '<p>Example</p>' }));
        await form(page).locator('webui-button[type="submit"]').click();
        await page.waitForURL('https://example.com/#myfi-signin=abc123');
    });

    test('a return path sends the visitor back to that page of the site', async ({ page }) => {
        const answer = { body: JSON.stringify({ message: 'Signed in', code: 'abc123' }) };
        await api(page, { ...signedIn, 'user/signin/domain': answer });
        await openPage(page, `/signin?domain=example.com&return=${encodeURIComponent('/remote/?desk=1')}`);
        await page.route('https://example.com/**', route => route.fulfill({ contentType: 'text/html', body: '<p>Example</p>' }));
        await form(page).locator('webui-button[type="submit"]').click();
        await page.waitForURL('https://example.com/remote/?desk=1#myfi-signin=abc123');
    });

    // One test per return, so each page load has the whole timeout, and a failure names the return.
    for (const target of ['https://evil.com/x', '//evil.com/x', '/\\evil.com/x', '/\t/evil.com', 'javascript:alert(1)', 'remote/', '/remote/#other']) {
        test(`a return that is not a path on the same site goes to its home page instead: ${JSON.stringify(target)}`, async ({ page }) => {
            const answer = { body: JSON.stringify({ message: 'Signed in', code: 'abc123' }) };
            await api(page, { ...signedIn, 'user/signin/domain': answer });
            const elsewhere = [];
            await page.route(url => url.hostname.endsWith('evil.com'), route => { elsewhere.push(route.request().url()); route.fulfill({ contentType: 'text/html', body: '<p>Evil</p>' }); });
            await page.route('https://example.com/**', route => route.fulfill({ contentType: 'text/html', body: '<p>Example</p>' }));
            await openPage(page, `/signin?domain=example.com&return=${encodeURIComponent(target)}`);
            await form(page).locator('webui-button[type="submit"]').click();
            await page.waitForURL('https://example.com/#myfi-signin=abc123');
            expect(elsewhere).toEqual([]);
        });
    }

    test('a domain that is not a host name is ignored, so markup in it never reaches the page', async ({ page }) => {
        await api(page, signedIn);
        await openPage(page, `/signin?domain=${encodeURIComponent('<img src=x onerror="window.__xss=1">.com')}`);
        await expect(form(page)).toContainText('You are already signed in');
        await expect(form(page).locator('img')).toHaveCount(0);
        // No image element was made from it, so nothing can run its onerror.
        await expect.poll(() => page.evaluate(() => window.__xss)).toBeUndefined();
    });

    // An installed app, such as Task Proxy, sends the visitor here to approve its sign-in.
    test.describe('approving an app', () => {
        const request = '3160d8e4-e8dd-43c7-a397-43b17ef46cbc';
        const appUrl = `/signin?app=taskproxy&request=${request}`;
        const shown = { body: JSON.stringify({ app: 'Task Proxy', company: 'Stoic Dreams', name: 'Desk', code: 'M7A-JQF' }) };
        const appRequest = (answers = {}) => (body, method) =>
            method === 'GET' ? (answers.get ?? shown) : method === 'DELETE' ? (answers.delete ?? {}) : {};
        const button = (page, label) => form(page).locator('webui-button', { hasText: label });

        test('it names the app, its company, and the computer, and shows the code to check', async ({ page }) => {
            await api(page, { ...signedIn, 'user/signin/app': appRequest() });
            await openPage(page, appUrl);
            await expect(form(page)).toContainText('Task Proxy, from Stoic Dreams, on Desk is asking to sign in to your account');
            await expect(form(page).locator('.app-signin-code')).toHaveText('M7A-JQF');
            await expect(button(page, 'Approve Sign-In')).toBeVisible();
            await expect(button(page, 'Refuse')).toBeVisible();
        });

        test('approving sends the request and says the app is signed in', async ({ page }) => {
            const calls = await api(page, {
                ...signedIn,
                'user/signin/app': appRequest(),
                'user/signin/app/approve': { body: 'Task Proxy, from Stoic Dreams, on Desk is signed in to your account. You can close this page.' },
            });
            await openPage(page, appUrl);
            await button(page, 'Approve Sign-In').click();
            await expect(form(page).locator('webui-alert')).toContainText('Task Proxy, from Stoic Dreams, on Desk is signed in to your account');
            expect(callsTo(calls, 'user/signin/app/approve').map(call => call.body)).toEqual([{ request }]);
            await expect(button(page, 'Approve Sign-In')).toHaveCount(0);
            expect(new URL(page.url()).pathname).toBe('/signin');
        });

        test('refusing ends the request', async ({ page }) => {
            const calls = await api(page, { ...signedIn, 'user/signin/app': appRequest() });
            await openPage(page, appUrl);
            await button(page, 'Refuse').click();
            await expect(form(page).locator('webui-alert')).toContainText('The sign-in was refused');
            const refused = callsTo(calls, 'user/signin/app').filter(call => call.method === 'DELETE');
            expect(refused.map(call => call.body)).toEqual([{ request }]);
            expect(callsTo(calls, 'user/signin/app/approve')).toEqual([]);
        });

        test('an approval the API refuses says why and can be tried again', async ({ page }) => {
            await api(page, {
                ...signedIn,
                'user/signin/app': appRequest(),
                'user/signin/app/approve': { status: 400, body: 'This sign-in has expired or was already approved.' },
            });
            await openPage(page, appUrl);
            await button(page, 'Approve Sign-In').click();
            await expect(form(page).locator('webui-alert')).toContainText('This sign-in has expired or was already approved.');
            await expect(button(page, 'Approve Sign-In')).toBeVisible();
        });

        test('an expired request says so, with nothing to approve', async ({ page }) => {
            await api(page, { ...signedIn, 'user/signin/app': appRequest({ get: { status: 400, body: 'This sign-in has expired or was already approved. Start signing in again from the app.' } }) });
            await openPage(page, appUrl);
            await expect(form(page).locator('webui-alert')).toContainText('Start signing in again from the app');
            await expect(button(page, 'Approve Sign-In')).toHaveCount(0);
            await expect(form(page).locator('.app-signin-code')).toHaveCount(0);
        });

        test('names from the API are shown as text, so markup in them never reaches the page', async ({ page }) => {
            const name = '<img src=x onerror="window.__xss=1">';
            await api(page, { ...signedIn, 'user/signin/app': appRequest({ get: { body: JSON.stringify({ app: 'Task Proxy', company: name, name, code: 'M7A-JQF' }) } }) });
            await openPage(page, appUrl);
            await expect(form(page).locator('.app-signin-name')).toHaveText(name);
            await expect(form(page).locator('img')).toHaveCount(0);
            // No image element was made from it, so nothing can run its onerror.
        await expect.poll(() => page.evaluate(() => window.__xss)).toBeUndefined();
        });

        test('a request that is not a request id is ignored', async ({ page }) => {
            const calls = await api(page, signedIn);
            await openPage(page, `/signin?app=taskproxy&request=${encodeURIComponent('../user/signout')}`);
            await expect(form(page)).toContainText('You are already signed in');
            expect(callsTo(calls, 'user/signin/app')).toEqual([]);
        });

        test('signed out, it asks to sign in first, then stays to approve', async ({ page }) => {
            let signedInNow = false;
            await api(page, {
                'user/signin': () => { signedInNow = true; return { body: 'Welcome back' }; },
                'user/roles': () => ({ body: signedInNow ? '1' : '0' }),
                'user/signin/app': appRequest(),
            });
            await openPage(page, appUrl);
            await expect(form(page)).toContainText('Sign in to approve the app that sent you here.');
            await tab(page, 'Sign-In').click();
            await input(form(page), 'email').first().fill('someone@example.com');
            await input(form(page), 'password').fill('test-password-not-real');
            await submit(page, 'Sign-In');
            await expect(form(page).locator('.app-signin-code')).toHaveText('M7A-JQF');
            expect(new URL(page.url()).pathname).toBe('/signin');
        });
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
    // The API call waits for the slider to rest, so the test moves the clock instead of waiting.
    await page.clock.install();
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
    await page.clock.runFor(600);
    await expect.poll(() => callsTo(calls, 'cookie/age').length).toBe(1);
});

// Opens /account signed in, on the tab that shows the component.
const tabFor = { 'app-account-subscriptions': 'Subscriptions', 'app-account-privacy': 'Security / Privacy' };
const addToPage = async (page, name) => {
    await openPage(page, '/account');
    await page.locator('webui-tabs webui-button[slot="tabs"]', { hasText: tabFor[name] }).click();
    await expect(page.locator(name)).toBeVisible();
};
const json = value => ({ body: JSON.stringify(value) });

test.describe('/account', () => {
    test('signed in, it has the Session, Subscriptions, and Security / Privacy tabs', async ({ page }) => {
        await api(page, { ...signedIn, 'user/subscriptions': json([]), 'user/authorizations': json([]) });
        await openPage(page, '/account');
        const tabs = page.locator('webui-tabs webui-button[slot="tabs"]');
        await expect(tabs).toHaveText(['Session', 'Subscriptions', 'Security / Privacy']);
        await expect(page.locator('app-account-settings')).toBeVisible();
        await tabs.nth(1).click();
        await expect(page.locator('app-account-subscriptions')).toBeVisible();
        await tabs.nth(2).click();
        await expect(page.locator('app-account-privacy')).toBeVisible();
    });
});

test.describe('app-account-subscriptions', () => {
    const subscriptions = [
        { id: 'a1', type: 'newsletter', name: 'Stoic Dreams News', company: 'Stoic Dreams', domain: 'www.stoicdreams.com', status: 'active', subscribedAt: '2026-10-01T12:00:00Z' },
        { id: 'b2', type: 'newsletter', name: 'Piano Tips', company: 'Other Co', domain: 'piano.example.com', status: 'inactive', subscribedAt: '2026-01-01T12:00:00Z', endedAt: '2026-06-01T12:00:00Z' },
    ];
    const rows = page => page.locator('app-account-subscriptions li');
    const toggle = (page, index) => rows(page).nth(index).locator('webui-toggle-icon');

    test('lists every subscription with its company, site, and whether it is active', async ({ page }) => {
        await api(page, { ...signedIn, 'user/subscriptions': json(subscriptions) });
        await addToPage(page, 'app-account-subscriptions');
        await expect(rows(page)).toHaveCount(2);
        await expect(rows(page).nth(0).locator('strong')).toHaveText('Stoic Dreams News');
        await expect(rows(page).nth(0).locator('.source')).toHaveText('Newsletter · Stoic Dreams · www.stoicdreams.com');
        await expect(rows(page).nth(0).locator('.status')).toContainText('Active since');
        await expect(toggle(page, 0)).toHaveAttribute('enabled', 'true');
        await expect(toggle(page, 0)).toHaveAttribute('title', 'Deactivate Stoic Dreams News');
        await expect(rows(page).nth(1).locator('.status')).toContainText('Inactive since');
        await expect(toggle(page, 1)).not.toHaveAttribute('enabled');
        await expect(toggle(page, 1)).toHaveAttribute('title', 'Reactivate Piano Tips');
    });

    test('turning one off deactivates it, and turning it on again reactivates it', async ({ page }) => {
        const calls = await api(page, { ...signedIn, 'user/subscriptions': json(subscriptions) });
        await addToPage(page, 'app-account-subscriptions');
        await toggle(page, 0).click();
        await expect(rows(page).nth(0).locator('.status')).toContainText('Inactive');
        await expect.poll(() => callsTo(calls, 'user/subscription')).toEqual([{ path: 'user/subscription', method: 'PATCH', body: { id: 'a1', active: false } }]);
        await expect(toggle(page, 0)).not.toHaveAttribute('enabled');
        await toggle(page, 0).click();
        await expect(rows(page).nth(0).locator('.status')).toContainText('Active');
        await expect.poll(() => callsTo(calls, 'user/subscription').map(c => c.body)).toEqual([{ id: 'a1', active: false }, { id: 'a1', active: true }]);
    });

    test('when the API refuses a change, the toggle goes back and the reason is shown', async ({ page }) => {
        await api(page, {
            ...signedIn,
            'user/subscriptions': json(subscriptions),
            'user/subscription': { status: 409, body: 'This newsletter no longer accepts your address.' },
        });
        await addToPage(page, 'app-account-subscriptions');
        await toggle(page, 1).click();
        await expect(page.locator('.webui-alerts-popup')).toContainText('This newsletter no longer accepts your address.');
        await expect(toggle(page, 1)).not.toHaveAttribute('enabled');
        await expect(rows(page).nth(1).locator('.status')).toContainText('Inactive');
    });

    test('writes names as text, never as HTML', async ({ page }) => {
        await api(page, { ...signedIn, 'user/subscriptions': json([{ id: 'x', type: 'newsletter', name: '<img src=x onerror="window.__hacked=1">News', company: '<b>Co</b>', status: 'active' }]) });
        await addToPage(page, 'app-account-subscriptions');
        await expect(rows(page).locator('strong')).toHaveText('<img src=x onerror="window.__hacked=1">News');
        await expect(rows(page).locator('.source')).toHaveText('Newsletter · <b>Co</b>');
        await expect(rows(page).locator('img, b')).toHaveCount(0);
        await expect.poll(() => page.evaluate(() => window.__hacked)).toBeUndefined();
    });

    test('says so when there are none, or when they cannot be loaded', async ({ page }) => {
        let answer = json([]);
        await api(page, { ...signedIn, 'user/subscriptions': () => answer });
        await addToPage(page, 'app-account-subscriptions');
        const message = page.locator('app-account-subscriptions .message');
        await expect(message).toContainText('You have no subscriptions yet.');
        answer = { status: 500, body: 'Something broke.' };
        await page.locator('app-account-subscriptions').evaluate(c => c.load());
        await expect(message).toHaveText('Something broke.');
        await expect(message).toHaveAttribute('error', '');
    });
});

test.describe('app-account-privacy', () => {
    const authorizations = [
        { id: 's1', kind: 'site', companyId: 'c1', company: 'Stoic Dreams', name: 'www.taskstory.com', authorizedAt: '2026-09-01T12:00:00Z', lastUsedAt: '2026-11-10T12:00:00Z', shares: ['Account ID'] },
        { id: 'p1', kind: 'app', companyId: 'c1', company: 'Stoic Dreams', name: 'Task Proxy', device: 'Work Laptop', authorizedAt: '2026-09-02T12:00:00Z' },
        { id: 's2', kind: 'site', companyId: 'c2', company: 'Other Co', name: 'www.example.com', authorizedAt: '2026-08-01T12:00:00Z' },
    ];
    const companies = page => page.locator('app-account-privacy section');
    const row = (page, name) => page.locator('app-account-privacy li', { has: page.locator('strong', { hasText: name }) });

    test('lists each company with the sites and apps it signs in, and what each can see', async ({ page }) => {
        await api(page, { ...signedIn, 'user/authorizations': json(authorizations) });
        await addToPage(page, 'app-account-privacy');
        await expect(companies(page).locator('h3')).toHaveText(['Stoic Dreams', 'Other Co']);
        await expect(companies(page).nth(0).locator('li strong')).toHaveText(['www.taskstory.com', 'Task Proxy']);
        await expect(row(page, 'www.taskstory.com').locator('.detail')).toContainText(['Website', 'Allowed', 'Can see: Account ID']);
        await expect(row(page, 'www.taskstory.com').locator('.detail').nth(1)).toContainText('Last signed in');
        await expect(row(page, 'Task Proxy').locator('.detail').first()).toHaveText('App on Work Laptop');
        await expect(row(page, 'Task Proxy').locator('webui-button')).toHaveAttribute('aria-label', 'Revoke sign-in for Task Proxy');
    });

    test('revoking asks first, then removes the site', async ({ page }) => {
        const calls = await api(page, { ...signedIn, 'user/authorizations': json(authorizations) });
        await addToPage(page, 'app-account-privacy');
        await row(page, 'www.example.com').locator('webui-button').click();
        await expect(dialog(page)).toContainText('Revoke sign-in for www.example.com?');
        await dialogButton(page, 'Confirm').click();
        await expect(row(page, 'www.example.com')).toHaveCount(0);
        await expect(companies(page).locator('h3')).toHaveText(['Stoic Dreams']);
        expect(callsTo(calls, 'user/authorization')).toEqual([{ path: 'user/authorization', method: 'DELETE', body: { id: 's2' } }]);
        await expect(page.locator('.webui-alerts-popup')).toContainText('Sign-in for www.example.com was revoked.');
    });

    test('cancelling leaves the site allowed', async ({ page }) => {
        const calls = await api(page, { ...signedIn, 'user/authorizations': json(authorizations) });
        await addToPage(page, 'app-account-privacy');
        await row(page, 'Task Proxy').locator('webui-button').click();
        await expect(dialog(page)).toContainText('Revoke sign-in for Task Proxy?');
        await dialogButton(page, 'Cancel').click();
        await expect(dialog(page)).toHaveCount(0);
        // Revoking another one goes through the same path, so once it is sent, the cancelled one would have been too.
        await row(page, 'www.example.com').locator('webui-button').click();
        await dialogButton(page, 'Confirm').click();
        await expect(row(page, 'www.example.com')).toHaveCount(0);
        expect(callsTo(calls, 'user/authorization').map(c => c.body)).toEqual([{ id: 's2' }]);
        await expect(row(page, 'Task Proxy')).toHaveCount(1);
    });

    test('when revoking fails, the site stays and the reason is shown', async ({ page }) => {
        await api(page, { ...signedIn, 'user/authorizations': json(authorizations), 'user/authorization': { status: 404, body: 'That sign-in was not found.' } });
        await addToPage(page, 'app-account-privacy');
        await row(page, 'www.example.com').locator('webui-button').click();
        await dialogButton(page, 'Confirm').click();
        await expect(page.locator('.webui-alerts-popup')).toContainText('That sign-in was not found.');
        await expect(row(page, 'www.example.com')).toHaveCount(1);
        await expect(row(page, 'www.example.com').locator('webui-button')).not.toHaveAttribute('disabled');
    });

    test('writes names as text, never as HTML, in the list and in the question', async ({ page }) => {
        const name = '<img src=x onerror="window.__hacked=1">evil.example';
        await api(page, { ...signedIn, 'user/authorizations': json([{ id: 'e', kind: 'site', company: '<b>Evil</b>', name }]) });
        await addToPage(page, 'app-account-privacy');
        await expect(page.locator('app-account-privacy h3')).toHaveText('<b>Evil</b>');
        await expect(page.locator('app-account-privacy li strong')).toHaveText(name);
        await page.locator('app-account-privacy li webui-button').click();
        await expect(dialog(page)).toContainText(`Revoke sign-in for ${name}?`);
        await expect(page.locator('app-account-privacy').locator('img, b')).toHaveCount(0);
        await expect(dialog(page).locator('img')).toHaveCount(0);
        await expect.poll(() => page.evaluate(() => window.__hacked)).toBeUndefined();
    });

    test('says so when nothing is allowed, or when the list cannot be loaded', async ({ page }) => {
        let answer = json([]);
        await api(page, { ...signedIn, 'user/authorizations': () => answer });
        await addToPage(page, 'app-account-privacy');
        const message = page.locator('app-account-privacy .message');
        await expect(message).toContainText('You have not signed in to any other sites or apps');
        answer = { status: 401, body: 'Please sign in.' };
        await page.locator('app-account-privacy').evaluate(c => c.load());
        await expect(message).toHaveText('Please sign in.');
    });
});

test('app-myfi-pricing-table lists the starter features and the add-ons', async ({ page }) => {
    await api(page);
    await openPage(page, '/');
    await page.evaluate(() => document.querySelector('webui-app main, main, body').append(document.createElement('app-myfi-pricing-table')));
    await expect.poll(() => page.evaluate(() => webui.getData('page-starter-pricing')?.length)).toBeGreaterThan(0);
    await expect.poll(() => page.evaluate(() => webui.getData('page-addon-pricing')?.length)).toBeGreaterThan(0);
    await expect(page.locator('app-myfi-pricing-table webui-table').first()).toContainText('Single User');
});
