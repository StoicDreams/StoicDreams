use crate::prelude::*;

/// App home page
pub(crate) fn page_account_my_projects(_contexts: Contexts) -> Html {
    set_title("My Service Projects");
    html! {
        <>
            {title_secondary!("Coming Soon!")}
            <Paper class={CLASSES_PAGE_SECTION}>
            </Paper>
        </>
    }
}
