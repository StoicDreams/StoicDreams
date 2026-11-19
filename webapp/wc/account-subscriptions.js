"use strict"
{
    // Every subscription on the account (newsletters today, paid services later), from any company or site.
    // Names come from other companies, so every value from the API is written as text, never as HTML.
    const kinds = { newsletter: 'Newsletter', service: 'Service' };
    const formatDate = value => {
        const date = value ? new Date(value) : null;
        return date && !isNaN(date) ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    };
    webui.define("app-account-subscriptions", {
        preload: 'toggle-icon',
        constructor() {
            const t = this;
            t._message = t.template.querySelector('.message');
            t._list = t.template.querySelector('ul');
        },
        connected() {
            this.load();
        },
        async load() {
            const t = this;
            t._list.replaceChildren();
            t.showMessage('Loading your subscriptions...');
            let resp;
            try {
                resp = await webui.fetchApi('user/subscriptions', null, 'get');
            } catch (ex) {
                t.showMessage('Your subscriptions could not be loaded. Please try again later.', true);
                return;
            }
            const text = await resp.text();
            if (resp.status !== 200) {
                t.showMessage(text || 'Your subscriptions could not be loaded. Please try again later.', true);
                return;
            }
            let rows = [];
            try { rows = JSON.parse(text); } catch { }
            if (!Array.isArray(rows)) rows = [];
            if (!rows.length) {
                t.showMessage('You have no subscriptions yet. When you sign up for a newsletter or service on any site that uses Stoic Dreams accounts, it is listed here.');
                return;
            }
            t.showMessage('');
            const items = document.createDocumentFragment();
            rows.forEach(row => items.appendChild(t.buildRow(row)));
            t._list.appendChild(items);
        },
        showMessage(text, isError) {
            const t = this;
            t._message.textContent = text;
            t._message.hidden = !text;
            t._message.toggleAttribute('error', !!isError);
        },
        buildRow(row) {
            const t = this;
            const name = `${row.name || 'Subscription'}`;
            const item = document.createElement('li');
            const info = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = name;
            const source = document.createElement('span');
            source.className = 'source';
            source.textContent = [kinds[row.type] || '', row.company, row.domain].filter(v => v).join(' · ');
            const status = document.createElement('span');
            status.className = 'status';
            const toggle = document.createElement('webui-toggle-icon');
            toggle.setAttribute('theme-on', 'success');
            toggle.setAttribute('title-on', `Deactivate ${name}`);
            toggle.setAttribute('title-off', `Reactivate ${name}`);
            let active = row.status === 'active';
            const showStatus = () => {
                const since = formatDate(active ? row.subscribedAt : row.endedAt);
                status.textContent = active
                    ? `Active${since ? ` since ${since}` : ''}`
                    : `Inactive${since ? ` since ${since}` : ''}`;
                item.toggleAttribute('inactive', !active);
            };
            toggle.setValue(active);
            showStatus();
            let busy = false;
            toggle.addEventListener('change', async _ => {
                const wanted = !!toggle.value;
                if (busy || wanted === active) return;
                busy = true;
                toggle.setAttribute('disabled', '');
                let message = '';
                try {
                    const resp = await webui.fetchApi('user/subscription', { id: row.id, active: wanted }, 'PATCH');
                    if (resp.status === 200) {
                        active = wanted;
                        if (active) row.subscribedAt = new Date().toISOString(); else row.endedAt = new Date().toISOString();
                    } else {
                        message = await resp.text();
                    }
                } catch (ex) {
                    message = '';
                }
                if (active !== wanted) {
                    webui.alert(webui.escapeHtml(message || `${name} could not be changed. Please try again later.`), 'warning');
                }
                // Puts the toggle back when the change failed. Its change event returns above, since it matches.
                toggle.setValue(active);
                showStatus();
                toggle.removeAttribute('disabled');
                busy = false;
            });
            info.append(title, source, status);
            item.append(info, toggle);
            return item;
        },
        shadowTemplate: `
<p class="intro">Every newsletter and service you subscribe to with this account, on any site. Turn one off to stop it, and back on to start it again.</p>
<p class="message" hidden></p>
<ul></ul>
<style type="text/css">
:host { display:block; }
.intro { margin-top:0; }
.message[error] { color:var(--color-danger, inherit); }
ul { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:var(--padding, 1em); }
li { display:flex; align-items:center; justify-content:space-between; gap:var(--padding, 1em); padding:var(--padding, 1em); border-radius:var(--corners, 4px); background-color:var(--color-surface, rgb(127 127 127 / 10%)); }
li > div { display:flex; flex-direction:column; gap:0.2em; min-width:0; }
.source, .status { opacity:0.8; font-size:0.9em; overflow-wrap:anywhere; }
li[inactive] strong { opacity:0.7; }
</style>
`
    });
}
