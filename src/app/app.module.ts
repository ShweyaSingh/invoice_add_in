import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {SkyAlertModule} from '@skyux/indicators';

import {AppComponent} from './app.component';
import {HomePageComponent} from './home-page/home-page.component';
import {SignincompleteComponent} from './signincomplete/signincomplete.component';
import {SignoutcompleteComponent} from './signoutcomplete/signoutcomplete.component';
import {RouterModule, Routes} from '@angular/router';
import {InvoiceComponent} from './invoice/invoice.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from "ngx-spinner";
import { PinkToast } from './invoice/toast.component';


import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [
	{path: 'home-page', component: HomePageComponent},
	{path: 'signincomplete', component: SignincompleteComponent},
	{path: 'signoutcomplete', component: SignoutcompleteComponent},
	{path: 'invoice', component: InvoiceComponent},
	{path: '', redirectTo: '/home-page', pathMatch: 'full'}
];

@NgModule({
	declarations: [
		AppComponent,
		HomePageComponent,
		SignincompleteComponent,
		SignoutcompleteComponent,
		InvoiceComponent,
		PinkToast 
	],
	imports: [BrowserModule, HttpClientModule, NgxSpinnerModule, SkyAlertModule, RouterModule.forRoot(routes), 
			  BrowserAnimationsModule, ToastrModule.forRoot()],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {}
