use crate::prelude::*;

/// App home page
pub(crate) fn page_site_admin_feedback(_contexts: &Contexts) -> Html {
    set_title("User Feedback");
    html! {
        <>
            {title_secondary!("User Feedback")}
            <Paper class={CLASSES_PAGE_SECTION}>
                {"Coming Soon!"}
            </Paper>
        </>
    }
}
