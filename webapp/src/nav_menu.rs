use crate::prelude::*;

pub fn nav_menu_info() -> DrawerToggleInfo {
    DrawerToggleInfo::builder(
        "Navigation Menu",
        || html! {<i class="fa-solid fa-bars"></i>},
        DynHtml::new(nav_menu_render),
    )
    .set_button_class("btn toggle theme-inherit")
    .hide_header()
    .hide_footer()
    .set_drawer(Direction::Left)
    .build()
}

pub(crate) fn get_nav_routing() -> Vec<NavRoute> {
    let nav_routes = vec![
        NavLinkInfo::link("Home", "/", "fa-duotone fa-house", roles::PUBLIC, page_home),
        NavGroupInfo::link(
            "My Account",
            "fa-duotone fa-house-chimney-user",
            roles::INVALID,
            vec![
                NavLinkInfo::link(
                    "My Requests",
                    "/service-requests",
                    "fa-duotone fa-inbox",
                    roles::INVALID,
                    page_account_my_projects,
                ),
                NavLinkInfo::link(
                    "Consulting Request",
                    "/consultation-request",
                    "fa-duotone fa-hand-holding-seedling",
                    roles::INVALID,
                    page_account_consultation_request,
                ),
                NavLinkInfo::link(
                    "Software Dev Request",
                    "/development-request",
                    "fa-duotone fa-window",
                    roles::INVALID,
                    page_account_development_request,
                ),
            ],
        ),
        NavGroupInfo::link(
            "Site Admin",
            "fa-duotone fa-user-astronaut",
            roles::INVALID,
            vec![
                NavLinkInfo::link(
                    "Feedback",
                    "/siteadmin/feedback",
                    "fa-duotone fa-message-dots",
                    roles::INVALID,
                    page_site_admin_feedback,
                ),
                NavLinkInfo::link(
                    "Users",
                    "/siteadmin/users",
                    "fa-duotone fa-people",
                    roles::INVALID,
                    page_site_admin_users,
                ),
            ],
        ),
        NavGroupInfo::link(
            "Services",
            "fa-duotone fa-bell-concierge",
            roles::INVALID,
            vec![
                NavLinkInfo::link(
                    "Consulting",
                    "/consultation-services-for-agile-continuous-delivery-software-development",
                    "fa-duotone fa-hand-holding-seedling",
                    roles::INVALID,
                    page_sales_consulation_landing,
                ),
                NavLinkInfo::link(
                    "Software Development",
                    "/software-development-services",
                    "fa-duotone fa-window",
                    roles::INVALID,
                    page_sales_development_landing,
                ),
                NavLinkInfo::link(
                    "Account Services",
                    "/accountservices",
                    "fa-duotone fa-people-group",
                    roles::INVALID,
                    page_sales_account_services,
                ),
            ],
        ),
        NavGroupInfo::link(
            "Projects",
            "fa-duotone fa-diagram-project",
            roles::PUBLIC,
            vec![
                NavLinkInfo::link(
                    "Game Development",
                    "/game-development",
                    "fa-duotone fa-gamepad-modern",
                    roles::PUBLIC,
                    page_projects_games,
                ),
                NavLinkInfo::link(
                    "Productivity Tools",
                    "/productivity-tools",
                    "fa-duotone fa-screwdriver-wrench",
                    roles::PUBLIC,
                    page_projects_productivity,
                ),
                NavLinkInfo::link(
                    "Misc. Websites",
                    "/website-projects",
                    "fa-duotone fa-browser",
                    roles::PUBLIC,
                    page_projects_websites,
                ),
            ],
        ),
        NavGroupInfo::link(
            "No Nav",
            "fa-duotone fa-diagram-project",
            roles::INVALID,
            vec![
                NavLinkInfo::link(
                    "Sponsors",
                    "/sponsors",
                    "fa-duotone fa-rocket-launch",
                    roles::PUBLIC,
                    page_social_sponsors,
                ),
                NavLinkInfo::link(
                    "Instagram",
                    "/social/instagram",
                    "fa-duotone fa-screwdriver-wrench",
                    roles::PUBLIC,
                    page_social_instagram,
                ),
            ],
        ),
        NavLinkInfo::link(
            "About",
            "/about",
            "fa-duotone fa-circle-info",
            roles::PUBLIC,
            page_about_stoic_dreams,
        ),
        NavLinkInfo::link(
            "Terms",
            "/terms",
            "fa-duotone fa-handshake",
            roles::PUBLIC,
            starter_page_terms,
        ),
        NavLinkInfo::link(
            "Privacy",
            "/privacy",
            "fa-duotone fa-shield-exclamation",
            roles::PUBLIC,
            starter_page_privacy,
        ),
    ];
    nav_routes.to_owned()
}

fn nav_menu_render() -> Html {
    html! {
        <>
            <Paper class="d-flex pa-1 justify-center">
                <img src="Logo.svg" title="Web UI Logo" />
            </Paper>
            <NavDisplay routes={get_nav_routing()} class="d-flex flex-column pa-1" />
        </>
    }
}
