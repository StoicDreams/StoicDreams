use crate::prelude::*;

/// App home page
pub(crate) fn page_site_admin_users(_contexts: &Contexts) -> Html {
    set_title("User Management");
    html! {
        <>
            {title_secondary!("User Management")}
            <Paper class={CLASSES_PAGE_SECTION}>
                {"Coming Soon!"}
            </Paper>
        </>
    }
}
