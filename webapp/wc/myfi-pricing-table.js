"use strict"
{
    const content = `
<webui-page-segment elevation="10">

We are still evaluating and finalizing our pricing models, but here are our current targets for how we expect to price our services.

All subscriptions will start with our Starter plan for $1.99 per month.

<webui-table theme="success" columns="Feature / Service;Details" class="mt-3 mb-3" bordered data-subscribe="page-starter-pricing:setData"></webui-table>

</webui-page-segment>

<webui-page-segment elevation="10">

Additional subscriptions services are optional and can be added on to your Starter plan.

<webui-table theme="success" columns="Feature / Service;Monthly Cost;Details" class="mt-3 mb-3" bordered data-subscribe="page-addon-pricing:setData"></webui-table>

We'd love to here your opinions regarding our target pricing models. Let us know what you think using our [feedback](#feedback) system.

</webui-page-segment>
`;
    webui.define("app-myfi-pricing-table", {
        content: true,
        watchVisibility: false,
        isInput: false,
        preload: '',
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
        connected() {
            this.setupComponent();
        },
        setupComponent() {
            const t = this;
            t.innerHTML = webui.parseWebuiMarkdown(content);
            webui.setData('page-starter-pricing', [
                {
                    'Feature / Service': 'Single User',
                    'Details': 'Sign-ins are only allowed through your owner account.'
                },
                {
                    'Feature / Service': 'Company Manager',
                    'Details': 'Define 1 or more Companies to organize and link services to.'
                },
                {
                    'Feature / Service': 'Domain Manager',
                    'Details': 'Connect your domains that will utilize My Fidelity services.'
                },
                {
                    'Feature / Service': 'Feedback Services',
                    'Details': 'Easily capture and manage feedback. Feedback automatically deletes after 30 days.'
                },
                {
                    'Feature / Service': 'Feedback Webhooks',
                    'Details': 'Define a webhook for each domain'
                },
                {
                    'Feature / Service': 'App Manager',
                    'Details': 'Define 1 or more Apps with optional domain linking for shared roles.'
                },
                {
                    'Feature / Service': 'User Manager',
                    'Details': 'Used for assigning and managing Privileged Users. Assign roles to users by email.'
                },
                {
                    'Feature / Service': 'Permissions Manager',
                    'Details': 'User for managing permissions assigned to Roles.'
                }
            ]);
            webui.setData('page-addon-pricing', [
                {
                    'Feature / Service': 'Advanced Feedback Services',
                    'Monthly Cost': '$5.99 per domain',
                    'Details': 'Feedback is archived indefinitely instead of deleted.'
                },
                {
                    'Feature / Service': 'General Users (Unprivileged)',
                    'Monthly Cost': '$3.99 per domain',
                    'Details': 'Unlimited user sign-ins. All signed-in users are assigned a User role. No other role assignments allowed.'
                },
                {
                    'Feature / Service': 'Privileged Users',
                    'Monthly Cost': '$0.10 per user',
                    'Details': 'Users with assigned roles beyond User.'
                }
            ]);
        },
    });
}