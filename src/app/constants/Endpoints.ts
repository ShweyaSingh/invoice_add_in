export class Endpoints {
	public static AuthorizationUrl =
		'https://oauth2.sky.blackbaud.com/authorization?response_type=token&scope=openid%20profile&redirect_uri={0}&client_id={1}';
	public static SignOutBaseUrl = 'https://signin.blackbaud.com/SignOut';
	public static DashBoardUrl = 'http://localhost:4200/invoice';
	public static RedirectUrl = 'http://localhost:4200/signincomplete';
	public static SignOutRedirectUrl = 'http://localhost:4200/signoutcomplete';
	public static HomeUrl = 'http://localhost:4200/home-page';

	//Endpoints
	//AuthorizationUrl: 'https://oauth2.sky.blackbaud.com/authorization?response_type=token&scope=openid%20profile&redirect_uri={0}&client_id={1}',
	//SignOutBaseUrl: 'https://signin.blackbaud.com/SignOut',
	//DashBoardUrl: 'https://adjustmentsph1.azurewebsites.net/Home.html#/Adjustments',
	//RedirectUrl: 'https://adjustmentsph1.azurewebsites.net/Scripts/App/Auth/SignIn/signinComplete.html',
	//SignOutRedirectUrl: 'https://adjustmentsph1.azurewebsites.net/Scripts/App/Auth/SignOut/signoutComplete.html',
	//HomeUrl: 'https://adjustmentsph1.azurewebsites.net/Home.html#/'
}
