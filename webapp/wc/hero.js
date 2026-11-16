/* The opening section of a landing page: a short line above the content (a heading, a pitch, and buttons), beside
 * a picture or video in a frame with an optional caption.
 * <app-hero eyebrow="Forging solutions" caption="Task Proxy's Git Controller">
 *     ## Heading
 *     Pitch
 *     <webui-flex gap="2" wrap><webui-button theme="primary" href="/products">See our products</webui-button></webui-flex>
 *     <webui-loop-video slot="media" src="..." poster="..." alt="..."></webui-loop-video>
 * </app-hero>
 * The media sits beside the content on wide screens and below it on narrow ones. Task Story has a similar app-hero
 * (image only); both are candidates for MyFiCDN as webui-hero.
 */
"use strict"
{
    webui.define('app-hero', {
        attr: ['eyebrow', 'caption'],
        constructor() {
            const t = this;
            t._eyebrow = t.template.querySelector('.eyebrow');
            t._caption = t.template.querySelector('figcaption');
        },
        attrChanged(property, value) {
            const t = this;
            switch (property) {
                case 'eyebrow':
                    t._eyebrow.textContent = value || '';
                    t._eyebrow.hidden = !value;
                    break;
                case 'caption':
                    t._caption.textContent = value || '';
                    t._caption.hidden = !value;
                    break;
            }
        },
        shadowTemplate: `
<section>
<div class="content"><p class="eyebrow" hidden></p><slot></slot></div>
<figure><slot name="media"></slot><figcaption hidden></figcaption></figure>
</section>
<style type="text/css">
:host { display:block; margin:calc(var(--padding, 0.5rem) * 2) 0 calc(var(--padding, 0.5rem) * 6); }
section { display:grid; grid-template-columns:minmax(0, 1.05fr) minmax(0, 1fr); gap:calc(var(--padding, 0.5rem) * 7); align-items:center; }
.content { display:flex; flex-direction:column; gap:calc(var(--padding, 0.5rem) * 2); }
.eyebrow { margin:0; font:800 0.8rem var(--font-family-display, sans-serif); letter-spacing:0.14em; text-transform:uppercase; color:var(--color-link, currentColor); }
/* Page styles outrank ::slotted, so these are fallbacks; app.css sets the heading and pitch for the site. */
::slotted(h1), ::slotted(h2) { display:block; margin:0; padding:0; font-family:var(--font-family-display, sans-serif); font-size:clamp(2.1rem, 1.2rem + 2.8vw, 3.3rem); font-weight:900; line-height:1.1; background-image:var(--fill-accent, none); -webkit-background-clip:text; background-clip:text; color:transparent; }
::slotted(p) { margin:0; font-size:1.12em; line-height:1.55; color:var(--color-muted, currentColor); max-width:52ch; }
figure { margin:0; border-radius:calc(var(--corners, 4px) * 1.75); overflow:hidden; border:1px solid var(--color-line, rgb(255 255 255 / 10%)); background:var(--color-surface, transparent); box-shadow:0 30px 60px rgb(0 0 0 / 45%), 0 0 0 6px rgb(255 255 255 / 3%); }
::slotted([slot=media]) { display:block; width:100%; height:auto; }
figcaption { padding:10px 14px; font-size:0.85rem; color:var(--color-muted, currentColor); border-top:1px solid var(--color-line, rgb(255 255 255 / 10%)); }
@media (max-width: 900px) {
section { grid-template-columns:minmax(0, 1fr); gap:calc(var(--padding, 0.5rem) * 5); }
}
</style>
`
    });
}
