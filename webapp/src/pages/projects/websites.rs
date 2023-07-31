use crate::prelude::*;

/// App home page
pub(crate) fn page_projects_websites(_contexts: Contexts) -> Html {
    set_title("Website Projects");
    html! {
        <>
            {title_secondary!("Website Projects")}
            <Paper class={CLASSES_PAGE_SECTION} elevation={ELEVATION_STANDARD}>
                {"Below you will find the various website projects we are currently working on or plan to be working on in the near future."}
            </Paper>
            <Paper class={CLASSES_CARD_CONTAINER}>
                {get_cards!(
                    Projects::AgentSquire,
                    Projects::ApTul,
                    Projects::BlueCherub,
                    Projects::DyHaTJ,
                    Projects::ErikGassler,
                    Projects::Faryn,
                    Projects::GasslerUS,
                    Projects::GasslerDesign,
                    Projects::HatchMyWeb,
                    Projects::IndieGameGeeks,
                    Projects::KarinaGassler,
                    Projects::MyFi,
                    Projects::PocketGoo,
                    Projects::SESPTech,
                    Projects::SoftEngStandards,
                    Projects::SoftwareStandards,
                    Projects::StoicDreams,
                    Projects::TaskProxy,
                    Projects::TaskStory,
                    Projects::VocalBin,
                    Projects::WaxLoop
                )}
            </Paper>
            <NextPageButton url="/about" />
        </>
    }
}
