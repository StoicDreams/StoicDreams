use std::collections::HashMap;

use crate::prelude::*;

/// App home page
#[function_component(TeamCards)]
pub(crate) fn team_cards() -> Html {
    html! {
        <>
            {title_secondary!("Meet the Team")}
            <Paper class={CLASSES_CARD_CONTAINER}>
                {get_team_card(&Team::ErikGassler)}
            </Paper>
        </>
    }
}

#[derive(PartialEq, Eq, Hash)]
pub enum Team {
    ErikGassler,
}

pub fn get_team_card(project: &Team) -> Html {
    match cards().get(project) {
        Some(card) => card(),
        None => html!({ "Card Not Found" }),
    }
}

const CARD_WIDTH: u16 = 500;

fn cards() -> std::collections::HashMap<Team, fn() -> Html> {
    HashMap::from([(Team::ErikGassler, || -> Html {
        html! {
            <Card
                avatar="https://www.erikgassler.com/Logo.svg"
                title="Erik Gassler"
                link="https://www.erikgassler.com/"
                width={CARD_WIDTH}
            >
                {paragraphs!(
                    "Owner and principal software engineer for Stoic Dreams."
                )}
                <Quote color={Theme::Success} cite="Erik Gassler">
                    {"Just a simpleton who likes playing with bits and bytes."}
                </Quote>
            </Card>
        }
    } as fn() -> Html)])
}
