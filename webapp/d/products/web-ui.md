<webui-data data-page-title="Web UI" data-page-subtitle="Web components without the boilerplate" data-page-description="Web UI is an open source web component framework in plain JavaScript with no UI build step, behind every Stoic Dreams website."></webui-data>
<webui-data data-page-next-page='{"name":"Task Story","href":"/products/task-story"}'></webui-data>

<webui-pinned-side side-first>

<webui-page-segment slot="side" elevation="10">
<webui-media src="https://webui.stoicdreams.com/Logo.svg" alt="Web UI logo" size="96">

Web UI is an open source web component framework written in plain JavaScript, with an optional Rust WebAssembly worker for heavy work. It powers every Stoic Dreams website and the Task Proxy desktop app.

There is no build step for your UI. Add a tag such as `<webui-cards>` to a page and the component loads itself from the CDN. Pages can be written in markdown, and data binding with `data-subscribe` and `data-trigger` attributes connects components without glue code.

</webui-media>

<webui-flex class="my-3" justify="center" wrap>
<webui-button theme="primary" start-icon="rocket" href="https://webui.stoicdreams.com/getting-started">Get Started</webui-button>
<webui-button theme="secondary" start-icon="cube" href="https://webui.stoicdreams.com/components">Components</webui-button>
<webui-button theme="shade" start-icon="github" href="https://github.com/StoicDreams/MyFiCDN">View on GitHub</webui-button>
</webui-flex>

</webui-page-segment>


## What you get

<webui-cards card-width="280">
<webui-card name="More than 70 components" avatar="cube" link="https://webui.stoicdreams.com/components">App shells, drawers, tabs, cards, dialogs, forms, code blocks, galleries, and more, each loaded only when a page uses it.</webui-card>
<webui-card name="Markdown pages" avatar="pen" link="https://webui.stoicdreams.com/concepts/routing">Write pages in markdown, mixed with HTML and components, and the framework routes to them.</webui-card>
<webui-card name="Data binding" avatar="nodes" link="https://webui.stoicdreams.com/concepts/state-events">Share state between components through named keys, saved to browser storage when you want it kept.</webui-card>
<webui-card name="Icons that morph" avatar="icons" link="https://webui.stoicdreams.com/graphics/icons">A built-in icon set with shapes, borders, rotation, and themes, all drawn from one set of paths.</webui-card>
<webui-card name="Accessible by default" avatar="universal-access" link="https://webui.stoicdreams.com/concepts/a11y">Keyboard support, focus styles, and screen reader names are part of each component.</webui-card>
<webui-card name="Rust when you need it" avatar="microchip" link="https://webui.stoicdreams.com/tools/rust">Long-running and heavy work runs in Rust compiled to WebAssembly, in a worker that keeps the page responsive.</webui-card>
</webui-cards>

## See a component at work

<webui-side-by-side>
<webui-page-segment elevation="10">

Short looping videos like this one come from a single tag, `<webui-loop-video>`. It plays only while it is on screen, has a pause button, and shows a still for visitors who ask for less motion.

This one shows the Git Controller in Task Proxy, a desktop app whose interface is built with Web UI.

</webui-page-segment>
<webui-loop-video src="https://cdn.myfi.ws/v/webui/loop-video-demo.mp4" poster="https://cdn.myfi.ws/v/webui/loop-video-demo.webp" alt="Writing a commit message in the Task Proxy Git Controller, with one file excluded" width="1280" height="800"></webui-loop-video>
</webui-side-by-side>

## Built with Web UI

<webui-page-segment elevation="10">

Every Stoic Dreams website, and the sites we run for our clients, is built on Web UI.

<webui-gallery src="/cards/galleries/web-ui.json" card-width="150"></webui-gallery>

</webui-page-segment>

## Learn more

<webui-page-segment elevation="10">

- [Why I Decided to Create My Own UI Framework](https://webui.stoicdreams.com/blogs/why-i-developed-a-new-ui-framework), on the Web UI blog.
- [Case Study: Web UI](https://www.erikgassler.com/case-studies/web-ui), by Erik Gassler.

</webui-page-segment>

</webui-pinned-side>
