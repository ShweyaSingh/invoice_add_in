import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiInvoiceModel} from '../model/ApiInvoiceModel';
import {ApiUrls} from './api.urls';

@Injectable({
	providedIn: 'root'
})
export class ApiService {
	constructor(private httpClient: HttpClient) {}

	public async getAccount(
		token: string | null,
		subscriptionKey: string,
		accountNumber: string
	) {
		const accountUrl = ApiUrls.getAccount.replace('{0}', accountNumber);
		const headers = {
			'Content-Type': 'application/json',
			'Bb-Api-Subscription-Key': subscriptionKey,
			Authorization: 'Bearer ' + token
		};
		return this.httpClient
			.get(accountUrl, {
				headers,
				responseType: 'json'
			})
			.toPromise();
	}

	public async getVendor(
		token: string | null,
		subscriptionKey: string,
		vendorName: string
	) {
		const vendorIdUrl = ApiUrls.getVendor.replace('{0}', vendorName);
		const headers = {
			'Content-Type': 'application/json',
			'Bb-Api-Subscription-Key': subscriptionKey,
			Authorization: 'Bearer ' + token
		};
		return this.httpClient
			.get(vendorIdUrl, {
				headers,
				responseType: 'json'
			})
			.toPromise();
	}

	public postInvoice(
		invoice: ApiInvoiceModel,
		token: string | null,
		subscriptionKey: string
	) {
		const headers = {
			'Content-Type': 'application/json',
			'Bb-Api-Subscription-Key': subscriptionKey,
			Authorization: 'Bearer ' + token
		};
		return this.httpClient.post<ApiInvoiceModel>(ApiUrls.postInvoice, invoice, {
			headers,
			responseType: 'json'
		});
	}

	public getInvoice(
		invoiceId: string,
		token: string | null,
		subscriptionKey: string
	) {
		const getInvoiceUrl = ApiUrls.getInvoice.replace('{0}', invoiceId);
		const headers = {
			'Content-Type': 'application/json',
			'Bb-Api-Subscription-Key': subscriptionKey,
			Authorization: 'Bearer ' + token
		};
		return this.httpClient.get<ApiInvoiceModel>(getInvoiceUrl, {
			headers,
			responseType: 'json'
		});
	}
}
