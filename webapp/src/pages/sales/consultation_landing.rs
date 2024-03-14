use crate::prelude::*;

/// App home page
pub(crate) fn page_sales_consulation_landing(_contexts: &Contexts) -> Html {
    set_title("Software Development Consulting services for Agile Development and Continuous Delivery Workflows");
    html! {
        <>
            {title_secondary!("Software Development Consulting Services")}
            <Paper class={CLASSES_PAGE_SECTION}>
                {"Coming Soon!"}
            </Paper>
        </>
    }
}
