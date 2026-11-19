<webui-data data-page-title="My Account" data-page-subtitle=""></webui-data>

<webui-tabs pad="var(--padding)" vertical transition-timing="200" data-subscribe="session-account-user-tab-index:setTab">
    <webui-button align="left" slot="tabs">Session</webui-button>
    <webui-content slot="content" src="/d/content/account/session.md"></webui-content>
    <webui-button align="left" slot="tabs">Subscriptions</webui-button>
    <webui-content slot="content" src="/d/content/account/subscriptions.md"></webui-content>
    <webui-button align="left" slot="tabs">Security / Privacy</webui-button>
    <webui-content slot="content" src="/d/content/account/privacy.md"></webui-content>
</webui-tabs>
