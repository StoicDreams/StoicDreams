pub use crate::prelude::*;

const MYFI_ROOT_AUTH: &str = "auth";

pub(crate) async fn fetch_myfi(path: &str, method: FetchMethod) -> FetchResponse {
    let url = format!("https://api.myfi.ws/{}/{}", MYFI_ROOT_AUTH, path);
    fetch_cors(FetchRequest::new(url.to_string(), method)).await
}
