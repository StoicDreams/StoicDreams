
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
</form>
`;
    let contentSignedIn = `
<webui-alert show severity="info">You are already signed in</webui-alert>
`;
    webui.define("app-signin", {
        watchVisibility: false,
        isInput: false,
        preload: '',
        constructor: (t) => {
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
        },
        render: function () {
            const t = this;
            if (webui.isSignedIn) {
                t.innerHTML = contentSignedIn;
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
                        let resp = undefined;
                        webui.fetchApi('auth/signin', jsonData)
                            .then(r => {
                                resp = r;
                                return resp.text();
                            })
                            .then(text => {
                                if (resp.status === 200) {
                                    webui.alert(text || 'Account successfully created', 'success');
                                    webui.navigateTo('/');
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