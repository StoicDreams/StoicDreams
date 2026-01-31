"use strict"
{
    let contentChangePassword = `
<webui-input-text theme="secondary" name="old_password" type="password" label="Old Password" autofocus></webui-input-text>
<webui-input-text theme="primary" name="new_password" type="password" label="New Password"></webui-input-text>
<webui-input-text theme="primary" name="confirm_password" type="password" label="Confirm Password"></webui-input-text>
<webui-alert severity="danger"></webui-alert>
`;
    webui.define("app-account-sidebar", {
        content: true,
        watchVisibility: false,
        isInput: false,
        preload: 'flex button',
        constructor() {
            const t = this;
            t._btnUpdatePassword = t.template.querySelector('[name="passwordupdate"]');
            t._btnSignout = t.template.querySelector('[name="signout"]');
            t._btnUpdatePassword.addEventListener('click', _ => {
                webui.dialog({
                    title: 'Change Password',
                    minWidth: '80%',
                    content: contentChangePassword,
                    confirm: 'Request Password Reset Email',
                    cancel: 'Cancel',
                    onconfirm: async (data, content) => {
                        const jsonData = Object.fromEntries(data);
                        let alert = content.querySelector('webui-alert');
                        if (!jsonData.old_password) {
                            alert.setValue('Please enter your old password');
                            return false;
                        }
                        if (!jsonData.new_password) {
                            alert.setValue('Please enter a new password');
                            return false;
                        }
                        if (jsonData.new_password.trim().length < 20) {
                            alert.setValue('Passwords must be at least 20 characters in length');
                            return false;
                        }
                        if (jsonData.new_password !== jsonData.confirm_password) {
                            alert.setValue('Confirm and New passwords do not match');
                            return false;
                        }
                        let result = await webui.fetchApi('user/password', jsonData, 'PATCH');
                        if (result.status === 200) {
                            webui.alert('Your password has been updated.', 'success');
                            return true;
                        }
                        let message = await result.text();
                        alert.setValue(message || 'An unexpected error happened. Please wait a moment and try again.');
                        return false;
                    }
                });
            });
            t._btnSignout.addEventListener('click', async _ => {
                await webui.fetchApi('user/signout');
                await webui.loadRoles();
                webui.closeSharedDrawer();
                webui.alert('You have been signed out.', 'success');
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
        shadowTemplate: `
<webui-flex grow></webui-flex>
<webui-button name="myaccount" href="/account" theme="info">My Account</webui-button>
<webui-button name="passwordupdate" theme="warning">Change Password</webui-button>
<webui-button name="signout" theme="danger">Sign-Out</webui-button>
<style type="text/css">
:host {
display:flex;
flex-direction:column;
gap:var(--padding);
height:100%;
overflow: auto;
}
</style>
`
    });
}