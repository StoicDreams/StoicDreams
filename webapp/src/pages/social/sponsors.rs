use crate::prelude::*;

/// App home page
pub(crate) fn page_social_sponsors(_contexts: &Contexts) -> Html {
    set_title("Sponsors");
    html! {
        <>
            <MarkdownContent href="/d/en-US/sponsors.md" />
        </>
    }
}
