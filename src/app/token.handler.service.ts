import {Injectable} from '@angular/core';
import {ConfigService} from './config.service';
import {ApiConstants} from './constants/api.constants';

@Injectable({
	providedIn: 'root'
})
export class TokenHandlerService {
	constructor(private configService: ConfigService) {}

	public isAuthenticated() {
		// var isAuthDone =
		//   this.configService.isDevelopmentMode() || this.isTokenValid();
		// return isAuthDone;
		if (window.localStorage.getItem(ApiConstants.IsAuthenticated) === 'true') {
			return true;
		} else {
			return false;
		}
	}
	private isTokenValid() {
		var isValid = false;
		if (window.localStorage.getItem(ApiConstants.IsAuthenticated) === 'true') {
			if (!this.isTokenExpired()) {
				isValid = true;
			} else {
				// TODO : Reacquire token
				isValid = false;
			}
		}
		return isValid;
	}
	private isTokenExpired() {
		// TODO : Check expiry based on last sign in
		return false;
	}

	/**
	 * Get Stored Access token.
	 * @returns {string} Access Token
	 */
	public getAccessToken() {
		let token = window.localStorage.getItem(ApiConstants.AccessToken);
		return token;
	}

	public storeTokenInfomation(
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
		window.localStorage.setItem(ApiConstants.AccessToken, accessToken);
		window.localStorage.setItem(ApiConstants.TokenType, tokenType);
		window.localStorage.setItem(ApiConstants.ExpiresIn, expiresIn);
		window.localStorage.setItem(ApiConstants.TenantId, tenantId);
		window.localStorage.setItem(ApiConstants.TenantName, tenantName);
		window.localStorage.setItem(ApiConstants.EnvironmentId, environmentId);
		window.localStorage.setItem(ApiConstants.EnvironmentName, environmentName);
		window.localStorage.setItem(ApiConstants.LegalEntityId, legalEntityId);
		window.localStorage.setItem(ApiConstants.LegalEntityName, legalEntityName);
		window.localStorage.setItem(ApiConstants.UserId, userId);
		window.localStorage.setItem(
			ApiConstants.AttemptTime,
			new Date().toString()
		);
		window.localStorage.setItem(ApiConstants.IsAuthenticated, 'true');
	}

	/**
	 * Reports signin failure to token handler service.
	 * @param {string} errorTitle Error Title.
	 * @param {string} errorMessage Error Message.
	 */
	public reportSignInFailure(errorTitle: string, errorMessage: string) {
		window.localStorage.setItem(ApiConstants.ErrorTitle, errorTitle);
		window.localStorage.setItem(ApiConstants.ErrorMessage, errorMessage);
		window.localStorage.setItem(
			ApiConstants.AttemptTime,
			new Date().toString()
		);
		window.localStorage.setItem(ApiConstants.IsAuthenticated, 'false');
	}

	/**
	 * Reset local storage. Preferred during Sign out or reload.
	 */
	public resetLocalStorage() {
		window.localStorage.removeItem(ApiConstants.AccessToken);
		window.localStorage.removeItem(ApiConstants.TokenType);
		window.localStorage.removeItem(ApiConstants.ExpiresIn);
		window.localStorage.removeItem(ApiConstants.TenantId);
		window.localStorage.removeItem(ApiConstants.TenantName);
		window.localStorage.removeItem(ApiConstants.EnvironmentId);
		window.localStorage.removeItem(ApiConstants.EnvironmentName);
		window.localStorage.removeItem(ApiConstants.LegalEntityId);
		window.localStorage.removeItem(ApiConstants.LegalEntityName);
		window.localStorage.removeItem(ApiConstants.UserId);
		window.localStorage.removeItem(ApiConstants.AttemptTime);
		window.localStorage.removeItem(ApiConstants.IsAuthenticated);
	}
}
