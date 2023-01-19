export class ApiInvoiceModel {
	vendor_name: string;
	vendor_id: string;
	amount: string;
	description: string;
	invoice_number: string;
	status: string;
	due_date: string;
	payment_details: paymentDetail | undefined;
	invoice_date: string;
	post_status: string;
	post_date: string;
	distribute_discounts: boolean;
	distributions: distributions[];
	custom_fields: [];
	form_1099_box_numbers: [];
	invoice_id: number

	public constructor(
		vendorName: string,
		vendorId: string,
		amount: string,
		description: string,
		invoiceNumber: string,
		approvalStatus: string,
		dueDate: any,
		paymentDetails: paymentDetail | undefined,
		invoiceDate: any,
		postStatus: string,
		postDate: any,
		distributeDiscounts: boolean,
		invoiceId: number
		//,distributions: distributions[]
	) {
		this.vendor_name = vendorName;
		this.vendor_id = vendorId;
		this.amount = amount;
		this.description = description;
		this.invoice_number = invoiceNumber;
		this.status = approvalStatus;
		this.due_date = dueDate
		this.payment_details = paymentDetails;
		this.invoice_date = invoiceDate
		this.post_status = postStatus;
		this.post_date = postDate
		this.distribute_discounts = distributeDiscounts;
		this.distributions = [];
		this.custom_fields = [];
		this.form_1099_box_numbers = [];
		this.invoice_id = invoiceId;
	}

	// public constructor(vendorId: string,
	// 	approvalStatus: string, distributeDiscounts: boolean
	// 	//,distributions: distributions[]
	// 	){
	// 		this.vendor_id = vendorId;
	// 		this.amount = 'amount';
	// 		this.description = 'description';
	// 		this.invoice_number = 'invoiceNumber';
	// 		this.approval_status = approvalStatus;
	// 		this.due_date = 'dueDate';
	// 		this.payment_details = undefined;
	// 		this.invoice_date = 'invoiceDate';
	// 		this.post_status = 'postStatus';
	// 		this.post_date = 'postDate';
	// 		this.distributeDiscounts = distributeDiscounts;
	// 		this.distributions = [];
	// 		this.custom_fields = [];
	// 		this.form_1099_box_numbers = [];
	// 	}
}

export class paymentDetail {
	// remit_to: remit;
	// payment_method: string;
	// paid_from: string;
	// hold_payment: boolean;
	// create_separate_payment: boolean;
	// credit_card_account_id: string;
	// credit_card_id: string;
	// public constructor(remitTo: remit, paymentMethod: string, paidFrom: string, holdPayment: boolean,
	// 	seperatePayment: boolean, creditCardAccId: string, creditCardId: string){
	// 	this.remit_to = remitTo;
	// 	this.payment_method = paymentMethod;
	// 	this.paid_from = paidFrom;
	// 	this.hold_payment = holdPayment;
	// 	this.create_separate_payment = seperatePayment;
	// 	this.credit_card_account_id = creditCardAccId;
	// 	this.credit_card_id = creditCardId;
	// }
}
export class remit {
	remitTo: string;

	public constructor(remitTo: string) {
		this.remitTo = remitTo;
	}
}

export class distributions {
	amount: string;
	description: string;
	account_number: string;
	type_code: string;
	distribution_splits: distributionSplits[];
	custom_fields: [];
	distribution_id: number

	public constructor(
		amount: string,
		description: string,
		accountNumber: string,
		typeCode: string,
		distributionSplits: distributionSplits[],
		distributionId: number
	) {
		this.amount = amount;
		this.description = description;
		this.account_number = accountNumber;
		this.type_code = typeCode;
		this.distribution_splits = distributionSplits;
		this.custom_fields = [];
		this.distribution_id = distributionId;
	}
}

export class distributionSplits {
	ui_project_id: string;
	amount: string;
	percent: string;
	account_class: string;
	transaction_code_values: transactionCodeValues[];

	public constructor(
		ui_project_id: string,
		amount: string,
		percent: string,
		account_class: string,
		transaction_code_values: transactionCodeValues[]
	) {
		this.ui_project_id = ui_project_id;
		this.amount = amount;
		this.percent = percent;
		this.account_class = account_class;
		this.transaction_code_values = transaction_code_values;
	}
}
export class transactionCodeValues {
	name: string;
	value: string;
	id: string;

	public constructor(name: string, value: string, id: string) {
		this.name = name;
		this.value = value;
		this.id = id;
	}
}
