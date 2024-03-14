use crate::prelude::*;

/// App home page
pub(crate) fn page_projects_productivity(_contexts: &Contexts) -> Html {
    set_title("Productivity Tools");
    html! {
        <>
            {title_secondary!("Productivity Tools")}
            <Paper class={CLASSES_PAGE_SECTION} elevation={ELEVATION_STANDARD}>
                {"Below you will find our productivity projects, with a primary focus on improving productivity in sofware development."}
            </Paper>
            <Paper class={CLASSES_CARD_CONTAINER}>
                {get_cards!(
                    Projects::TaskStory,
                    Projects::TaskProxy,
                    Projects::WebUI,
                    Projects::BlazorUI,
                    Projects::TestFramework,
                    Projects::TestFrameworkBlazor
                )}
            </Paper>
            <NextPageButton url="/website-projects" />
        </>
    }
}
