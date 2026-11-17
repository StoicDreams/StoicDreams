/* Cards for Stoic Dreams sites, read from a card JSON file in webapp/cards: each item's name, avatar (logo), link,
 * body, and optional image (a screenshot shown at the top of the card).
 * <app-site-cards src="/cards/products.json"></app-site-cards>
 *     A grid of cards, each a single link with the screenshot, logo, name, body text, and "Learn more".
 * <app-site-cards src="/cards/projects.json" compact></app-site-cards>
 *     A row of small links, each just the logo and name.
 * Text is set with textContent, never as HTML.
 */
"use strict"
{
    function isExternal(link) {
        try { return new URL(link, location.href).origin !== location.origin; } catch { return false; }
    }

    webui.define('app-site-cards', {
        attr: ['src'],
        flags: ['compact'],
        constructor() {
            const t = this;
            t._list = t.template.querySelector('ul');
        },
        attrChanged(property, value) {
            const t = this;
            switch (property) {
                case 'src':
                    t.loadCards(value);
                    break;
                case 'compact':
                    t.buildCards();
                    break;
            }
        },
        async loadCards(src) {
            const t = this;
            t._items = [];
            if (!src) { t.buildCards(); return; }
            try {
                const response = await fetch(src);
                const items = response.ok ? await response.json() : [];
                if (src !== t.src) return;
                t._items = Array.isArray(items) ? items : [];
            } catch (error) {
                t._items = [];
            }
            t.buildCards();
        },
        buildCards() {
            const t = this;
            const items = t._items || [];
            const fragment = document.createDocumentFragment();
            for (const item of items) {
                if (!item || !item.name) continue;
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.className = 'card';
                if (item.link) {
                    a.href = item.link;
                    if (isExternal(item.link)) a.rel = 'noopener';
                }
                if (!t.compact && item.image) {
                    const shot = document.createElement('div');
                    shot.className = 'shot';
                    const img = document.createElement('img');
                    img.src = item.image;
                    img.alt = '';
                    img.loading = 'lazy';
                    img.decoding = 'async';
                    shot.appendChild(img);
                    a.appendChild(shot);
                }
                const name = document.createElement(t.compact ? 'span' : 'h3');
                name.className = 'name';
                if (item.avatar) {
                    const logo = document.createElement('img');
                    logo.src = item.avatar;
                    logo.alt = '';
                    logo.loading = 'lazy';
                    name.appendChild(logo);
                }
                name.appendChild(document.createTextNode(item.name));
                a.appendChild(name);
                if (!t.compact) {
                    for (const text of String(item.body || '').split(/\n\s*\n/)) {
                        if (!text.trim()) continue;
                        const p = document.createElement('p');
                        p.textContent = text.trim();
                        a.appendChild(p);
                    }
                    const more = document.createElement('span');
                    more.className = 'more';
                    more.textContent = 'Learn more →';
                    a.appendChild(more);
                }
                li.appendChild(a);
                fragment.appendChild(li);
            }
            t._list.replaceChildren(fragment);
        },
        shadowTemplate: `
<ul role="list"></ul>
<style type="text/css">
:host { display:block; margin:var(--padding, 0.5rem) 0 calc(var(--padding, 0.5rem) * 4); }
ul { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(auto-fill, minmax(210px, 1fr)); gap:calc(var(--padding, 0.5rem) * 4); }
li { display:flex; min-width:0; }
.card { flex:1; display:flex; flex-direction:column; gap:var(--padding, 0.5rem); padding:0 0 calc(var(--padding, 0.5rem) * 3); border-radius:calc(var(--corners, 4px) * 1.75); overflow:hidden; background:var(--color-surface, rgb(255 255 255 / 5%)); border:1px solid var(--color-line, rgb(255 255 255 / 10%)); color:inherit; text-decoration:none; transition:transform 160ms ease, border-color 160ms ease, background-color 160ms ease; }
.card:hover { transform:translateY(-3px); border-color:color-mix(in srgb, var(--color-link, currentColor) 45%, transparent); background:var(--color-surface-hover, rgb(255 255 255 / 8%)); }
.card:focus-visible { outline:var(--focus-outline, 2px solid currentColor); outline-offset:var(--focus-offset, 2px); }
.shot { aspect-ratio:16 / 10; overflow:hidden; border-bottom:1px solid var(--color-line, rgb(255 255 255 / 10%)); background:var(--color-surface, transparent); }
.shot img { display:block; width:100%; height:100%; object-fit:cover; object-position:top left; }
.name { display:flex; align-items:center; gap:10px; margin:calc(var(--padding, 0.5rem) * 1.5) calc(var(--padding, 0.5rem) * 3) 0; font:900 1.2rem var(--font-family-display, sans-serif); }
.name img { width:30px; height:30px; border-radius:8px; flex:none; }
p { margin:0 calc(var(--padding, 0.5rem) * 3); color:var(--color-muted, currentColor); font-size:0.95rem; line-height:1.5; }
p:last-of-type { flex:1; }
.more { margin:0 calc(var(--padding, 0.5rem) * 3); font:800 0.95rem var(--font-family-display, sans-serif); color:var(--color-link, currentColor); }
:host([compact]) { margin:calc(var(--padding, 0.5rem) * 3) 0; }
:host([compact]) ul { display:flex; flex-wrap:wrap; gap:10px; }
:host([compact]) .card { flex-direction:row; padding:0; border-radius:999px; }
:host([compact]) .name { margin:0; padding:6px 14px 6px 6px; font-size:0.9rem; font-weight:700; }
:host([compact]) .name img { width:24px; height:24px; border-radius:6px; }
@media (prefers-reduced-motion: reduce) { .card { transition:none; } .card:hover { transform:none; } }
</style>
`
    });
}
