
"use strict"
{
    let contentSignin = `
<form id="signinform">
<webui-tabs theme="secondary" index="1" transition-timing="200" data-subscribe="session-signin-tab-index:setTab">
    <webui-button align="left" slot="tabs">Sign-In</webui-button>
    <webui-content slot="content" src="/d/forms/signin.md" theme="default"></webui-content>
    <webui-button align="left" slot="tabs">Create Account</webui-button>
    <webui-content slot="content" src="/d/forms/create-account.md" theme="default"></webui-content>
</webui-tabs>
<webui-alert severity="danger"></webui-alert>
<webui-quote theme="info">
${webui.parseWebuiMarkdown("Not using a password manager? We recommend using [bitWarden](https://bitwarden.com/) for securely storing, managing, and sharing sensitive information such as passwords, passkeys, and credit cards.")}
</webui-quote>
<webui-myfi-storage-consent></webui-myfi-storage-consent>
</form>
`;
    let contentSignedIn = `
<webui-alert show severity="info">You are already signed in</webui-alert>
<webui-input-range name="autosignout" data-subscribe="session-autosignout:setValue" data-trigger="session-autosignout" label="Inactivity Signout" title="Minutes of inactivity to auto-sign-out" min="5" step="5" max="2880"></webui-input-range>
`;
    let contentSignInDomain = `
<form id="signindomain">
<webui-content slot="content" src="/d/forms/signin-domain.md" theme="default"></webui-content>
<webui-alert severity="danger"></webui-alert>
</form>
`;
    // An installed app, such as Task Proxy, asking to be signed in. The app shows the same code, so the visitor can
    // check this is the sign-in they started. Any company can add an app on www.myfi.ws, so the company that publishes it
// is named too. The names come from the API and are set as text.
    let contentSignInApp = `
<h2>Approve a Sign-In</h2>
<webui-page-segment elevation="10" class="app-signin-details" hidden>
<p><strong class="app-signin-app"></strong>, from <strong class="app-signin-company"></strong>, on <strong class="app-signin-name"></strong> is asking to sign in to your account.</p>
<p>Approve it only if you started this sign-in, and the app shows this code:</p>
<p class="app-signin-code" style="font-size:2em;font-family:monospace;letter-spacing:0.15em;text-align:center;margin:0.5em 0;"></p>
</webui-page-segment>
<webui-flex justify="end" align="center" gap="var(--padding)" class="pa-3 app-signin-actions" hidden>
    <webui-button theme="secondary" start-icon="xmark" class="app-signin-refuse">Refuse</webui-button>
    <webui-button theme="primary" start-icon="check" class="app-signin-approve">Approve Sign-In</webui-button>
</webui-flex>
<webui-alert severity="danger"></webui-alert>
`;
    let contentSignInAppSignedOut = `
<webui-alert show severity="info">Sign in to approve the app that sent you here.</webui-alert>
`;
    let contentForgotPassword = `
<p>Confirm your email for your account. If your email matches an active account sign-in email we will send you an email with a link to reset your password.</p>
<webui-input-text theme="primary" name="email" label="Email" autofocus></webui-input-text>
<webui-alert severity="danger"></webui-alert>
`;

    // The domain comes from the address, so only a plain host name such as example.com is shown or signed in to.
    function isHostName(domain) {
        return typeof domain === 'string' && /^(?=.{5,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(domain);
    }
    // An app's sign-in request, from ?app=...&request=..., as made by api.myfi.ws's user/signin/app/start.
    function getAppRequest() {
        const request = webui.getQueryData('request');
        if (!webui.getQueryData('app')) return null;
        return typeof request === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(request) ? request : null;
    }

    webui.define("app-signin", {
        watchVisibility: false,
        isInput: false,
        preload: '',
        constructor() {
            const t = this;
            t.addEventListener('click', ev => {
                let forgotPassword = webui.closest(ev.target, '[name="forgotpassword"]');
                if (!forgotPassword) return;
                webui.dialog({
                    title: 'Reset Password',
                    minWidth: '80%',
                    content: contentForgotPassword,
                    confirm: 'Request Password Reset Email',
                    cancel: 'Cancel',
                    onconfirm: async (data, content) => {
                        const jsonData = Object.fromEntries(data);
                        let alert = content.querySelector('webui-alert');
                        if (!jsonData.email) {
                            alert.setValue('Please enter your email used for your account login');
                            return false;
                        }
                        let result = await webui.fetchApi('user/forgotpassword', jsonData);
                        if (result.status === 200) {
                            return true;
                        }
                        let message = await result.text();
                        alert.setValue(message || 'An unexpected error happened. Please wait a moment and try again.');
                        return false;
                    }
                });
            });
        },
        flags: [],
        attr: ['height', 'max-height'],
        attrChanged(property, value) {
            const t = this;
            switch (property) {
                case 'height':
                    t.style.height = webui.pxIfNumber(value);
                    break;
                case 'maxHeight':
                    t.style.maxHeight = webui.pxIfNumber(value);
                    break;
            }
        },
        connected() {
            const t = this;
            t.setupComponent();
            t.addDataset('subscribe', 'session-user-role:render');
        },
        setupComponent() {
            const t = this;
            t.render();
            if (webui.getData('session-autosignout') === undefined) {
                webui.setData('session-autosignout', 30);
            }
        },
        /** Asks the signed-in visitor to approve or refuse an app's sign-in, after checking its code. */
        async renderAppSignin(request) {
            const t = this;
            // The component renders again when the roles load, so only the latest render carries on after the request.
            const run = t._renders;
            t.innerHTML = contentSignInApp;
            const details = t.querySelector('.app-signin-details');
            const actions = t.querySelector('.app-signin-actions');
            const alert = t.querySelector('webui-alert');
            // The API can answer before webui-alert has loaded from the CDN.
            const setAlert = async (text, variant) => {
                await customElements.whenDefined('webui-alert');
                alert.setValue({ text }, variant);
            };
            const showOnly = (text, variant) => {
                details.remove();
                actions.remove();
                return setAlert(text, variant);
            };
            const ask = async (method, url, data) => {
                try {
                    const resp = await webui.fetchApi(url, data, method);
                    return { ok: resp.status === 200, text: await resp.text() };
                } catch (ex) {
                    return { ok: false, text: `Error: ${ex}` };
                }
            };
            const shown = await ask('get', `user/signin/app?request=${encodeURIComponent(request)}`);
            if (run !== t._renders || !t.isConnected) return;
            let info = null;
            try { info = shown.ok ? JSON.parse(shown.text) : null; } catch { }
            if (!info?.code) {
                showOnly(shown.text || 'This sign-in could not be found. Start signing in again from the app.', 'danger');
                return;
            }
            t.querySelector('.app-signin-app').textContent = info.app || 'An app';
            t.querySelector('.app-signin-company').textContent = info.company || 'an unknown company';
            t.querySelector('.app-signin-name').textContent = info.name || 'a computer';
            t.querySelector('.app-signin-code').textContent = info.code;
            details.hidden = false;
            actions.hidden = false;
            let busy = false;
            const answer = async (approve) => {
                if (busy) return;
                busy = true;
                const result = approve
                    ? await ask('post', 'user/signin/app/approve', { request })
                    : await ask('delete', 'user/signin/app', { request });
                busy = false;
                if (result.ok) {
                    showOnly(approve ? (result.text || 'The app is signed in. You can close this page.') : 'The sign-in was refused, and the app was told. You can close this page.', approve ? 'success' : 'info');
                } else {
                    setAlert(result.text || 'Something went wrong. Please wait a moment and try again.', 'danger');
                }
            };
            t.querySelector('.app-signin-approve').addEventListener('click', () => answer(true));
            t.querySelector('.app-signin-refuse').addEventListener('click', () => answer(false));
        },
        render() {
            const t = this;
            t._renders = (t._renders || 0) + 1;
            let domain = webui.getQueryData('domain');
            const appRequest = getAppRequest();
            if (webui.isSignedIn && appRequest) {
                t.renderAppSignin(appRequest);
            } else if (webui.isSignedIn) {
                if (isHostName(domain)) {
                    webui.setData('page-domain', domain.replace('.', '&#8203;.'));
                    t.innerHTML = contentSignInDomain;
                    let form = t.querySelector('#signindomain');
                    let alert = t.querySelector('webui-alert');
                    form.addEventListener('submit', ev => {
                        ev.stopPropagation();
                        ev.preventDefault();
                        const data = {
                            'signin_domain': domain
                        };
                        let resp = undefined;
                        webui.fetchApi('user/signin/domain', data)
                            .then(r => {
                                resp = r;
                                return resp.text();
                            })
                            .then(async text => {
                                if (resp.status === 200) {
                                    // The API answers with a one-time code that the site exchanges for its own session,
                                    // because browsers keep the API's cookie for each site separately.
                                    // Older API versions answered with only a message.
                                    let message = text;
                                    let code = '';
                                    try {
                                        const json = JSON.parse(text);
                                        message = json.message || '';
                                        code = json.code || '';
                                    } catch { }
                                    if (window.self !== window.top) {
                                        webui.alert(webui.escapeHtml(message || 'Success'), 'success');
                                    } else if (code) {
                                        // The site needs the code to sign in, so go there even when no referrer says where the visitor came from.
                                        location.href = `https://${domain}/#myfi-signin=${encodeURIComponent(code)}`;
                                    } else if (!document.referrer) {
                                        webui.alert(webui.escapeHtml(message || 'Success'), 'success');
                                    } else {
                                        location.href = `https://${domain}`;
                                    }
                                } else {
                                    alert.setValue(text || `An unknown error occurred signing you in to ${domain}`);
                                }
                            }).catch(ex => {
                                alert.setValue(`Error: ${ex}`);
                            });
                    });
                } else {
                    t.innerHTML = contentSignedIn;
                }
            } else {
                t.innerHTML = (appRequest ? contentSignInAppSignedOut : '') + contentSignin;
                let form = t.querySelector('#signinform');
                let alert = form.querySelector(':scope > webui-alert');
                form.addEventListener('submit', ev => {
                    const isSignin = webui.getData('session-signin-tab-index') === 0;
                    ev.stopPropagation();
                    ev.preventDefault();
                    const formData = new FormData(form);
                    const jsonData = Object.fromEntries(formData);
                    if (!jsonData.email) {
                        alert.setValue('Email is required');
                        return;
                    }
                    if (isSignin) {
                        if (!jsonData.password) {
                            alert.setValue('Password is required');
                            return;
                        }
                        delete jsonData['x-cookie-age'];
                        let resp = undefined;
                        webui.fetchApi('user/signin', jsonData)
                            .then(r => {
                                resp = r;
                                return resp.text();
                            })
                            .then(async text => {
                                if (resp.status === 200) {
                                    await webui.fetchApi('cookie/age');
                                    await webui.loadRoles();
                                    if (webui.hasRole(1)) {
                                        if (text) {
                                            webui.alert(text, 'success');
                                        }
                                        // Signing in to approve a site or an app stays here, which then asks to approve it.
                                        if (!appRequest && (!domain || domain.length < 4)) {
                                            webui.navigateTo('/');
                                        }
                                    } else {
                                        alert.setValue('An issue occurred signing you in. Please wait a moment and try again.');
                                    }
                                } else {
                                    alert.setValue(text || 'Invalid credentials');
                                }
                            }).catch(ex => {
                                alert.setValue(`Error: ${ex}`);
                            });
                    } else {
                        let resp = undefined;
                        webui.fetchApi('user/create', jsonData)
                            .then(r => {
                                resp = r;
                                return resp.text();
                            })
                            .then(text => {
                                webui.alert(text || 'Account successfully created', resp.status === 409 ? 'warning' : resp.status > 400 ? 'danger' : 'success');
                            }).catch(ex => {
                                alert.setValue(`Error: ${ex}`);
                            });
                    }
                    return false;
                });
            }
        }
    });
}