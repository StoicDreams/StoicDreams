"use strict"
{
    // The companies, websites, and apps this account has allowed to sign in with it, grouped by company, with what
    // each one may see. Names come from other companies, so every value from the API is written as text, never as HTML.
    const formatDate = value => {
        const date = value ? new Date(value) : null;
        return date && !isNaN(date) ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    };
    const text = (tag, value, className) => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        el.textContent = value;
        return el;
    };
    webui.define("app-account-privacy", {
        preload: 'button',
        constructor() {
            const t = this;
            t._message = t.template.querySelector('.message');
            t._list = t.template.querySelector('.companies');
        },
        connected() {
            this.load();
        },
        async load() {
            const t = this;
            t._list.replaceChildren();
            t.showMessage('Loading the sites and apps you sign in to...');
            let resp;
            try {
                resp = await webui.fetchApi('user/authorizations', null, 'get');
            } catch (ex) {
                t.showMessage('Your sign-in authorizations could not be loaded. Please try again later.', true);
                return;
            }
            const body = await resp.text();
            if (resp.status !== 200) {
                t.showMessage(body || 'Your sign-in authorizations could not be loaded. Please try again later.', true);
                return;
            }
            let rows = [];
            try { rows = JSON.parse(body); } catch { }
            if (!Array.isArray(rows)) rows = [];
            t._rows = rows;
            t.render();
        },
        render() {
            const t = this;
            const rows = t._rows || [];
            t._list.replaceChildren();
            if (!rows.length) {
                t.showMessage('You have not signed in to any other sites or apps with this account.');
                return;
            }
            t.showMessage('');
            const companies = new Map();
            rows.forEach(row => {
                const key = row.companyId ?? row.company ?? '';
                if (!companies.has(key)) companies.set(key, { name: row.company || 'Unknown company', rows: [] });
                companies.get(key).rows.push(row);
            });
            const sections = document.createDocumentFragment();
            companies.forEach(company => {
                const section = document.createElement('section');
                section.appendChild(text('h3', company.name));
                const list = document.createElement('ul');
                company.rows.forEach(row => list.appendChild(t.buildRow(row)));
                section.appendChild(list);
                sections.appendChild(section);
            });
            t._list.appendChild(sections);
        },
        showMessage(value, isError) {
            const t = this;
            t._message.textContent = value;
            t._message.hidden = !value;
            t._message.toggleAttribute('error', !!isError);
        },
        buildRow(row) {
            const t = this;
            const name = `${row.name || 'Unknown'}`;
            const item = document.createElement('li');
            const info = document.createElement('div');
            info.appendChild(text('strong', name));
            const kind = row.kind === 'app'
                ? `App${row.device ? ` on ${row.device}` : ''}`
                : 'Website';
            info.appendChild(text('span', kind, 'detail'));
            const dates = [];
            const authorized = formatDate(row.authorizedAt);
            const used = formatDate(row.lastUsedAt);
            if (authorized) dates.push(`Allowed ${authorized}`);
            if (used) dates.push(`Last signed in ${used}`);
            if (dates.length) info.appendChild(text('span', dates.join(' · '), 'detail'));
            const shares = Array.isArray(row.shares) && row.shares.length ? row.shares : ['Account ID'];
            info.appendChild(text('span', `Can see: ${shares.join(', ')}`, 'detail'));
            const revoke = document.createElement('webui-button');
            revoke.setAttribute('theme', 'danger');
            revoke.setAttribute('start-icon', 'key|ban');
            revoke.setAttribute('aria-label', `Revoke sign-in for ${name}`);
            revoke.textContent = 'Revoke';
            revoke.addEventListener('click', _ => t.confirmRevoke(row, name, revoke));
            item.append(info, revoke);
            return item;
        },
        confirmRevoke(row, name, button) {
            const t = this;
            const safeName = webui.escapeHtml(name);
            webui.dialog.confirm(
                `<p>Revoke sign-in for <strong>${safeName}</strong>?</p><p>You are signed out there now, and you are asked to allow it again the next time you sign in to it.</p>`,
                async () => {
                    button.setAttribute('disabled', '');
                    let message = '';
                    try {
                        const resp = await webui.fetchApi('user/authorization', { id: row.id }, 'DELETE');
                        if (resp.status === 200) {
                            t._rows = (t._rows || []).filter(r => r !== row);
                            t.render();
                            webui.alert(`Sign-in for ${safeName} was revoked.`, 'success');
                            return true;
                        }
                        message = await resp.text();
                    } catch (ex) { }
                    button.removeAttribute('disabled');
                    webui.alert(webui.escapeHtml(message || `Sign-in for ${name} could not be revoked. Please try again later.`), 'warning');
                    return true;
                }
            ).catch(() => {
                // Cancelling rejects the dialog's promise, and leaves the site allowed.
            });
        },
        shadowTemplate: `
<p class="intro">The sites and apps you have allowed to sign in with your Stoic Dreams account, by the company that runs them, and what each can see about you. Revoke one to sign out of it and stop it from signing you in until you allow it again.</p>
<p class="message" hidden></p>
<div class="companies"></div>
<style type="text/css">
:host { display:block; }
.intro { margin-top:0; }
.message[error] { color:var(--color-danger, inherit); }
.companies { display:flex; flex-direction:column; gap:calc(2 * var(--padding, 1em)); }
h3 { margin:0 0 0.5em; }
ul { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:var(--padding, 1em); }
li { display:flex; align-items:center; justify-content:space-between; gap:var(--padding, 1em); padding:var(--padding, 1em); border-radius:var(--corners, 4px); background-color:var(--color-surface, rgb(127 127 127 / 10%)); }
li > div { display:flex; flex-direction:column; gap:0.2em; min-width:0; }
.detail { opacity:0.8; font-size:0.9em; overflow-wrap:anywhere; }
</style>
`
    });
}
