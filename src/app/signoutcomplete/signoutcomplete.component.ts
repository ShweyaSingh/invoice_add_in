import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';

@Component({
	selector: 'app-signoutcomplete',
	templateUrl: './signoutcomplete.component.html',
	styleUrls: ['./signoutcomplete.component.css']
})
export class SignoutcompleteComponent implements OnInit {
	constructor(private authService: AuthService) {}

	ngOnInit(): void {
		this.SignOutCompleteCtrl();
	}

	SignOutCompleteCtrl() {
		this.authService.resetLocalStorage();
		setTimeout(function () {
			window.close();
		}, 6000);
	}
}
