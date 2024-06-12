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
    .set_navigation(nav_menu::nav_content)
    .set_header(myfi_app_header)
    .set_copyright_start(2010)
    .register_component("CurrentProjects", current_projects)
    .register_component("PortfolioProjects", portfolio_projects)
    .build()
}
