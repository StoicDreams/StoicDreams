"use strict"
{
    let content = `
<form id="passwordreset">
<webui-input-text theme="primary" name="password" type="password" label="Password"></webui-input-text>
<webui-input-text theme="primary" name="confirmPassword" type="password" label="Confirm Password"></webui-input-text>
<webui-flex justify="end" align="center" class="pa-3">
    <webui-button type="submit" theme="primary" start-icon="confirm">Reset Password</webui-button>
</webui-flex>
<webui-alert severity="danger"></webui-alert>
</form>
`;
    webui.define("app-passwordreset", {
        content: true,
        watchVisibility: false,
        isInput: false,
        preload: '',
        constructor: (t) => { },
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
        },
        disconnected: function (t) { },
        reconnected: function (t) { },
        setupComponent: function () {
            const t = this;
            t.innerHTML = content;
            let form = t.querySelector('#passwordreset');
            let alert = t.querySelector('webui-alert');
            form.addEventListener('submit', ev => {
                ev.stopPropagation();
                ev.preventDefault();
                alert.setValue();
                const formData = new FormData(form);
                const jsonData = Object.fromEntries(formData);
                jsonData.token = location.pathname.split('/').pop();
                try {
                    webui.fromBase64(jsonData.token);
                } catch {
                    alert.setValue('Invalid token');
                    return;
                }
                if (!jsonData.token) {
                    alert.setValue('Missing expected token');
                    return;
                }
                if (!jsonData.password) {
                    alert.setValue('Password is required');
                    return;
                }
                if (!jsonData.confirmPassword) {
                    alert.setValue('Please confirm your password');
                    return;
                }
                if (jsonData.password !== jsonData.confirmPassword) {
                    alert.setValue('Password and Confirm Password do not match');
                    return;
                }
                let resp = undefined;
                webui.fetchApi('user/confirm/passwordreset', jsonData)
                    .then(r => {
                        resp = r;
                        return resp.text();
                    })
                    .then(text => {
                        if (resp.status === 200) {
                            webui.alert(text || 'Password was successfully reset. You may now sign-in with your email and password.', 'success');
                            webui.navigateTo('/signin');
                        } else {
                            alert.setValue(text || 'Failed to finish update password. Please wait a moment and try again.');
                        }
                    }).catch(ex => {
                        alert.setValue(`Error: ${ex}`);
                    });
                return false;
            });
        },
    });
}