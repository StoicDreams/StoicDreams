use crate::prelude::*;

define_form!(AuthResult, {
    id: String,
    display_name: String,
    auth_key: Option<String>,
    roles: u32,
    redirect_url: Option<String>
});
