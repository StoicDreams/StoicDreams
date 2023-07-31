use crate::prelude::*;

/// App home page
pub(crate) fn page_projects_games(_contexts: Contexts) -> Html {
    set_title("Games");
    html! {
        <>
            <MarkdownContent href="/d/en-US/projects/games.md" />
            <NextPageButton url="/productivity-tools" />
        </>
    }
}
