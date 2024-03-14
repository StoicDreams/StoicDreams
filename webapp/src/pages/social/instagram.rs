use crate::prelude::*;

/// App home page
pub(crate) fn page_social_instagram(_contexts: &Contexts) -> Html {
    set_title("Instagram");
    html! {
        <>
            {title_secondary!("Instagram")}
            <Paper class={CLASSES_PAGE_SECTION}>
                {"Coming Soon!"}
            </Paper>
        </>
    }
}
