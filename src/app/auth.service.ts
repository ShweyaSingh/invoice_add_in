import {Injectable} from '@angular/core';
import {TokenHandlerService} from './token.handler.service';
import {ConfigService} from './config.service';
import {AuthConstants} from './constants/auth.constants';
import {Endpoints} from './constants/Endpoints';
import {ApiConstants} from './constants/api.constants';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	opt = [
		'menubar=no',
		'scrollbars=no',
		'resizable=no',
		'location=no',
		'status=no',
		'directories=no',
		'titlebar=no',
		'toolbar=no',
		'width=550',
		'height=650'
	].join(',');

	constructor(
		private tokenHandlerService: TokenHandlerService,
		private configService: ConfigService
	) {}

	/**
	 * Check whether user is authanuticated or not.
	 * @returns {boolean} Is Authaunticated
	 */
	isAuthenticated() {
		return this.tokenHandlerService.isAuthenticated();
	}

	/**
	 * Performs signin oeration.
	 * @returns {boolean} Is Authaunticated
	 */
	signIn() {
		let loginPopup = window.open(
			this.configService.getUrl('Authorization'),
			'_blank',
			this.opt
		);

		var timer = setInterval(function () {
			if (loginPopup?.closed) {
				console.log(Date.now());
				clearInterval(timer);
				if (
					window.localStorage.getItem(ApiConstants.IsAuthenticated) === 'true'
				) {
					window.location.href = Endpoints.DashBoardUrl;
				}
			}
		}, 500);
		return this.tokenHandlerService.isAuthenticated();
	}

	/**
	 * Performs sign out operation.
	 * @returns {boolean} Is Authaunticated
	 */
	signOut() {
		let signoutPopup = window.open(
			this.configService.getUrl('SignOut'),
			AuthConstants.Blank,
			this.opt
		);
		setTimeout(function () {
			if (!signoutPopup?.closed) {
				signoutPopup?.close();
			}
		}, 500);

		this.tokenHandlerService.resetLocalStorage();
		return this.tokenHandlerService.isAuthenticated();
	}

	/**
	 * Get Stored Access token.
	 * @returns {string} Access Token
	 */
	public getAccessToken() {
		return this.tokenHandlerService.getAccessToken();
	}

	/**
	 * Stores token informtion.
	 * @param {string} accessToken Access Token,
	 * @param {string} tokenType Token Type like Code or Token itself,
	 * @param {string} expiresIn Expiry 3600 secs,
	 * @param {string} tenantId tenant Id,
	 * @param {string}  tenantName tenant Name,
	 * @param {string}  environmentId Enviroment Id,
	 * @param {string} environmentName Environment Name,
	 * @param {string} legalEntityId Entity Id,
	 * @param {string} legalEntityName Entity Name,
	 * @param {string} userId User Id.
	 */
	storeTokenInfomation(
		accessToken: string,
		tokenType: string,
		expiresIn: string,
		tenantId: string,
		tenantName: string,
		environmentId: string,
		environmentName: string,
		legalEntityId: string,
		legalEntityName: string,
		userId: string
	) {
		this.tokenHandlerService.storeTokenInfomation(
			accessToken,
			tokenType,
			expiresIn,
			tenantId,
			tenantName,
			environmentId,
			environmentName,
			legalEntityId,
			legalEntityName,
			userId
		);
	}

	/**
	 * Reports signin failure to token handler service.
	 * @param {string} errorTitle Error Title.
	 * @param {string} errorMessage Error Message.
	 */
	reportSignInFailure(errorTitle: string, errorMessage: string) {
		this.tokenHandlerService.reportSignInFailure(errorTitle, errorMessage);
	}

	/**
	 * Reset local storage. Preferred during Sign out or reload.
	 */
	resetLocalStorage() {
		this.tokenHandlerService.resetLocalStorage();
	}
}
