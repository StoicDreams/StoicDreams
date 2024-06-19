/* Display a card component wrapper */
"use strict"
{
    function toCamel(property) {
        return property.replace(/(-[A-Za-z0-9]{1})/g, a => { return a[1].toUpperCase(); });
    }
    class Cards extends HTMLElement {
        constructor() {
            super();
            const t = this;
            if (t.parentNode.nodeName === 'P') {
                let p = t.parentNode;
                t.parentNode.parentNode.insertBefore(t, t.parentNode);
                if (p.innerHTML.trim() === '') {
                    p.remove();
                }
            }
        }
        static get observedAttributes() {
            return ['elevation', 'card-width', 'src'];
        }
        async buildContentFromSource() {
            let t = this;
            if (!t.src) return;
            let result = await fetch(t.src);
            if (!result.ok) return;
            let cards = await result.json();
            t.innerHTML = '';
            cards.forEach(cd => {
                let card = document.createElement('webui-card');
                if (cd.theme) { card.setAttribute('theme', cd.theme); }
                if (cd.name) { card.setAttribute('name', cd.name); }
                if (cd.width) { card.setAttribute('width', cd.width); }
                else if (t.cardWidth) { card.setAttribute('width', t.cardWidth); }
                if (cd.avatar) { card.setAttribute('avatar', cd.avatar); }
                if (cd.link) { card.setAttribute('link', cd.link); }
                if (cd.elevation) { card.setAttribute('elevation', cd.elevation); }
                if (cd.class) { cd.class.split(' ').forEach(c => card.classList.add(c)); }
                if (cd.body) { card.innerHTML = webuiApplyAppData(cd.body); }
                t.appendChild(card);
            });
        }
        attributeChangedCallback(property, oldValue, newValue) {
            property = toCamel(property);
            if (oldValue === newValue) return;
            if (newValue === null || newValue === undefined) {
                delete this[property];
            } else {
                this[property] = newValue;
            }
            switch (property) {
                case 'src':
                    this.buildContentFromSource();
                    break;
                case 'cardWidth':
                    this.querySelectorAll('webui-card').forEach(n => {
                        n.setAttribute('width', newValue);
                    });
                    break;
                case 'elevation':
                    this.classList.add(`elevation-${newValue}`);
                    break;
            }
        }
        connectedCallback() {
        }
        disconnectedCallback() { }
    }
    customElements.define('app-cards', Cards);
}