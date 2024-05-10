use yew::KeyboardEvent;

use crate::prelude::*;

const MYFI_ROOT_AUTH: &str = "auth";
const MYFI_URL_SIGNIN: &str = "signin";
const MYFI_URL_SITE_INFO: &str = "site_info";

pub(crate) fn page_signin(contexts: &Contexts) -> Html {
    set_title("Sign In or Create Account");
    match contexts.user.deref() {
        Some(user) => {
            html! {
                <>
                    <MyFiStorageConsent />
                    <Paper class="d-flex flex-grow flex-column justify-center align-center mt-3">
                        <Paper class="d-flex flex-row flex-wrap justify-center gap-1">
                            {render_signin_content(user)}
                        </Paper>
                        <Paper class="flex-grow" />
                        {disclaimer()}
                    </Paper>
                </>
            }
        }
        None => {
            html! {
                <Paper class="d-flex flex-grow flex-column justify-left align-left">
                    <Paper class="">
                        <Loading variant={LoadingVariant::StripedBar} size={LOADING_SIZE_XLARGE} />
                    </Paper>
                    <Quote color={Theme::Info}>
                        {"Waiting for user information to load."}
                    </Quote>
                </Paper>
            }
        }
    }
}

fn render_signin_content(user: &MyFiUser) -> Html {
    if user.roles > 0 {
        return html! {
            <>
                <Paper>
                    <SiteAuth />
                </Paper>
            </>
        };
    };
    html! {
        <>
            <Paper>
                <DisplayLoginSignup />
            </Paper>
            <Paper style="min-width:400px;width:calc(0.47 * var(--window-width));" class="pa-2" elevation={ELEVATION_STANDARD}>
                <MarkdownContent href={"/d/en-US/signin.md".to_string()} />
            </Paper>
        </>
    }
}

#[function_component(SiteAuth)]
fn site_auth() -> Html {
    let _contexts = use_context::<Contexts>().expect("Contexts not found");
    let site_info = use_state(|| None::<SiteInfo>);
    let invalid_site_info = use_state(|| false);
    if let Some(site_info) = site_info.deref().to_owned() {
        return html! {
            <SiteAuthManager site_info={site_info} />
        };
    }
    if let Some(site_id) = query_url("siteid", None) {
        if *invalid_site_info {
            return html! {
                <Paper>
                    <Quote color={Theme::Danger} class="pa-2 ma-2" elevation={ELEVATION_STANDARD}>
                        <MarkdownContent href="/d/en-US/invalid_site.md" />
                    </Quote>
                </Paper>
            };
        }
        let site_info = site_info.clone();
        spawn_async!({
            let response = fetch_myfi(
                &format!("{}/{}", MYFI_URL_SITE_INFO, site_id),
                FetchMethod::Get,
            )
            .await;
            if response.is_ok() {
                if let Some(response) = response.get_result() {
                    if let Ok(loaded) = serde_json::from_str::<SiteInfo>(&response) {
                        site_info.set(Some(loaded));
                        return;
                    }
                }
            }
            invalid_site_info.set(true);
        });
        return html! {
            <Paper class="ma-2">
                <Loading variant={LoadingVariant::StripedBar} size={LOADING_SIZE_XLARGE} />
            </Paper>
        };
    }
    render_auth_manager()
}

define_form!(SiteInfo, {
    name: String,
    company: String,
    company_id: String,
    domain: String,
    redirect: String
});

#[derive(Properties, Clone, PartialEq)]
struct SiteAuthManagerProps {
    site_info: SiteInfo,
}

#[function_component(SiteAuthManager)]
fn site_auth_manager(props: &SiteAuthManagerProps) -> Html {
    let SiteInfo {
        name: site,
        company,
        company_id,
        domain,
        redirect,
    } = &props.site_info;
    set_title(&format!(
        "Authorize login and permissions for website {} from company {}",
        site, company
    ));

    let data_message = match company_id.as_str() {
        "Companies:0ipahe77ogcpign1fu9e" => format!("{} is a Stoic Dreams owned website, which may share Stoic Dreams data across across its various domains and applications.", domain),
        _ => format!("The website {} ({}) and company {} will not be granted any additional access to your Stoic Dreams data not related to {} through this authorization.", site, domain, company, domain)
    };
    let redirect_state = redirect.to_string();
    let redirect_state = use_state(move || redirect.to_string());
    if let Some(app) = query_url("app", None) {
        if let Some(key) = query_url("key", Some(redirect.to_string())) {
            let application = if app.is_empty() { site } else { &app };
            return html! {
                <Paper class="mt-3">
                    {title_primary!("Website Authorization Manager")}
                    <Paper class={CLASSES_PAGE_SECTION} elevation={ELEVATION_STANDARD}>
                        {paragraphs!(
                            &format!("{} is requesting access for you to sign-in to your Stoic Dreams account on their application {} ({}).", company, application, domain),
                            &format!("Copy/Paste this code into the Code field of {}.", application),
                            &data_message
                        )}
                    </Paper>
                    <Paper class="d-flex flex-column justify-center align-center mt-3">
                        <DisplayCodeForCopy code={key} />
                    </Paper>
                </Paper>
            };
        }
    }
    let btn_display = format!("Confirm Sign-In Authorization for {}", domain);
    let redirect = redirect.to_string();
    html!(
        <Paper class="mt-3">
            {title_primary!("Website Authorization Manager")}
            <Paper class={CLASSES_PAGE_SECTION} elevation={ELEVATION_STANDARD}>
                {paragraphs!(
                    &format!("{} is requesting access for you to sign-in to your Stoic Dreams account on their website {} ({}).", company, site, domain),
                    &format!("Confirming this request will return you to {} and grant it access to access your data associated with that domain.", domain),
                    &data_message
                )}
            </Paper>
            <Paper class="d-flex flex-column justify-center align-center mt-3">
                <Link class={"btn theme-primary"} href={redirect.to_owned()} title={btn_display.to_owned()}>{btn_display}</Link>
            </Paper>
        </Paper>
    )
}

#[derive(Properties, Clone, PartialEq)]
struct StringProp {
    code: String,
}

#[function_component(DisplayCodeForCopy)]
fn display_code_for_copy(props: &StringProp) -> Html {
    let contexts = use_context::<Contexts>().expect("Contexts not found");
    let clipboard = use_clipboard();
    let code = props.code.to_owned();
    let code = use_state(move || code);
    let code_updater = code.to_owned();
    let contexts_move = contexts.clone();
    let code_string = code.to_string();
    let callback = Callback::from(move |_| {
        clipboard.write_text(code_string.to_owned());
        let code = format!("{} copied to clipboard", code_string);
        alert!(contexts_move.clone(), "Copied!", &code);
    });
    let start_icon = Some(IconOptions {
        icon: FaIcon::duotone("key"),
        title: "Use this code to sign in to your app.".into(),
        color: Theme::Info,
        ..Default::default()
    });
    let end_button = html_nested! {<Button icon={FaIcon::duotone("copy")} onclick={callback} title={"Copy code to clipboard!"} color={Theme::Primary} />};
    html! {
        <InputText t="password" value={code.to_owned()} style="width:300px" readonly={true} name={"Code"} {start_icon} {end_button} />
    }
}

fn render_auth_manager() -> Html {
    set_title("Website Authorization Manager");
    html!(
        <Paper class="ma-2">
            {title_primary!("Account Authorization Manager")}
            {"Coming Soon!"}
        </Paper>
    )
}

#[function_component(DisplayLoginSignup)]
fn display_login_signup() -> Html {
    set_title("Sign In or Create Account");
    let tab_keys = vec![String::from("Sign In"), String::from("Create Acount")];
    html! {
        <>
            <Paper class="pa-2 elevation-n10">
                <TabbedContent tabs={tab_keys} class="d-flex flex-column gap-1">
                    <SignIn />
                    <SignUp />
                </TabbedContent>
            </Paper>
        </>
    }
}

fn disclaimer() -> Html {
    html! {
        <Quote color={Theme::Info}>
            <MarkdownContent markdown={r#"
            *Disclaimer: We at Stoic Dreams are committed to your privacy and security. We strive to assure that we adhere to the strictest data privacy laws and meet or exceed industry-standard encryption practices to ensure your personal information is protected.*
            "#} />
        </Quote>
    }
}

#[function_component(SignIn)]
fn sign_in() -> Html {
    let contexts = use_context::<Contexts>().expect("Contexts not found");
    let email = use_state(|| "".to_string());
    let password = use_state(|| "".to_string());
    let alert = use_state(|| "".to_string());
    let submit_form = {
        let contexts = contexts.clone();
        let email = email.clone();
        let password = password.clone();
        let alert = alert.clone();
        move || {
            contexts.user.set(None);
            alert.set(String::default());
            let email = email.deref().to_owned();
            let password = password.deref().to_owned();
            if let Some(error) = validate_email(&email) {
                alert.set(error);
                contexts.user.set(Some(MyFiUser::default()));
                return;
            }
            if let Some(error) = validate_password(&password) {
                alert.set(error);
                contexts.user.set(Some(MyFiUser::default()));
                return;
            }
            myfi_sign_in(&contexts, &email, &password, alert.clone())
        }
    };
    let submit = {
        let submit_form = submit_form.clone();
        Callback::from(move |_| submit_form.clone()())
    };
    let form_detect_enter = {
        let submit_form = submit_form.clone();
        Callback::from(move |event: KeyboardEvent| {
            if event.key() == "Enter" {
                submit_form();
            }
        })
    };
    html! {
        <>
            {title_primary!(&format!("Sign in to your {} account!", get_company_singular()))}
            <form class="d-flex flex-column gap-1" name="myfi-sign-in-form" autocomplete="on" onkeyup={form_detect_enter}>
                <InputText name="Email" value={email.clone()} />
                <InputText t="password" name="Password" value={password.clone()} />
            </form>
            <Button onclick={submit}>{"Sign In"}</Button>
            {if !alert.deref().to_owned().is_empty() {
                html!{<Alert color={Theme::Danger}>{alert.deref().to_owned()}</Alert>}
            } else {
                html!{}
            }}
        </>
    }
}

#[function_component(SignUp)]
fn sign_up() -> Html {
    let _contexts = use_context::<Contexts>().expect("Contexts not found");
    html! {
        <>
            {title_primary!(&format!("Create a new {} account!", get_company_singular()))}
            <p>{"Coming Soon!"}</p>
        </>
    }
}

pub(crate) fn myfi_sign_in(
    contexts: &Contexts,
    email: &str,
    password: &str,
    alert_state: UseStateHandle<String>,
) {
    let user_state = contexts.clone().user;
    let email = email.to_string();
    let password = password.to_string();
    let site_id = query_url("siteid", None);
    let url = format!("https://{}.myfi.ws/{}", MYFI_ROOT_AUTH, MYFI_URL_SIGNIN);
    let post_data = match &site_id {
        Some(site_id) => HashMap::from([
            ("email", email),
            ("password", password),
            ("site_id", site_id.to_owned()),
        ]),
        None => HashMap::from([("email", email), ("password", password)]),
    };
    match serde_json::to_string(&post_data) {
        Ok(post_body) => {
            let contexts = contexts.clone();
            let alert_state = alert_state.clone();
            let user_state = user_state.clone();

            spawn_async!({
                let response = fetch_cors(FetchRequest::new(
                    url.to_string(),
                    FetchMethod::Post(post_body.to_string()),
                ))
                .await;
                if response.is_ok() {
                    if let Some(result) = response.get_result() {
                        if let Ok(auth_result) = serde_json::from_str::<AuthResult>(&result) {
                            contexts.drawer.clone().set(DrawerMessage::Close);
                            let mut user_updated = match user_state.deref() {
                                Some(user) => user.to_owned(),
                                None => MyFiUser::default(),
                            };
                            user_updated.id = Some(auth_result.id);
                            user_updated.display_name = auth_result.display_name;
                            user_updated.roles = auth_result.roles;
                            let name = user_updated.display_name.clone();
                            user_state.clone().set(Some(user_updated));
                            if let Some(auth_key) = auth_result.auth_key {
                                set_user_storage_data(
                                    String::from("stoic_dreams_auth_token"),
                                    auth_key,
                                );
                            }
                            alert!(
                                contexts,
                                "Success",
                                format!("Welcome {}, you have successfully signed in.", name)
                            );
                            if let Some(site_id) = site_id {
                                nav_to!(contexts, &format!("/auth?siteid={}", site_id));
                                return;
                            }
                            let redirect_url = String::from("/auth");
                            // let redirect_url =  match auth_result.redirect_url.to_owned() {
                            //     Some(redirect_url) => redirect_url,
                            //     None => "/".to_string(),
                            // };
                            nav_to!(contexts, &redirect_url);
                            return;
                        }
                    }
                    alert_state.clone().set("Unknown error".to_string());
                } else if let Some(result) = response.get_result() {
                    alert_state.clone().set(result.clone());
                } else {
                    alert_state.clone().set("Unknown error".to_string());
                }
                user_state.clone().set(Some(MyFiUser::default()));
            });
        }
        Err(error) => {
            let message = format!("{}", error);
            alert_state.clone().set(message.clone());
            user_state.clone().set(Some(MyFiUser::default()));
        }
    }
}
