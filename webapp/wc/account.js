
"use strict"
{
    webui.define("app-account", {
        watchVisibility: false,
        isInput: false,
        preload: '',
        constructor: (t) => {
            t.addEventListener('click', _ => {
                if (webui.isSignedIn) {
                    webui.openSharedDrawer(
                        'Account Panel',
                        `<app-account-sidebar></app-account-sidebar>`
                    );
                } else {
                    webui.navigateTo('signin');
                }
            });
            t._icon = t.template.querySelector('webui-icon');
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
        setupComponent: async function () {
            const t = this;
            t.render();
            t.addDataset('subscribe', 'session-user-role:render');
        },
        render: function () {
            const t = this;
            if (t._lastRender == webui.isSignedIn) return;
            let isSignedIn = webui.isSignedIn;
            t._lastRender = isSignedIn;
            if (isSignedIn) {
                t._icon.setAttribute('icon', 'account');
                t._icon.setAttribute('theme', 'success');
                t.setAttribute('title', 'Toggle Account Panel');
            } else {
                t._icon.setAttribute('icon', 'arrow-side-into-square|has-shadow:true|rotate:180');
                t._icon.setAttribute('theme', 'warning');
                t.setAttribute('title', 'Go to signin page');
            }
        },
        shadowTemplate: `
<webui-icon icon="arrow-side-into-square|has-shadow:true|rotate:180" fill></webui-icon>
<style type="text/css">
:host {
display:inline-flex;
cursor:pointer;
padding:1px;
align-items:center;
justify-content:center;
}
</style>
`
    });
}