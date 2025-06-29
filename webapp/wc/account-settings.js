
"use strict"
{
    const content = `
<webui-input-range name="autosignout" data-subscribe="session-autosignout:setValue" data-trigger="session-autosignout" label="Inactivity Signout" title="Minutes of inactivity to auto-sign-out" min="5" step="5" max="2880" onrender="webui.displayMinutes"></webui-input-range>
`;
    webui.define("app-account-settings", {
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
            const autoSignout = t.querySelector('[name="autosignout"]');
            let cookieAge = webui.getData('session-autosignout') || 30;
            let latestUpdate = cookieAge;
            autoSignout.addEventListener('change', _ => {
                let value = autoSignout.value;
                latestUpdate = value;
                if (value === cookieAge) return;
                setTimeout(() => {
                    if (value !== latestUpdate) return;
                    cookieAge = webui.getData('session-autosignout');
                    if (cookieAge !== value) return;
                    webui.fetchApi('cookie/age');
                }, 600);
            });
        },
    });
}
