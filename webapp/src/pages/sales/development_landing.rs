use crate::prelude::*;

/// App home page
pub(crate) fn page_sales_development_landing(_contexts: Contexts) -> Html {
    set_title("Software Development Services");
    html! {
        <>
            {title_secondary!("Software Development Services")}
            <Paper class={CLASSES_PAGE_SECTION}>
                {"Coming Soon!"}
            </Paper>
        </>
    }
}
