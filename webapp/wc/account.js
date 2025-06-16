
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
                        `<webui-alert variant="info" show>Coming Soon!</webui-alert>`
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
            let resp = await webui.fetchApi('/user/roles', null, 'get');
            if (resp.status === 200) {
                let roles = parseInt(await resp.text());
                if (roles > 0) {
                    webui.setData('session-user-role', roles);
                }
            }
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
                t._icon.setAttribute('icon', 'signin');
                t._icon.setAttribute('theme', 'warning');
                t.setAttribute('title', 'Go to signin page');
            }
        },
        shadowTemplate: `
<webui-icon icon="signin" fill></webui-icon>
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