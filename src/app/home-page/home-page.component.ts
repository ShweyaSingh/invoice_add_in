import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';
import {ConfigService} from '../config.service';
import {AuthConstants} from '../constants/auth.constants';
import {ToastService} from '../toast.service';

@Component({
	selector: 'app-home-page',
	templateUrl: './home-page.component.html',
	styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
	isOperationRunning: boolean = false;
	signInButtonText: string = AuthConstants.SignInButtonText;
	constructor(
		private authService: AuthService,
		private configService: ConfigService,
		private toastService: ToastService
	) {}

	ngOnInit(): void {}

	login() {
		this.isOperationRunning = true;
		//if (!this.authService.isAuthenticated()) {
		if (true) {
			if (this.authService.signIn()) {
				//this.signInButtonText = AuthConstants.SignOutButtonText;
				//this.toastService.success(AuthConstants.SignInSuccessful);
				//window.location.href = this.configService.getUrl('Dashboard');
			} else {
				// this.signInButtonText = AuthConstants.SignInButtonText;
				// this.toastService.error(AuthConstants.SignInError);
			}
		} else {
			// if (AuthService.signOut()) {
			//   $window.location.href = configService.getUrl('Home');
			//   $scope.signInButtonText = AuthConstants.SignInButtonText;
			//   ToastService.success(AuthConstants.SignOutSuccessful);
			// } else {
			//   $scope.signInButtonText = AuthConstants.SignOutButtonText;
			//   ToastService.error(AuthConstants.SignOutError);
		}
		this.isOperationRunning = false;
	}
}
