import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Stoic Dreams' setup for screenshots/pages.shots.mjs. Its pages show logos, screenshots, and videos from the other
// Stoic Dreams sites, which the test harness blocks. When those sites' repos are checked out beside this one, each
// request to a site is answered from its webapp/root_files folder, so the pictures show the images instead of
// broken ones. A site that isn't checked out, or a file it doesn't have, stays blocked as before.

const WEBSITES = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const MIME = {
    '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
    '.gif': 'image/gif', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.json': 'application/json',
};

/** Each sibling site's host, read from the first address in its sitemap, mapped to its root_files folder. */
function siteFolders() {
    const folders = new Map();
    if (!existsSync(WEBSITES)) return folders;
    for (const name of readdirSync(WEBSITES)) {
        const root = join(WEBSITES, name, 'webapp', 'root_files');
        const sitemap = join(root, 'sitemap.xml');
        if (!existsSync(sitemap)) continue;
        const loc = readFileSync(sitemap, 'utf8').match(/<loc>\s*(https?:\/\/[^<\s]+)/);
        if (loc) folders.set(new URL(loc[1]).hostname, root);
    }
    return folders;
}

const folders = siteFolders();

export async function setup(page) {
    if (folders.size === 0) return;
    await page.route(url => folders.has(url.hostname), route => {
        const url = new URL(route.request().url());
        const root = folders.get(url.hostname);
        const file = normalize(join(root, decodeURIComponent(url.pathname)));
        if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) return route.fallback();
        return route.fulfill({ contentType: MIME[extname(file).toLowerCase()] || 'application/octet-stream', body: readFileSync(file) });
    });
}
