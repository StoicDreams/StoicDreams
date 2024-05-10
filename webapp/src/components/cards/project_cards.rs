use crate::prelude::*;
use std::collections::HashMap;

#[macro_export]
macro_rules! get_cards {
	( $($x:expr ),* ) => {
		html!{
			<>
				$(
					{get_project_card(&$x)}
				)*
			</>
		}
	};
}

pub fn get_project_card(project: &Projects) -> Html {
    match cards().get(project) {
        Some(card) => card(),
        None => html!({ "Card Not Found" }),
    }
}

pub(crate) fn current_projects(_contexts: &Contexts) -> Html {
    html! {
        <>
            {title_secondary!("Current Projects")}
            <Paper class={CLASSES_PAGE_SECTION}>
                {markdown!(r#"
                Check out our top priority projects that we are activelly working on at the moment.
                "#)}
            </Paper>
            <Paper class={CLASSES_CARD_CONTAINER}>
                {get_cards!(
                    Projects::WebUI,
                    Projects::MyFi,
                    Projects::GasslerDesign,
                    Projects::TaskProxy,
                    Projects::TaskStory
                )}
            </Paper>
        </>
    }
}

pub(crate) fn portfolio_projects(_contexts: &Contexts) -> Html {
    html! {
        <>
            {title_secondary!("Portfolio")}
            <Paper class={CLASSES_PAGE_SECTION}>
                {markdown!(r#"
                Check out our other projects that we are maintaining or previously worked on.
                "#)}
            </Paper>
            <Paper class={CLASSES_CARD_CONTAINER}>
                {get_cards!(
                    Projects::BlazorUI,
                    Projects::TestFramework,
                    Projects::TestFrameworkBlazor
                )}
            </Paper>
        </>
    }
}

#[function_component(ProjectCards)]
pub(crate) fn project_cards() -> Html {
    html! {
        <>
            {title_secondary!("Current Projects")}
            <Paper class={CLASSES_CARD_CONTAINER}>
                {get_cards!(
                    Projects::WebUI,
                    Projects::TaskStory,
                    Projects::TaskProxy,
                    Projects::BlazorUI,
                    Projects::TestFramework,
                    Projects::TestFrameworkBlazor
                )}
            </Paper>
        </>
    }
}

#[derive(PartialEq, Eq, Hash)]
pub enum Projects {
    AgentSquire,
    ApTul,
    BlueCherub,
    BlazorUI,
    ErikGassler,
    DyHaTJ,
    Faryn,
    GasslerUS,
    GasslerDesign,
    HatchMyWeb,
    IndieGameGeeks,
    KarinaGassler,
    MyFi,
    PocketGoo,
    SESPTech,
    SoftEngStandards,
    SoftwareStandards,
    StoicDreams,
    TaskProxy,
    TaskStory,
    TestFramework,
    TestFrameworkBlazor,
    VocalBin,
    WaxLoop,
    WebUI,
}

const CARD_WIDTH: u16 = 500;

fn cards() -> std::collections::HashMap<Projects, fn() -> Html> {
    HashMap::from([
        (Projects::AgentSquire, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.agentsquire.com/Logo.svg"))}
                    title="Agent Squire"
                    link="https://www.agentsquire.com/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Agent Squire is in a very early concept phase of development.",
                        "Will update as this concept gets more finalized."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::ApTul, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.aptul.com/Logo.svg"))}
                    title="Ap Tul"
                    link="https://www.aptul.com/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Ap Tul is in a very early concept phase of development.",
                        "Will update as this concept gets more finalized."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::BlazorUI, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://blazorui.stoicdreams.com/Logo.svg"))}
                    title="Blazor UI"
                    link="https://blazorui.stoicdreams.com/"
                    width={CARD_WIDTH}
                >
                    {markdown!(r#"
                    A Blazor based UI framework for simplified and rapid website and application development.

                    Development on Blazor UI is indefinitely on hold as we have migrated away from using C# and Blazor for our projects.

                    > Development on Blazor UI is indefinitely on hold as we have moved to Rust and [WebUI](https://webui.stoicdreams.com) for our projects.
                    "#)}
                </Card>
            }
        } as fn() -> Html),
        (Projects::BlueCherub, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.bluecherub.com/Logo.svg"))}
                    title="Blue Cherub"
                    link="https://www.bluecherub.com/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Blue Cherub is in a very early concept phase of development.",
                        "Will update as this concept gets more finalized."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::DyHaTJ, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.didyouhearaboutthisjob.com/Logo.svg"))}
                    title="Did You Hear About This Job?"
                    link="https://www.didyouhearaboutthisjob.com/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Job Search resources and tips.",
                        "Currently rebuilding as part of migration to Web UI."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::ErikGassler, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.erikgassler.com/Logo.svg"))}
                    title="Erik Gassler"
                    link="https://www.erikgassler.com/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Bio and blog site for Erik Gassler."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::Faryn, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.farynthegame.com/Logo.svg"))}
                    title="Faryn the Game"
                    link="https://www.farynthegame.com/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "An action-adventure game we are currently working on, very early in development."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::GasslerUS, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.gassler.us/Logo.svg"))}
                    title="Gassler.us"
                    link="https://www.gassler.us/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "A portal site for the Gassler family."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::GasslerDesign, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.gassler.design/Logo.svg"))}
                    title="Gassler Design"
                    link="https://www.gassler.design/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Company website for Gassler Design, interior design specialists with a focus on providing inspiring visualizations through 3d renderings."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::HatchMyWeb, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.hatchmyweb.com/Logo.svg"))}
                    title="Hatch My Web"
                    link="https://www.hatchmyweb.com/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Website development resources.",
                        "Currently rebuilding as part of migration to Web UI."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::IndieGameGeeks, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.indiegamegeeks.com/Logo.svg"))}
                    title="Indie Game Geeks"
                    link="https://www.indiegamegeeks.com/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Resources and tips for independent game developers."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::KarinaGassler, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.karinagassler.com/Logo.svg"))}
                    title="Karina Gassler"
                    link="https://www.karinagassler.com/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Bio and blog website for Karina Gassler."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::MyFi, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.myfi.ws/Logo.svg"))}
                    title="MyFi"
                    link="https://www.myfi.ws/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Our portal for API tools and services offered by Stoic Dreams."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::PocketGoo, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.pocketgoo.com/Logo.svg"))}
                    title="Pocket Goo"
                    link="https://www.pocketgoo.com/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Blog and resources for handheld and pocket sized gadgets."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::SESPTech, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.sesp.tech/Logo.svg"))}
                    title="Software Engineering Standards & Practices"
                    link="https://www.sesp.tech/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Documentation for software engineering standards and practices for building software through agile development and continuous delivery workflows.",
                        "These standards are more specifically targeted from a company/management perspective."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::SoftEngStandards, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.softwareengineerstandards.com/Logo.svg"))}
                    title="Software Engineer Standards"
                    link="https://www.softwareengineerstandards.com/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Personal standards for software engineers to maximize productivity."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::SoftwareStandards, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.softwarestandards.dev/Logo.svg"))}
                    title="Software Development Standards"
                    link="https://www.softwarestandards.dev/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Documentation for software development standards for building software through agile development and continuous delivery workflows",
                        "These standards are generally targeted from a developer/team perspective."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::StoicDreams, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("/Logo.svg"))}
                    title="Stoic Dreams"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Stoic Dreams' company portal."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::TaskProxy, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.taskproxy.com/ms-icon-310x310.png"))}
                    title="Task Proxy"
                    link="https://www.taskproxy.com/"
                    width={CARD_WIDTH}
                >
                    {markdown!(r#"
                    Task Proxy is our desktop software for developer documentation and script management system.

                    We released an initial prototype in early 2022 using C# with .NET Maui Blazor frameworks.

                    We are currently in the process of rebuilding this product using Rust with very early access builds being released through development on the [Task Proxy website](https://www.taskproxy.com).
                    "#)}
                </Card>
            }
        } as fn() -> Html),
        (Projects::TaskStory, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.taskstory.com/Logo.svg"))}
                    title="Task Story"
                    link="https://www.taskstory.com/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Task Story is our Project Management tool that provides a guided workflow to organize projects with a Problem / Solution architecture."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::TestFramework, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("/sd-logo.png"))}
                    title="Test Framework - C#"
                    link="https://www.nuget.org/packages/StoicDreams.TestFramework"
                    width={CARD_WIDTH}
                >
                    {markdown!(r#"
                        Nuget.org - StoicDreams.TestFramework

                        A helper framework that's designed to help strictly adhere tests to an Arrange / Act / Assert framework of testing.

                        Includes `Moq` and `FluentAssertion` libraries to help with mocking data and writing readable tests.

                        > Development on Test Framework is indefinitely on hold as we have migrated away from using C# for our projects.
                        "#)}
                </Card>
            }
        } as fn() -> Html),
        (Projects::TestFrameworkBlazor, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("/sd-logo.png"))}
                    title="Test Framework - C# Blazor"
                    link="https://www.nuget.org/packages/StoicDreams.TestFrameworkBlazor"
                    width={CARD_WIDTH}
                >
                    {markdown!(r#"
                    An extended version of StoicDreams.TestFramework that adds a additional testing methods for testing .razor / Blazor components.

                    > Development on Test Framework Blazor is indefinitely on hold as we have migrated away from using C# and Blazor for our projects.
                    "#)}
                </Card>
            }
        } as fn() -> Html),
        (Projects::VocalBin, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.vocalbin.com/Logo.svg"))}
                    title="Vocal Bin"
                    link="https://www.vocalbin.com/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Text to speech synthesis tools and resources."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::WaxLoop, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://www.waxloop.com/Logo.svg"))}
                    title="Wax Loop"
                    link="https://www.waxloop.com/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Social network for sharing and discovery."
                    )}
                </Card>
            }
        } as fn() -> Html),
        (Projects::WebUI, || -> Html {
            html! {
                <Card
                    avatar={AvatarOption::Image(String::from("https://webui.stoicdreams.com/Logo.svg"))}
                    title="Web UI"
                    link="https://webui.stoicdreams.com/"
                    width={CARD_WIDTH}
                >
                    {paragraphs!(
                        "Our first Rust project. This framework is being developed and used to power the latest major iteration of our website projects."
                    )}
                </Card>
            }
        } as fn() -> Html),
    ])
}
