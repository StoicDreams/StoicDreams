use crate::prelude::*;

pub fn nav_menu_info() -> DrawerToggleInfo {
    DrawerToggleInfo::builder(
        |_| String::from("Navigation Menu"),
        |_| html! {FaIcon::solid("bars").to_html()},
        DynContextsHtml::new(nav_menu_render),
    )
    .set_button_class("btn toggle theme-inherit")
    .hide_header()
    .hide_footer()
    .set_drawer(Direction::Left)
    .build()
}

pub(crate) fn get_nav_routing(_contexts: &Contexts) -> Vec<NavRoute> {
    let nav_routes = vec![
        NavLinkInfo::link(
            "Home",
            "/",
            &FaIcon::duotone("house"),
            roles::PUBLIC,
            page_home,
        ),
        NavGroupInfo::link(
            "My Account",
            &FaIcon::duotone("house-chimney-user"),
            roles::INVALID,
            vec![
                NavLinkInfo::link(
                    "My Requests",
                    "/signin",
                    &FaIcon::duotone("right-to-bracket").class("fa-bounce"),
                    roles::PUBLIC,
                    page_signin,
                ),
                NavLinkInfo::link(
                    "My Requests",
                    "/auth",
                    &FaIcon::duotone("right-to-bracket").class("fa-bounce"),
                    roles::USER,
                    page_signin,
                ),
                NavLinkInfo::link(
                    "My Requests",
                    "/service-requests",
                    &FaIcon::duotone("inbox"),
                    roles::INVALID,
                    page_account_my_projects,
                ),
                NavLinkInfo::link(
                    "Consulting Request",
                    "/consultation-request",
                    &FaIcon::duotone("hand-holding-seedling"),
                    roles::INVALID,
                    page_account_consultation_request,
                ),
                NavLinkInfo::link(
                    "Software Dev Request",
                    "/development-request",
                    &FaIcon::duotone("window"),
                    roles::INVALID,
                    page_account_development_request,
                ),
            ],
        ),
        NavGroupInfo::link(
            "Site Admin",
            &FaIcon::duotone("user-astronaut"),
            roles::INVALID,
            vec![
                NavLinkInfo::link(
                    "Feedback",
                    "/siteadmin/feedback",
                    &FaIcon::duotone("message-dots"),
                    roles::INVALID,
                    page_site_admin_feedback,
                ),
                NavLinkInfo::link(
                    "Users",
                    "/siteadmin/users",
                    &FaIcon::duotone("people"),
                    roles::INVALID,
                    page_site_admin_users,
                ),
            ],
        ),
        NavGroupInfo::link(
            "Services",
            &FaIcon::duotone("bell-concierge"),
            roles::INVALID,
            vec![
                NavLinkInfo::link(
                    "Consulting",
                    "/consultation-services-for-agile-continuous-delivery-software-development",
                    &FaIcon::duotone("hand-holding-seedling"),
                    roles::INVALID,
                    page_sales_consulation_landing,
                ),
                NavLinkInfo::link(
                    "Software Development",
                    "/software-development-services",
                    &FaIcon::duotone("window"),
                    roles::INVALID,
                    page_sales_development_landing,
                ),
                NavLinkInfo::link(
                    "Account Services",
                    "/accountservices",
                    &FaIcon::duotone("people-group"),
                    roles::INVALID,
                    page_sales_account_services,
                ),
            ],
        ),
        NavGroupInfo::link(
            "Projects",
            &FaIcon::duotone("diagram-project"),
            roles::PUBLIC,
            vec![
                NavLinkInfo::link(
                    "Game Development",
                    "/game-development",
                    &FaIcon::duotone("gamepad-modern"),
                    roles::PUBLIC,
                    page_projects_games,
                ),
                NavLinkInfo::link(
                    "Productivity Tools",
                    "/productivity-tools",
                    &FaIcon::duotone("screwdriver-wrench"),
                    roles::PUBLIC,
                    page_projects_productivity,
                ),
                NavLinkInfo::link(
                    "Misc. Websites",
                    "/website-projects",
                    &FaIcon::duotone("browser"),
                    roles::PUBLIC,
                    page_projects_websites,
                ),
            ],
        ),
        NavGroupInfo::link(
            "No Nav",
            &FaIcon::duotone("diagram-project"),
            roles::INVALID,
            vec![
                NavLinkInfo::link(
                    "Sponsors",
                    "/sponsors",
                    &FaIcon::duotone("rocket-launch"),
                    roles::PUBLIC,
                    page_social_sponsors,
                ),
                NavLinkInfo::link(
                    "Instagram",
                    "/social/instagram",
                    &FaIcon::duotone("screwdriver-wrench"),
                    roles::PUBLIC,
                    page_social_instagram,
                ),
            ],
        ),
        NavLinkInfo::link(
            "About",
            "/about",
            &FaIcon::duotone("circle-info"),
            roles::PUBLIC,
            page_about_stoic_dreams,
        ),
        NavLinkInfo::link(
            "Terms",
            "/terms",
            &FaIcon::duotone("handshake"),
            roles::PUBLIC,
            starter_page_terms,
        ),
        NavLinkInfo::link(
            "Privacy",
            "/privacy",
            &FaIcon::duotone("shield-exclamation"),
            roles::PUBLIC,
            starter_page_privacy,
        ),
    ];
    nav_routes.to_owned()
}

fn nav_menu_render(contexts: &Contexts) -> Html {
    html! {
        <>
            <Paper class="logo d-flex pa-1 justify-center ml-a mr-a">
                <AppLogo text="SD" title="Stoic Dreams Logo" />
            </Paper>
            <NavDisplay routes={get_nav_routing(contexts)} class="d-flex flex-column pa-1" />
        </>
    }
}
