use crate::prelude::*;

/// App home page
pub(crate) fn page_account_consultation_request(_contexts: &Contexts) -> Html {
    set_title("Consultation Request Form");
    html! {
        <>
            {title_secondary!("Coming Soon!")}
            <Paper class={CLASSES_PAGE_SECTION}>
            </Paper>
        </>
    }
}
