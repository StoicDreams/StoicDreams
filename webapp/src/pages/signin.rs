use yew::KeyboardEvent;

use crate::prelude::*;

const MYFI_ROOT_AUTH: &str = "auth";
const MYFI_URL_SIGNIN: &str = "signin";
const MYFI_URL_SITE_INFO: &str = "site_info";
const LOADING_BAR_STYLES: &str = "width:calc(0.5 * var(--window-width));min-width:300px;";

pub(crate) fn page_signin(contexts: Contexts) -> Html {
    html! {
        <Paper class="d-flex flex-grow flex-column justify-center align-center">
            <Paper class="d-flex flex-row flex-wrap justify-center gap-1">
                {render_signin_content(contexts.user.deref().deref())}
            </Paper>
            <Paper class="flex-grow" />
            {disclaimer()}
        </Paper>
    }
}

fn render_signin_content(user: &Option<MyFiUser>) -> Html {
    if let Some(user) = user {
        let (render, markdown) = if user.roles > 0 {
            (html! {<SiteAuth />}, "auth.md")
        } else {
            (html! {<DisplayLoginSignup />}, "signin.md")
        };
        if user.roles > 0 {
            return html! {
                <SiteAuth />
            };
        }
        return html! {
            <>
                <Paper>
                    {render}
                </Paper>
                <Paper style="min-width:400px;width:calc(0.47 * var(--window-width));" class="pa-2" elevation={ELEVATION_STANDARD}>
                    <MarkdownContent href={format!("/d/en-US/{}", markdown)} />
                </Paper>
            </>
        };
    }
    set_title("Sign In or Create Account");
    html! {
        <Paper class="ma-2">
            <Loading variant={LoadingVariant::StripedBar} size={LOADING_SIZE_XLARGE} style={LOADING_BAR_STYLES} />
        </Paper>
    }
}

define_form!(SiteInfo, {
    site_id: String,
    site_name: String,
    company: String,
    redirect: String
});

#[function_component(SiteAuth)]
fn site_auth() -> Html {
    let contexts = use_context::<Contexts>().expect("Contexts not found");
    let site_info = use_state(|| None::<SiteInfo>);
    let invalid_site_info = use_state(|| false);
    if let Some(site_info) = site_info.deref().to_owned() {
        return html! {
            <SiteAuthManager site_info={site_info} />
        };
    }
    if let Some(query_data) = get_query_data_from_path() {
        let check = query_data
            .iter()
            .find(|(key, _)| *key == "site_id")
            .map(|(_, value)| value.to_string());
        if let Some(site_id) = check {
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
                    <Loading variant={LoadingVariant::StripedBar} size={LOADING_SIZE_XLARGE} style={LOADING_BAR_STYLES} />
                </Paper>
            };
        }
    }
    render_auth_manager()
}

#[derive(Properties, Clone, PartialEq)]
struct SiteAuthManagerProps {
    site_info: SiteInfo,
}

#[function_component(SiteAuthManager)]
fn site_auth_manager(props: &SiteAuthManagerProps) -> Html {
    set_title(&format!(
        "Authorize login and permissions for website {} from company {}",
        props.site_info.site_name, props.site_info.company
    ));
    html!(
        <Paper class="ma-2">
            {title_primary!("Website Authorization Manager")}
            {"Coming Soon!"}
        </Paper>
    )
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

fn get_query_data_from_path() -> Option<HashMap<String, String>> {
    let path = get_full_path();
    match path.find('?') {
        Some(index) => {
            let query = &path[index + 1..];
            let mut query_data = HashMap::new();
            for pair in query.split('&') {
                let mut pair = pair.split('=');
                let key = pair.next().unwrap_or_default();
                let value = pair.next().unwrap_or_default();
                query_data.insert(key.to_string(), value.to_string());
            }
            Some(query_data)
        }
        None => None,
    }
}

#[function_component(DisplayLoginSignup)]
fn display_login_signup() -> Html {
    set_title("Sign In or Create Account");
    let tab_keys = vec![String::from("Sign In"), String::from("Create Acount")];
    html! {
        <Paper class="pa-2 elevation-n10">
            <TabbedContent tabs={tab_keys} class="d-flex flex-column gap-1">
                <SignIn />
                <SignUp />
            </TabbedContent>
        </Paper>
    }
}

fn disclaimer() -> Html {
    html! {
        <Quote color={Theme::Info}>
            <MarkdownContent markdown={r#"
*Disclaimer: We at Stoic Dreams are committed to your privacy and security. We adhere to the strictest data privacy laws and industry-standard encryption practices to ensure your personal information is protected.*
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
            myfi_sign_in(contexts.clone(), &email, &password, alert.clone())
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
    let contexts = use_context::<Contexts>().expect("Contexts not found");
    html! {
        <>
            {title_primary!(&format!("Create a new {} account!", get_company_singular()))}
            <p>{"Coming Soon!"}</p>
        </>
    }
}

pub(crate) fn myfi_sign_in(
    contexts: Contexts,
    email: &str,
    password: &str,
    alert_state: UseStateHandle<String>,
) {
    let user_state = contexts.clone().user;
    let email = email.to_string();
    let password = password.to_string();
    let url = format!("https://{}.myfi.ws/{}", MYFI_ROOT_AUTH, MYFI_URL_SIGNIN);
    let post_data = HashMap::from([("email", email), ("password", password)]);
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
                            let redirect_url = match auth_result.redirect_url.to_owned() {
                                Some(redirect_url) => redirect_url,
                                None => "/".to_string(),
                            };
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
