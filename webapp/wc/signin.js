
"use strict"
{
    let contentSignin = `
<form id="signinform">
<webui-tabs theme="secondary" index="1" transition-timing="200" data-subscribe="session-signin-tab-index:setTab">
    <webui-button align="left" slot="tabs">Sign-In</webui-button>
    <webui-content slot="content" src="/d/en-US/forms/signin.md" theme="default"></webui-content>
    <webui-button align="left" slot="tabs">Create Account</webui-button>
    <webui-content slot="content" src="/d/en-US/forms/create-account.md" theme="default"></webui-content>
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
<webui-content slot="content" src="/d/en-US/forms/signin-domain.md" theme="default"></webui-content>
<webui-alert severity="danger"></webui-alert>
</form>
`;
    let contentForgotPassword = `
<p>Confirm your email for your account. If your email matches an active account sign-in email we will send you an email with a link to reset your password.</p>
<webui-input-text theme="primary" name="email" label="Email" autofocus></webui-input-text>
<webui-alert severity="danger"></webui-alert>
`;

    webui.define("app-signin", {
        watchVisibility: false,
        isInput: false,
        preload: '',
        constructor: (t) => {
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
        attrChanged: (t, property, value) => {
            switch (property) {
                case 'height':
                    t.style.height = webui.pxIfNumber(value);
                    break;
                case 'maxHeight':
                    t.style.maxHeight = webui.pxIfNumber(value);
                    break;
            }
        },
        connected: function (t) {
            t.setupComponent();
            t.addDataset('subscribe', 'session-user-role:render');
        },
        disconnected: function (t) { },
        reconnected: function (t) { },
        setupComponent: function () {
            const t = this;
            t.render();
            if (webui.getData('session-autosignout') === undefined) {
                webui.setData('session-autosignout', 30);
            }
        },
        render: function () {
            const t = this;
            let domain = webui.getQueryData('domain');
            if (webui.isSignedIn) {
                if (domain && domain.length > 4 && domain.indexOf('.') !== -1) {
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
                                    if (window.self !== window.top || !document.referrer) {
                                        webui.alert(text || 'Success', 'success');
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
                t.innerHTML = contentSignin;
                let form = t.querySelector('#signinform');
                let alert = t.querySelector('webui-alert');
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
                                        if (!domain || domain.length < 4) {
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