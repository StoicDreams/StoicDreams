use crate::prelude::*;

/// App home page
pub(crate) fn page_sales_account_services(_contexts: &Contexts) -> Html {
    set_title("Account Services");
    html! {
        <>
            {title_secondary!("Account Services")}
            <Paper class={CLASSES_PAGE_SECTION}>
                {"Coming Soon!"}
            </Paper>
        </>
    }
}
