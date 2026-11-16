<webui-data data-page-title="Task Proxy" data-page-subtitle="Scripts, docs, and git, kept with your code"></webui-data>
<webui-data data-page-next-page='{"name":"Ap Tul","href":"/products/ap-tul"}'></webui-data>

<webui-page-segment elevation="10">
<webui-media src="https://www.taskproxy.com/Logo.svg" alt="Task Proxy logo" size="96">

Task Proxy is a lightweight desktop app for managing documentation, scripts, and automations alongside your code. It is built in Rust and runs on Windows, Mac, and Linux.

Its pages and settings live in a `.taskproxy` folder in your project, so your team shares them through git. Secrets stay out of the repository, in your computer's own credential manager.

</webui-media>

<webui-flex class="my-3" justify="center" wrap>
<webui-button theme="primary" start-icon="rocket" href="https://www.taskproxy.com/getting-started">Get Started</webui-button>
<webui-button theme="secondary" start-icon="book-open" href="https://www.taskproxy.com/tutorials">Tutorials</webui-button>
<webui-button theme="shade" start-icon="github" href="https://github.com/StoicDreams/TaskProxyApp">View on GitHub</webui-button>
</webui-flex>

</webui-page-segment>

## See it in action

<webui-page-segment elevation="10">

Review your changes, commit, and sync with your team, all from one window:

<webui-flex align="center" justify="center">
<video controls playsinline preload="none" poster="https://www.taskproxy.com/video/git-commit-sync.webp" style="max-width:100%">
    <source src="https://www.taskproxy.com/video/git-commit-sync.mp4" type="video/mp4">
</video>
</webui-flex>

</webui-page-segment>

## What it does

<webui-side-by-side>
<webui-page-segment elevation="10">

### Git without the command line

See what changed, compare files side by side, write a commit message, and leave out the files you aren't ready to share. Commit, sync, branch, and stash from the Git Controller.

<webui-link href="https://www.taskproxy.com/tutorials/commit-and-sync" icon="code-commit">Commit and Sync tutorial</webui-link>

</webui-page-segment>
<webui-loop-video src="https://www.taskproxy.com/video/loops/git-changes.mp4" poster="https://www.taskproxy.com/video/loops/git-changes.webp" alt="The Git Controller listing four changed files, with the old and new versions of cart.js side by side"></webui-loop-video>
</webui-side-by-side>

<webui-side-by-side>
<webui-loop-video src="https://www.taskproxy.com/video/loops/script-manager.mp4" poster="https://www.taskproxy.com/video/loops/script-manager.webp" alt="The Script Manager with the test script loaded, Suite set to e2e and Filter set to checkout"></webui-loop-video>
<webui-page-segment elevation="10">

### Scripts you don't have to remember

Write PowerShell scripts with parameters, and Task Proxy gives each one a form. Run them in a terminal inside the app or in their own window.

<webui-link href="https://www.taskproxy.com/tutorials/run-scripts" icon="terminal">Run Scripts tutorial</webui-link>

</webui-page-segment>
</webui-side-by-side>

<webui-side-by-side>
<webui-page-segment elevation="10">

### Find what is still running

The Task Manager finds the dev servers and other processes you left running, filters them by project, and stops them.

<webui-link href="https://www.taskproxy.com/tutorials/task-manager" icon="gauge">Task Manager tutorial</webui-link>

</webui-page-segment>
<webui-loop-video src="https://www.taskproxy.com/video/loops/task-manager-filter.mp4" poster="https://www.taskproxy.com/video/loops/task-manager-filter.webp" alt="The Listening preset copied, a Project contains Acme rule added, and saved as Storefront servers, which finds the storefront's dev server"></webui-loop-video>
</webui-side-by-side>

<webui-side-by-side>
<webui-loop-video src="https://www.taskproxy.com/video/loops/page-onboarding.mp4" poster="https://www.taskproxy.com/video/loops/page-onboarding.webp" alt="An onboarding page in Task Proxy, with steps and a run button on each script"></webui-loop-video>
<webui-page-segment elevation="10">

### Team pages

Build onboarding guides, runbooks, and health checks as pages in the repository, with a run button on each script, so anyone on the team can follow them.

<webui-link href="https://www.taskproxy.com/tutorials/team-pages" icon="users">Team Pages tutorial</webui-link>

</webui-page-segment>
</webui-side-by-side>

<webui-side-by-side>
<webui-page-segment elevation="10">

### Project docs

Edit your README and other markdown docs with the rendered page beside the source.

<webui-link href="https://www.taskproxy.com/tutorials/docs" icon="book">Project Docs tutorial</webui-link>

</webui-page-segment>
<webui-loop-video src="https://www.taskproxy.com/video/loops/docs-manager.mp4" poster="https://www.taskproxy.com/video/loops/docs-manager.webp" alt="The Docs Manager with README.md open, the rendered page on the left and its markdown on the right"></webui-loop-video>
</webui-side-by-side>

<webui-side-by-side>
<webui-loop-video src="https://www.taskproxy.com/video/loops/jira/my-issues.mp4" poster="https://www.taskproxy.com/video/loops/jira/my-issues.webp" alt="My Issues, listing issues with their status, priority, sprint, and story points"></webui-loop-video>
<webui-page-segment elevation="10">

### Plugins

Add plugins to bring other tools into Task Proxy. The Jira plugin lists your issues, lets you change them in place, and links them to your branches.

<webui-link href="https://www.taskproxy.com/plugins" icon="puzzle-piece">Browse plugins</webui-link>

</webui-page-segment>
</webui-side-by-side>

## Who it's for

<webui-cards card-width="280">
<webui-card name="Teams" avatar="users" link="https://www.taskproxy.com/for-teams">Keep onboarding guides and runbooks in the repository, with steps anyone can run in a click.</webui-card>
<webui-card name="Developers" avatar="code" link="https://www.taskproxy.com/for-developers">Run scripts without remembering their flags, review and commit quickly, and keep tokens out of your scripts.</webui-card>
<webui-card name="Everyone Who Uses Git" avatar="git" link="https://www.taskproxy.com/for-git-users">Writers, designers, and students: see what changed, save a version, and share it, without the command line.</webui-card>
</webui-cards>
