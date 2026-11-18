<webui-data data-page-description="Your {APP_NAME} account page for signed-in users, with your profile and settings. Visitors who are not signed in see a not found page."></webui-data>


<webui-restrict-to-role role="1">
    <template slot="valid">
        <webui-content cache src="d/content/account-user.md"></webui-content>
    </template>
    <template slot="invalid">
        <webui-page-not-found></webui-page-not-found>
    </template>
</webui-restrict-to-role>
