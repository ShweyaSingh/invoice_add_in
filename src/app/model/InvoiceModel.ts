export class InvoiceModel {
	vendor: string;
	vendorId: string;
	invoiceNumber: string;
	invoiceDate: string;
	dueDate: string;
	postStatus: string;
	amount: string;
	description: string;
	approvalStatus: string;
	debitData: DebitModel[];
	creditData: CreditModel[];
	recordId: number;
	
	public constructor(vendor: string, vendorId: string, invoiceNumber: string, invoiceDate: string, dueDate: string,
		postStatus: string, amount: string, description: string,approvalStatus: string,
	    debitData: DebitModel[], creditData: CreditModel[], recordId: number){
		this.vendor = vendor;
		this.vendorId = vendorId;
		this.invoiceNumber = invoiceNumber;
		this.invoiceDate = invoiceDate
		this.dueDate = dueDate
		this.postStatus = postStatus;
		this.amount = amount;
		this.description = description;
		this.approvalStatus = approvalStatus;
		this.debitData = debitData;
		this.creditData = creditData;
		this.recordId = recordId;
	}

	// vendor: string;
	// approvalStatus: string;
	// debitData: DebitModel[] | undefined;
	// creditData: CreditModel[] | undefined;
	// public constructor(vendor: string,approvalStatus: string,
	//     debitData: DebitModel[], creditData: CreditModel[]){
	// 	this.vendor = vendor,
	// 	this.approvalStatus = approvalStatus,
	// 	this.debitData = debitData,
	// 	this.creditData = creditData
	// }
}

export class DebitModel {
	account: string;
	description: string;
	amount: string;
	debitClass: string;
	projectId: string;
	transactionCodes: string[];

	public constructor(account: string, description: string, amount: string, debitClass: string, projectId: string, transactionCodes: string[]){

		this.account = account;
		this.description = description;
		this.amount = amount;
		this.debitClass = debitClass;
		this.projectId = projectId;
		this.transactionCodes = transactionCodes;
	}
}

export class CreditModel {
	account: string;
	amount: string;
	creditClass: string;
	projectId: string;
	transactionCodes: string[];

	public constructor(account: string, amount: string, creditClass: string, projectId: string, transactionCodes: string[]){

		this.account = account;
		this.amount = amount;
		this.creditClass = creditClass;
		this.projectId = projectId;
		this.transactionCodes = transactionCodes;
	}
}
