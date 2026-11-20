import { test, expect, openPage, readJson, WEBAPP } from './support/site.mjs';
import { join } from 'node:path';

const products = readJson(join(WEBAPP, 'cards', 'products.json'));
const projects = readJson(join(WEBAPP, 'cards', 'projects.json'));

test.describe('app-hero', () => {
    test('shows the line above the heading, the content, and the video with its caption', async ({ page }) => {
        await openPage(page, '/');
        const hero = page.locator('app-hero');
        await expect(hero.locator('.eyebrow')).toHaveText("Forging solutions for tomorrow's software development");
        await expect(hero.locator('figcaption')).toHaveText("Task Proxy's Git Controller, built with Web UI");
        await expect(hero.getByRole('heading', { name: 'Tools we build for developers, and share' })).toBeVisible();
        await expect(hero.locator('webui-loop-video[slot="media"]')).toHaveCount(1);
        await expect(hero.getByText('See Our Products')).toBeVisible();
    });

    test('hides the line and caption when they are not set', async ({ page }) => {
        await openPage(page, '/');
        const hidden = await page.evaluate(async () => {
            const hero = document.createElement('app-hero');
            document.querySelector('webui-content, main, body').appendChild(hero);
            await customElements.whenDefined('app-hero');
            return [hero.shadowRoot.querySelector('.eyebrow').hidden, hero.shadowRoot.querySelector('figcaption').hidden];
        });
        expect(hidden).toEqual([true, true]);
    });
});

test.describe('app-site-cards', () => {
    test('shows each product as one link with its screenshot, name, text, and Learn more', async ({ page }) => {
        await openPage(page, '/products');
        const cards = page.locator('app-site-cards a.card');
        await expect(cards).toHaveCount(products.length);
        for (const [index, product] of products.entries()) {
            const card = cards.nth(index);
            await expect(card).toHaveAttribute('href', product.link);
            await expect(card.locator('h3')).toHaveText(product.name);
            await expect(card.locator('.shot img')).toHaveAttribute('src', product.image);
            await expect(card.locator('p')).toHaveText(product.body);
            await expect(card.locator('.more')).toHaveText('Learn more →');
        }
    });

    test('compact shows only the logo and name of each site', async ({ page }) => {
        await openPage(page, '/');
        const compact = page.locator('app-site-cards[compact]');
        await expect(compact.locator('a.card')).toHaveCount(projects.length);
        await expect(compact.locator('.shot, p, .more')).toHaveCount(0);
        await expect(compact.locator('a.card').first()).toHaveText(projects[0].name);
    });

    test('writes card text as text, never as HTML', async ({ page }) => {
        await page.route('**/cards/products.json', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify([{ name: '<img src=x onerror="window.__hacked=1">Tool', link: '/', body: '<b>bold</b>' }]),
        }));
        await openPage(page, '/products');
        const card = page.locator('app-site-cards a.card');
        await expect(card.locator('h3')).toHaveText('<img src=x onerror="window.__hacked=1">Tool');
        await expect(card.locator('p')).toHaveText('<b>bold</b>');
        // No element was made from the card's text, so nothing can run its onerror.
        await expect(card.locator('img, b')).toHaveCount(0);
        await expect.poll(() => page.evaluate(() => window.__hacked)).toBeUndefined();
    });

    test('shows nothing when the card file cannot be loaded', async ({ page }) => {
        await page.route('**/cards/products.json', route => route.fulfill({ status: 404, body: 'Not Found' }));
        await openPage(page, '/products');
        await expect(page.locator('app-site-cards')).toBeAttached();
        await expect(page.locator('app-site-cards a.card')).toHaveCount(0);
    });
});
