use crate::prelude::*;

const WRAPPER_STYLES: &str = "min-width:300px;";

/// The info panel for myfi account and other services.
pub fn accounts_panel(contexts: Contexts) -> Html {
    let user = contexts.user.deref().deref().to_owned();
    if let Some(user) = user {
        let class = if user.roles > 0 {
            "btn theme-success"
        } else {
            ""
        }
        .to_string();
        return html! {
            <AppDrawerButton info={drawer_toggle_info(contexts)} {class}>
                <span>{user.display_name}</span>
            </AppDrawerButton>
        };
    }
    html! {
        <Paper class="d-inlineblock">
            <Loading variant={LoadingVariant::Circle} size={LOADING_SIZE_MEDIUM} color={Theme::Info} />
        </Paper>
    }
}

fn drawer_toggle_info(_contexts: Contexts) -> DrawerToggleInfo {
    drawer!(
        "Account Services",
        html! {<i class="fa-duotone fa-user" />},
        get_render_wrapper,
        Direction::Right
    )
    .hide_close_x_button()
    .hide_cancel_button()
    .set_on_confirm("Close", handle_confirm)
    .build()
}

pub(crate) fn get_render_wrapper(contexts: Contexts) -> Html {
    let user_state = contexts.clone().user;
    let user_state = user_state.deref();

    if let Some(user) = user_state.deref() {
        if user.roles > 0 {
            return render_with_user(contexts, user);
        }
        return render_without_user();
    }
    html! {
        <Paper class="d-inlineblock">
            <Loading variant={LoadingVariant::Circle} size={LOADING_SIZE_LARGE} color={Theme::Info} />
        </Paper>
    }
}

fn render_without_user() -> Html {
    html! {
        <Paper class="d-flex flex-column" style={WRAPPER_STYLES}>
            <DisplayLoginSignup />
        </Paper>
    }
}

#[function_component(DisplayLoginSignup)]
fn display_login_signup() -> Html {
    let contexts = use_context::<Contexts>().expect("Contexts not found");
    if let Some(_user) = contexts.user.deref() {
        return html! {
            <Paper>
                <Link href="/signin" class="btn theme-primary">{"Sign In or Create Account"}</Link>
            </Paper>
        };
    }
    html! {
        <Paper class="d-flex flex-column justify-center">
            <Loading variant={LoadingVariant::Circle} size={LOADING_SIZE_MEDIUM} color={Theme::Info} />
        </Paper>
    }
}

fn render_with_user(contexts: Contexts, user: &MyFiUser) -> Html {
    let onclick = {
        let contexts_signout = contexts.clone();
        Callback::from(move |_| {
            sign_out(contexts_signout.clone());
        })
    };
    html! {
        <>
            {title_primary!(&format!("Hello {}!", user.display_name.to_owned()))}
            <Paper class="flex-grow"></Paper>
            <Link href="/auth" class="btn theme-warning">{"Account Auth Management"}</Link>
            <Button onclick={onclick}>{"Sign Out"}</Button>
        </>
    }
}

fn sign_out(contexts: Contexts) {
    let confirm_signout_this_website = {
        let contexts_signout = contexts.clone();
        Callback::from(move |_| {
            contexts_signout.user.set(None);
            myfi_sign_out(contexts_signout.clone(), SignoutScope::ThisWebsite);
        })
    };
    let confirm_signout_this_browser = {
        let contexts_signout = contexts.clone();
        Callback::from(move |_| {
            contexts_signout.user.set(None);
            myfi_sign_out(contexts_signout.clone(), SignoutScope::ThisBrowser);
        })
    };
    let confirm_signout_this_all_devices = {
        let contexts_signout = contexts.clone();
        Callback::from(move |_| {
            contexts_signout.user.set(None);
            myfi_sign_out(contexts_signout.clone(), SignoutScope::AllDevices);
        })
    };
    let render_confirmation = {
        let confirm_signout_this_website = confirm_signout_this_website.clone();
        let confirm_signout_sd_acount = confirm_signout_this_browser.clone();
        move |_| {
            html! {
                <>
                    <Paper class="flex-grow" />
                    <Paper class="d-flex flex-row flex-wrap gap-2">
                        <Button onclick={confirm_signout_this_all_devices.to_owned()} color={Theme::Danger}>{"All Devices"}</Button>
                        <Button onclick={confirm_signout_sd_acount.to_owned()} color={Theme::Warning}>{"All Websites"}</Button>
                        <Button onclick={confirm_signout_this_website.to_owned()} color={Theme::Success}>{"Just This Website"}</Button>
                    </Paper>
                </>
            }
        }
    };
    // confirm if user wants to sign out of just this website or all websites
    dialog!(
        contexts,
        "Sign Out Options",
        {
            html! {
                <Paper class="d-flex flex-column gap-1">
                    <MarkdownContent markdown={r#"Would you like to sign out of just this website or all websites?
Selecting `Just This Website` will sign you out of this website only.
Selecting `All Websites` will sign you out of all websites that use Stoic Dreams account services within this browser.
Selecting `All Devices` will sign you out of all Stoic Dreams services across all devices and browsers.
"#} />
                </Paper>
            }
        },
        render_confirmation
    );
}

fn handle_confirm(_contexts: Contexts) -> bool {
    true
}
