/* Template for Web UI components. */
"use strict"
{
    webui.define("app-template", {
        content: true,
        watchVisibility: false,
        isInput: false,
        preload: '',
        constructor: (t) => { },
        props: {
            'sample': {
                get() { return this._sample; },
                set(v) { this._sample = v; }
            }
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
    });
}
/* Template for Web UI components. */
"use strict"
{
    webui.define("app-shadow-template", {
        content: true,
        linkCss: false,
        watchVisibility: false,
        isInput: false,
        preload: '',
        constructor: (t) => {
            t._slotMain = t.template.querySelector('slot:not([name])');
            t._slotSomething = t.template.querySelector('slot[name="something"]');
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
<slot></slot>
<slot name="something"></slot>
<style type="text/css">
:host {
}
</style>
`
    });
}
