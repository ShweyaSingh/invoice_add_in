export class ApiUrls {
	public static getInvoice =
		'https://api.sky.blackbaud.com/accountspayable/v1/invoices/{0}';
	public static postInvoice =
		'https://api.sky.blackbaud.com/accountspayable/v1/invoices';
	public static getVendor =
		'https://api.sky.blackbaud.com/accountspayable/v1/vendors?vendor_name={0}';
	public static getAccount =
		'https://api.sky.blackbaud.com/generalledger/v1/accounts?search_text={0}';
	public static GetTransactionCodes =
		'https://api.sky.blackbaud.com/accountspayable/v1/transactioncodes';
	public static GetTransactionCodeValuesUrl =
		'https://api.sky.blackbaud.com/accountspayable/v1/transactioncodes/{0}/values';
	public static GetClassUrl =
		'https://api.sky.blackbaud.com/generalledger/v1/classes';
}
