#![allow(unused)] // TODO: Remove me when needing to check for dead code / unused methods/variables.
mod apis;
#[macro_use]
mod components;
mod forms;
mod nav_menu;
mod pages;
mod panels;
mod prelude;

use prelude::*;

fn main() {
    webui::start_app(setup_app_config());
}

fn setup_app_config() -> AppConfig {
    webui::AppConfig::builder(
        "Stoic Dreams".to_owned(),
        "Stoic Dreams".to_owned(),
        "https://www.stoicdreams.com".to_owned(),
        "StoicDreams.com".to_owned(),
    )
    .set_nav_routing(NavRoutingCallback::new(nav_menu::get_nav_routing))
    .set_drawer_toggle_header_left(nav_menu::nav_menu_info())
    .set_drawer_toggle_header_middle(myfi_feedback_button_info())
    .set_header_strip_bar(stoic_header_strip_bar)
    .set_user_info_panel(accounts_panel)
    .set_copyright_start(2010)
    .build()
}
