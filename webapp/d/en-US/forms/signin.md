
<webui-input-text theme="primary" name="email" label="Email" autofocus></webui-input-text>
<webui-input-text theme="primary" name="password" type="password" label="Password" autofocus></webui-input-text>
<webui-input-range name="autosignout" data-subscribe="session-autosignout:setValue" data-trigger="session-autosignout" label="Inactivity Signout" title="Minutes of inactivity to auto-sign-out" min="5" step="5" max="2880"></webui-input-range>

<webui-flex justify="end" align="center" class="pa-3">
    <webui-button name="forgotpassword" theme="secondary" start-icon="reset">Forgot Password</webui-button>
    <webui-button type="submit" theme="primary" start-icon="signin">Sign-In</webui-button>
</webui-flex>
