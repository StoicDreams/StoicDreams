use crate::prelude::*;

/// App home page
pub(crate) fn page_social_sponsors(_contexts: Contexts) -> Html {
    set_title("Sponsors");
    html! {
        <>
            {title_secondary!("A special thank you to our sponsors!")}
            <Paper class={CLASSES_PAGE_SECTION}>
                {"Welcome to our Sponsors page. Here we give a very special thank you to our friends and fellow developers that have chosen to thank us by sponsoring our work with contributions"}
            </Paper>
        </>
    }
}
