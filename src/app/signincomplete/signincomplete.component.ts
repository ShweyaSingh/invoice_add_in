import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AuthConstants } from '../constants/auth.constants';

@Component({
  selector: 'app-signincomplete',
  templateUrl: './signincomplete.component.html',
  styleUrls: ['./signincomplete.component.css']
})
export class SignincompleteComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.SignInCompleteCtrl();
  }

  SignInCompleteCtrl() {

    let absUrl = window.location.href;
    let splitArr = absUrl.split('&');
    if (splitArr.length > 1) {
        if (splitArr[0].indexOf("access_token") > -1) {
            let accessToken = '';
            let tokenType = '';
            let expiresIn = '';
            let tenantId = '';
            let tenantName = '';
            let environmentId = '';
            let environmentName = '';
            let legalEntityId = '';
            let legalEntityName = '';
            let userId = '';
            for (let i = 0; i < splitArr.length; i++) {

                if (splitArr[i].indexOf("access_token") > -1) {
                    accessToken = splitArr[i].split('=')[1];
                }
                else if (splitArr[i].indexOf("token_type") > -1) {
                    tokenType = splitArr[i].split('=')[1];
                }
                else if (splitArr[i].indexOf("expires_in") > -1) {
                    expiresIn = splitArr[i].split('=')[1];
                }
                else if (splitArr[i].indexOf("tenant_id") > -1) {
                    tenantId = splitArr[i].split('=')[1];
                }
                else if (splitArr[i].indexOf("tenant_name") > -1) {
                    tenantName = splitArr[i].split('=')[1];
                }
                else if (splitArr[i].indexOf("environment_id") > -1) {
                    environmentId = splitArr[i].split('=')[1];
                }
                else if (splitArr[i].indexOf("environment_name") > -1) {
                    environmentName = splitArr[i].split('=')[1];
                }
                else if (splitArr[i].indexOf("legal_entity_id") > -1) {
                    legalEntityId = splitArr[i].split('=')[1];
                }
                else if (splitArr[i].indexOf("legal_entity_name") > -1) {
                    legalEntityName = splitArr[i].split('=')[1];
                }
                else if (splitArr[i].indexOf("user_id") > -1) {
                    userId = splitArr[i].split('=')[1];
                }
            }
            this.authService.storeTokenInfomation(accessToken,
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
        else if (splitArr[0].indexOf("error") > -1) {

            let errorTitle = '';
            let errorMessage = '';
            for (let j = 0; j < splitArr.length; j++) {
                if (splitArr[j].indexOf("error") > -1) {
                    errorTitle = splitArr[j].split('=')[1];
                }
                else if (splitArr[j].indexOf("error_message") > -1) {
                    errorMessage = splitArr[j].split('=')[1];
                }
            }
            this.authService.reportSignInFailure(errorTitle, errorMessage);
        }
        else {
          this.authService.reportSignInFailure(AuthConstants.SignInError, AuthConstants.UnknownCause);
        }
    }

    setTimeout(function () {
        window.close();
    }, 3000);

  }

}
