"use strict"
{
    webui.define("app-account-sidebar", {
        content: true,
        watchVisibility: false,
        isInput: false,
        preload: 'flex button',
        constructor: (t) => {
            t._btnSignout = t.template.querySelector('[name="signout"]');
            t._btnSignout.addEventListener('click', async _ => {
                await webui.fetchApi('user/signout');
                await webui.loadRoles();
                webui.closeSharedDrawer();
                webui.alert('You have been signed out.', 'success');
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
        },
        disconnected: function (t) { },
        reconnected: function (t) { },
        setupComponent: function () {
            const t = this;
        },
        shadowTemplate: `
<webui-flex grow></webui-flex>
<webui-button name="signout">Sign-Out</webui-button>
<style type="text/css">
:host {
display:flex;
flex-direction:column;
height:100%;
overflow: auto;
}
</style>
`
    });
}