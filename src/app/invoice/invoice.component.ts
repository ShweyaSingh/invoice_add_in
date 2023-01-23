import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as _ from "lodash";
import { NgxSpinnerService } from "ngx-spinner";
import { AuthService } from "../auth.service";
import { ApiService } from "../Common/api.service";
import { ApiUrls } from "../Common/api.urls";
import { ConfigService } from "../config.service";
import { AuthConstants } from "../constants/auth.constants";
import {
  ApiInvoiceModel,
  distributions,
  distributionSplits,
  paymentDetail,
  transactionCodeValues,
} from "../model/ApiInvoiceModel";
import { ApprovalStatus } from "../model/approval-status.enum";
import { CreditModel, DebitModel, InvoiceModel } from "../model/InvoiceModel";
import { PostStatus } from "../model/post-status.enum";
import { TransactionCodeModel } from "../model/TransactionCodeModel";
import { ToastService } from "../toast.service";
import { TokenHandlerService } from "../token.handler.service";

@Component({
  selector: "app-invoice",
  templateUrl: "./invoice.component.html",
  styleUrls: ["./invoice.component.css"],
})
export class InvoiceComponent implements OnInit {
  constructor(
    private SpinnerService: NgxSpinnerService,
    private toastService: ToastService,
    private tokenHandler: TokenHandlerService,
    private httpClient: HttpClient,
    private apiService: ApiService,
    private authService: AuthService,
    private configService: ConfigService,
    private router: Router
  ) {}
  signOutButtonText: string = AuthConstants.SignOutButtonText;
  private subscriptionKey = "e39042bc955945f69b9586a2bf5e7a6d";
  private col_all: string[] = [];
  private transactionCodes: TransactionCodeModel[] = [];

  private col_1 = [
    "Vendor",
    "Vendor Id",
    "Invoice No",
    "Invoice date",
    "Due date",
    "Post status",
    "Amount",
    "Description",
    "Approval Status",
  ];
  private col_2 = [
    "Debit account",
    "Debit Description",
    "Debit Amount",
    "Debit Class",
    "Debit Project",
  ];
  private col_3 = [
    "Credit account",
    "Credit Amount",
    "Credit Class",
    "Credit Project",
  ];
  private col_4 = ["ID"];

  ngOnInit(): void {
    this.createTable();
  }
  signout() {
    const resp = this.authService.signOut();
    if (!resp) {
      window.location.href = this.configService.getUrl("Home");
      this.router.navigate(["/home-page"]);
    }
  }

  async createTable() {
    this.SpinnerService.show();

    let tc = await this.getTransactionCode();
    this.transactionCodes = JSON.parse(JSON.stringify(tc));
    console.log("Data: " + JSON.stringify(tc));

    for (let i = 0; i < this.transactionCodes.length; i++) {
      let colName1 = "Debit " + this.transactionCodes[i].name;
      this.col_2.push(colName1);
      let colName2 = "Credit " + this.transactionCodes[i].name;
      this.col_3.push(colName2);
    }

    this.col_all = this.col_1.concat(this.col_2, this.col_3, this.col_4);

    Excel.run(async (context) => {
      var isInvoiceSheetExist =
        context.workbook.worksheets.getItemOrNullObject("Invoice");
      await context.sync();

      if (isInvoiceSheetExist.isNullObject == true) {
        const currentWorksheet = context.workbook.worksheets.add("Invoice");
        const expensesTable = currentWorksheet.tables.add(
          this.getReviewTableRange(this.col_all),
          true /*hasHeaders*/
        );

        expensesTable.name = "InvoiceTable";

        expensesTable.getHeaderRowRange().values = [this.col_all];

        expensesTable.getRange().format.autofitColumns();
        expensesTable.getRange().format.autofitRows();
        currentWorksheet.freezePanes.freezeRows(1);
        currentWorksheet.activate();

        await context.sync();
        this.SpinnerService.hide();
      }
      this.addHandleChange();
      this.SpinnerService.hide();
    });
  }
  addHandleChange() {
    Excel.run(async (context) => {
      const worksheet = context.workbook.worksheets.getItem("Invoice");
      worksheet.onChanged.add(this.handleChange.bind(this));
      await context.sync();
    });
  }

  async handleChange(event: any) {
    await Excel.run(async (context) => {
      var col: string = event.address.match(/[a-zA-Z]+/g)[0];
      var row: string = event.address.match(/\d+/)[0];
      let colName = await this.getSingleCellValue(col + "1");
      if (row !== "1") {
        if (colName.toUpperCase() == "VENDOR") {
          try {
            await this.updateVendorId(row);
          } catch (error) {
            console.log("Caught: ", error);
          } finally {
            console.log("Done");
          }
        } else if (colName.toUpperCase() == "DEBIT ACCOUNT") {
          try {
            await this.updateAccountInfo(row, colName);
          } catch (error) {
            console.log("Caught: ", error);
          } finally {
            console.log("Done");
          }
        } else if (colName.toUpperCase() == "CREDIT ACCOUNT") {
          try {
            await this.updateAccountInfo(row, colName);
          } catch (error) {
            console.log("Caught: ", error);
          } finally {
            console.log("Done");
          }
        } else if (colName.toUpperCase() == "ID") {
          try {
            this.SpinnerService.show();

            // If ID column is changed because of invoice creation then we will not fetch invoice
            let i_vendor_id = this.col_all.indexOf(this.col_1[1]);
            let i_invoice_no = this.col_all.indexOf(this.col_1[2]);
            let i_record_id = this.col_all.indexOf(colName);

            let vendorId = await this.getSingleCellValue(
              this.toColumnName(i_vendor_id) + row
            );
            let invoiceNumber = await this.getSingleCellValue(
              this.toColumnName(i_invoice_no) + row
            );
            let recordId = await this.getSingleCellValue(
              this.toColumnName(i_record_id) + row
            );
            this.SpinnerService.hide();
            if (!(vendorId || invoiceNumber) && recordId) {
              await this.getInvoiceByIdAndUpdateRow(row, recordId);
            }
          } catch (error) {
            console.log("Caught: ", error);
            this.SpinnerService.hide();
          }
        }
      }
      await context.sync();
    }).catch(() => console.log("error123"));
  }

  async getInvoiceByIdAndUpdateRow(row: string, invoice_id: string) {
    this.SpinnerService.show();
    this.apiService
      .getInvoice(
        invoice_id,
        this.authService.getAccessToken(),
        this.subscriptionKey
      )
      .subscribe({
        next: async (res) => {
          const responseJSON = JSON.parse(JSON.stringify(res));
          // this.toastService.success("Invoice data has been retrieved.");
          await this.updateRows(responseJSON, row);
          console.log("Response: ", responseJSON);
          this.SpinnerService.hide();
        },
        error: (e) => {
          console.log("Error: ", e);
          this.toastService.error(e.error.Error);
          this.SpinnerService.hide();
        },
      });
  }

  async updateRows(apiInvoice: ApiInvoiceModel, startRowNumber: string) {
    this.SpinnerService.show();
    apiInvoice.distributions;
    const groupedData = _.groupBy(apiInvoice.distributions, (item) => {
      return [item.distribution_id];
    });
    console.log(groupedData);
    let row: number = Number(startRowNumber);
    let invoice: InvoiceModel = new InvoiceModel(
      apiInvoice.vendor_name,
      apiInvoice.vendor_id,
      apiInvoice.invoice_number,
      apiInvoice.invoice_date,
      apiInvoice.due_date,
      apiInvoice.post_status,
      apiInvoice.amount,
      apiInvoice.description,
      apiInvoice.status,
      [],
      [],
      apiInvoice.invoice_id
    );

    Object.entries(groupedData).forEach(([key]) => {
      groupedData[key].forEach((item) => {
        if (item.type_code == "Debit") {
          let debitDistribution = new DebitModel(
            item.account_number.toString(),
            item.description,
            item.amount,
            "",
            "",
            []
          );
          invoice.debitData?.push(debitDistribution);
        } else if (item.type_code == "Credit") {
          let creditDistribution = new CreditModel(
            item.account_number.toString(),
            item.amount,
            "",
            "",
            []
          );
          invoice.creditData?.push(creditDistribution);
        }
      });
      row += 1;
    });

    let i_vendor = this.toColumnName(this.col_all.indexOf(this.col_1[0]));
    let i_vendor_id = this.toColumnName(this.col_all.indexOf(this.col_1[1]));
    let i_invoice_no = this.toColumnName(this.col_all.indexOf(this.col_1[2]));
    let i_invoice_date = this.toColumnName(this.col_all.indexOf(this.col_1[3]));
    let i_due_date = this.toColumnName(this.col_all.indexOf(this.col_1[4]));
    let i_post_status = this.toColumnName(this.col_all.indexOf(this.col_1[5]));
    let i_amount = this.toColumnName(this.col_all.indexOf(this.col_1[6]));
    let i_description = this.toColumnName(this.col_all.indexOf(this.col_1[7]));
    let i_approval_status = this.toColumnName(
      this.col_all.indexOf(this.col_1[8])
    );

    let i_debit_account = this.toColumnName(
      this.col_all.indexOf(this.col_2[0])
    );
    let i_debit_description = this.toColumnName(
      this.col_all.indexOf(this.col_2[1])
    );
    let i_debit_amount = this.toColumnName(this.col_all.indexOf(this.col_2[2]));
    let i_credit_account = this.toColumnName(
      this.col_all.indexOf(this.col_3[0])
    );
    let i_credit_amount = this.toColumnName(
      this.col_all.indexOf(this.col_3[1])
    );
    let i_invoice_id = this.toColumnName(this.col_all.indexOf(this.col_4[0]));

    for (let index = Number(startRowNumber), i = 0; index < row; index++, i++) {
      let vendorCellAddress = i_vendor + index;
      let vendorIdCellAddress = i_vendor_id + index;
      let invoiceNoCellAddress = i_invoice_no + index;
      let invoiceDateCellAddress = i_invoice_date + index;
      let dueDateCellAddress = i_due_date + index;
      let postStatusCellAddress = i_post_status + index;
      let amountCellAddress = i_amount + index;
      let descriptionCellAddress = i_description + index;
      let approvalStatusCellAddress = i_approval_status + index;
      let debitAccountCellAddress = i_debit_account + index;
      let debitDescriptionCellAddress = i_debit_description + index;
      let debitAmountCellAddress = i_debit_amount + index;
      let creditAccountCellAddress = i_credit_account + index;
      let creditAmountCellAddress = i_credit_amount + index;
      let invoiceIdCellAddress = i_invoice_id + index;

      this.clearSingleCellValue(vendorCellAddress);
      this.clearSingleCellValue(vendorIdCellAddress);
      this.clearSingleCellValue(invoiceNoCellAddress);
      this.clearSingleCellValue(invoiceDateCellAddress);
      this.clearSingleCellValue(dueDateCellAddress);
      this.clearSingleCellValue(postStatusCellAddress);
      this.clearSingleCellValue(amountCellAddress);
      this.clearSingleCellValue(descriptionCellAddress);
      this.clearSingleCellValue(approvalStatusCellAddress);

      this.clearSingleCellValue(debitAccountCellAddress);
      this.clearSingleCellValue(debitDescriptionCellAddress);
      this.clearSingleCellValue(debitAmountCellAddress);
      this.clearSingleCellValue(creditAccountCellAddress);
      this.clearSingleCellValue(creditAmountCellAddress);

      await this.setSingleCellValue(vendorCellAddress, invoice.vendor);
      await this.setSingleCellValue(vendorIdCellAddress, invoice.vendorId);
      await this.setSingleCellValue(
        invoiceNoCellAddress,
        invoice.invoiceNumber
      );
      await this.setSingleCellValue(
        invoiceDateCellAddress,
        invoice.invoiceDate
      );
      await this.setSingleCellValue(dueDateCellAddress, invoice.dueDate);
      await this.setSingleCellValue(postStatusCellAddress, invoice.postStatus);
      await this.setSingleCellValue(amountCellAddress, invoice.amount);
      await this.setSingleCellValue(
        descriptionCellAddress,
        invoice.description
      );
      await this.setSingleCellValue(
        approvalStatusCellAddress,
        invoice.approvalStatus
      );

      let debit = invoice.debitData[i];
      await this.setSingleCellValue(debitAccountCellAddress, debit.account);
      await this.setSingleCellValue(
        debitDescriptionCellAddress,
        debit.description
      );
      await this.setSingleCellValue(debitAmountCellAddress, debit.amount);

      let credit = invoice.creditData[i];
      await this.setSingleCellValue(creditAccountCellAddress, credit.account);
      await this.setSingleCellValue(creditAmountCellAddress, credit.amount);

      this.clearSingleCellValue(invoiceIdCellAddress);
      await this.setSingleCellValue(
        invoiceIdCellAddress,
        invoice.recordId.toString()
      );
    }
    this.SpinnerService.hide();
  }

  async updateAccountInfo(row: string, colName: string) {
    let accountNumber: string = "";
    if (colName.toUpperCase() === "DEBIT ACCOUNT") {
      accountNumber = await this.getSingleCellValue("J" + row);
    } else if (colName.toUpperCase() === "CREDIT ACCOUNT") {
      accountNumber = await this.getSingleCellValue("T" + row);
    }

    if (accountNumber.toString().length > 0) {
      var response = await this.apiService.getAccount(
        this.authService.getAccessToken(),
        this.subscriptionKey,
        accountNumber
      );
      const responseJSON = JSON.parse(JSON.stringify(response));
      if (colName.toUpperCase() === "DEBIT ACCOUNT") {
        await this.clearSingleCellValue("K" + row);
        await this.clearSingleCellValue("M" + row);
      } else if (colName.toUpperCase() === "CREDIT ACCOUNT") {
        await this.clearSingleCellValue("V" + row);
      }
      if (responseJSON["count"] != undefined && responseJSON["count"] != 0) {
        const responseAccountDesc = responseJSON["value"]?.[0]?.["description"];
        const responseAccountClass = responseJSON["value"]?.[0]?.["class"];
        const responseAccountNo: string =
          responseJSON["value"]?.[0]?.["account_number"];
        if (responseAccountNo.toUpperCase() === accountNumber.toUpperCase()) {
          if (colName.toUpperCase() === "DEBIT ACCOUNT") {
            await this.setSingleCellValue("K" + row, responseAccountDesc);
            await this.setSingleCellValue("M" + row, responseAccountClass);
          } else if (colName.toUpperCase() === "CREDIT ACCOUNT") {
            await this.setSingleCellValue("V" + row, responseAccountClass);
          }
        }
      }
    }
  }

  async updateVendorId(row: string) {
    let vendorName: string = await this.getSingleCellValue("A" + row);
    if (vendorName.toString().length > 0) {
      var response = await this.apiService.getVendor(
        this.authService.getAccessToken(),
        this.subscriptionKey,
        vendorName
      );
      const responseJSON = JSON.parse(JSON.stringify(response));
      await this.clearSingleCellValue("B" + row);
      if (responseJSON["count"] != undefined && responseJSON["count"] != 0) {
        responseJSON["value"].forEach(async (obj: any) => {
          let objJSON = JSON.parse(JSON.stringify(obj));
          if (
            objJSON["vendor_name"].toUpperCase() === vendorName.toUpperCase()
          ) {
            await this.setSingleCellValue("B" + row, objJSON["vendor_id"]);
          }
        });
        // const responseVendorId = responseJSON['value']?.[0]?.['vendor_id'];
        // const responseVendorName: string =
        // 	responseJSON['value']?.[0]?.['vendor_name'];
        // if (responseVendorName.toUpperCase() === vendorName.toUpperCase()) {
        // 	await this.setSingleCellValue('B' + row, responseVendorId);
        // }
      }
    }
  }

  async updateRowsWithRecordId(row: number, count: number, value: number) {
    let idColumnNumber = this.toColumnName(this.col_all.indexOf(this.col_4[0]));
    for (let i = 0; i < count; i++) {
      this.SpinnerService.show();
      let rowNumber = row + i;
      let cellAddress = idColumnNumber + rowNumber;
      await this.clearSingleCellValue(cellAddress);
      await this.setSingleCellValue(cellAddress, value.toString());
      await this.setSingleRowColor(rowNumber, "#A9D08E");
      this.SpinnerService.hide();
    }
  }

  async submitData() {
    this.validate(true).then((isValid: boolean) => {
      if (isValid) {
        let i_vendor_id = this.col_all.indexOf(this.col_1[1]);
        let i_invoice_date = this.col_all.indexOf(this.col_1[3]);
        let i_due_date = this.col_all.indexOf(this.col_1[4]);
        let i_amount = this.col_all.indexOf(this.col_1[6]);
        let i_description = this.col_all.indexOf(this.col_1[7]);

        let i_debit_Acc = this.col_all.indexOf(this.col_2[0]);
        let i_debit_Desc = this.col_all.indexOf(this.col_2[1]);
        let i_debit_Amt = this.col_all.indexOf(this.col_2[2]);
        let i_debit_Class = this.col_all.indexOf(this.col_2[3]);
        let i_debit_Project = this.col_all.indexOf(this.col_2[4]);

        let i_credit_Acc = this.col_all.indexOf(this.col_3[0]);
        let i_credit_Amt = this.col_all.indexOf(this.col_3[1]);
        let i_credit_Class = this.col_all.indexOf(this.col_3[2]);
        let i_credit_Project = this.col_all.indexOf(this.col_3[3]);

        let i_record_Id = this.col_all.indexOf(this.col_4[0]);
        Excel.run(async (context) => {
          this.SpinnerService.show();
          const currentWorksheet =
            context.workbook.worksheets.getItem("Invoice");
          let expensesTable = currentWorksheet.tables.getItem("InvoiceTable");

          // // Get data from the header row.
          // let headerRange = expensesTable.getHeaderRowRange().load('values');
          // // Get data from the table.
          // let bodyRange = expensesTable.getDataBodyRange().load('values');
          // await context.sync();
          // // let headerValues = headerRange.values;
          // // let bodyValues = bodyRange.values;

          ///
          let r = context.workbook.worksheets
            .getItem("Invoice")
            .getUsedRange(true);
          r.load("values");
          await context.sync();
          let values = r.values;

          let headerValues = values[0];
          var data2 = JSON.parse(JSON.stringify(values));
          data2.shift();
          let bodyValues = data2;
          ///

          const groupedData = _.groupBy(bodyValues, (item) => {
            // return [item[0], item[1]];
            return [
              item[i_vendor_id],
              item[i_invoice_date],
              item[i_due_date],
              item[i_amount],
              item[i_description],
              item[i_record_Id],
            ];
          });

          let invoiceListWithRowId: {
            invoice: InvoiceModel;
            rowId: number;
            distributionRowCount: number;
          }[] = [];
          let rowId: number = 1;
          Object.entries(groupedData).forEach(([key]) => {
            let inv: InvoiceModel | null;
            let distributionRowCount: number = groupedData[key].length;
            groupedData[key].forEach((item) => {
              let tc_debit: string[] = [];
              let tc_credit: string[] = [];

              rowId += 1;
              for (let i = 0; i < this.transactionCodes.length; i++) {
                let i_trd = this.col_all.indexOf(
                  "Debit " + this.transactionCodes[i].name
                );
                tc_debit.push(item[i_trd]);
                let i_trc = this.col_all.indexOf(
                  "Credit " + this.transactionCodes[i].name
                );
                tc_credit.push(item[i_trc]);
              }

              if (inv == null) {
                // 1st time
                let debitModel = new DebitModel(
                  item[i_debit_Acc],
                  item[i_debit_Desc],
                  item[i_debit_Amt],
                  item[i_debit_Class],
                  item[i_debit_Project],
                  tc_debit
                );
                let creditModel = new CreditModel(
                  item[i_credit_Acc],
                  item[i_credit_Amt],
                  item[i_credit_Class],
                  item[i_credit_Project],
                  tc_credit
                );

                let recordId = item[i_record_Id]
                  ? Number(item[i_record_Id])
                  : 0;

                inv = new InvoiceModel(
                  item[0],
                  item[1],
                  item[2],
                  item[3],
                  item[4],
                  item[5],
                  item[6],
                  item[7],
                  item[8],
                  [debitModel],
                  [creditModel],
                  recordId
                );

                invoiceListWithRowId.push({
                  invoice: inv,
                  rowId,
                  distributionRowCount,
                });
              } else {
                let debitModel = new DebitModel(
                  item[i_debit_Acc],
                  item[i_debit_Desc],
                  item[i_debit_Amt],
                  item[i_debit_Class],
                  item[i_debit_Project],
                  tc_debit
                );
                let creditModel = new CreditModel(
                  item[i_credit_Acc],
                  item[i_credit_Amt],
                  item[i_credit_Class],
                  item[i_credit_Project],
                  tc_credit
                );

                inv.debitData?.push(debitModel);
                inv.creditData?.push(creditModel);
              }
            });
          });
          this.SpinnerService.hide();

          //TODO -- invoice model to API model
          // Invoice to Api Invoice model... // API Call...
          invoiceListWithRowId.forEach(async (invoiceWithRow) => {
            let x = invoiceWithRow.invoice;
            if (x.recordId === 0 || !x.recordId) {
              this.SpinnerService.show();
              let apiInvoice = new ApiInvoiceModel(
                x.vendor,
                x.vendorId,
                x.amount,
                x.description,
                x.invoiceNumber,
                x.approvalStatus,
                x.dueDate,
                new paymentDetail(),
                x.invoiceDate,
                x.postStatus,
                x.invoiceDate,
                true,
                x.recordId
              );

              ///-- payment_details --
              // let remitTo = new remit('7'); // Address Id
              // let paymentMethod = 'Check';
              // let paidFrom = 'Test Name';
              // let holdPayment = true;
              // let seperatePayment = true;
              // let payDetail = new paymentDetail(remitTo, paymentMethod, paidFrom, holdPayment, seperatePayment, '0', '0');
              // apiInvoice.payment_details = payDetail;

              /// distributions
              //let distributionsList: distributions[] = [];

              let amt;
              let accNumber;
              let typeCode;
              let des = "";

              /// Debit into distributions List
              x.debitData?.forEach((y) => {
                typeCode = "Debit";
                des = y.description;
                amt = y.amount;
                accNumber = y.account;

                let distribution = new distributions(
                  amt,
                  des,
                  accNumber,
                  typeCode,
                  [],
                  0
                );

                // transactionCodeValues
                let transCodeValues: transactionCodeValues[] = [];

                for (let i = 0; i < this.transactionCodes.length; i++) {
                  transCodeValues.push(
                    new transactionCodeValues(
                      this.transactionCodes[i].name,
                      y.transactionCodes[i],
                      this.transactionCodes[i].transaction_code_id.toString()
                    )
                  );
                }

                // distribution_splits
                // below code is for 1 split
                // TODO for multiple splits

                let uiProjectId = y.projectId;
                let percent = this.percentOf(amt, apiInvoice.amount).toString();
                let accclass = y.debitClass;

                let disSplit = new distributionSplits(
                  uiProjectId,
                  amt,
                  percent,
                  accclass,
                  transCodeValues
                );

                distribution.distribution_splits.push(disSplit);
                apiInvoice.distributions.push(distribution);
              });

              /// Credit into distributions List
              x.creditData?.forEach((z) => {
                typeCode = "Credit";
                amt = z.amount;
                accNumber = z.account;

                let distribution = new distributions(
                  amt,
                  des,
                  accNumber,
                  typeCode,
                  [],
                  0
                );

                // transactionCodeValues
                let transCodeValues: transactionCodeValues[] = [];

                for (let i = 0; i < this.transactionCodes.length; i++) {
                  transCodeValues.push(
                    new transactionCodeValues(
                      this.transactionCodes[i].name,
                      z.transactionCodes[i],
                      this.transactionCodes[i].transaction_code_id.toString()
                    )
                  );
                }

                // distribution_splits
                // below code is for 1 split
                // TODO for multiple splits

                let uiProjectId = z.projectId;
                let percent = this.percentOf(amt, apiInvoice.amount).toString();
                let accclass = z.creditClass;

                let disSplit = new distributionSplits(
                  uiProjectId,
                  amt,
                  percent,
                  accclass,
                  transCodeValues
                );

                distribution.distribution_splits.push(disSplit);
                apiInvoice.distributions.push(distribution);
              });
              this.SpinnerService.hide();
              console.log("APiInvoice", JSON.stringify(apiInvoice));
              // API call
              await this.createInvoice(
                apiInvoice,
                bodyValues,
                i_debit_Acc,
                i_credit_Acc,
                invoiceWithRow.rowId,
                invoiceWithRow.distributionRowCount
              );
            } else {
              for (let i = 0; i < invoiceWithRow.distributionRowCount; i++) {
                let rowNumber = invoiceWithRow.rowId + i;
                await this.setSingleRowColor(rowNumber, "#A9D08E");
              }
            }
          });
        });
      }
    });
  }

  async createInvoice(
    body: ApiInvoiceModel,
    bodyValues: any,
    i_debit_Acc: number,
    i_credit_Acc: number,
    row: number,
    count: number
  ) {
    this.SpinnerService.show();
    this.apiService
      .postInvoice(
        body,
        this.authService.getAccessToken(),
        this.subscriptionKey
      )
      .subscribe({
        next: (res) => {
          const responseJSON = JSON.parse(JSON.stringify(res));
          this.toastService.successWithLink(
            responseJSON["record_id"]);
          this.SpinnerService.hide();
          this.updateRowsWithRecordId(row, count, responseJSON["record_id"]);
        },
        error: (e) => {
          console.log("Error: ", e);
          this.errorHandle(
            e,
            bodyValues,
            i_debit_Acc,
            i_credit_Acc,
            row,
            count
          );
          this.SpinnerService.hide();
        },
      });
  }

  getTransactionCode() {
    return this.httpClient
      .get(ApiUrls.GetTransactionCodes, {
        headers: {
          "Content-Type": "application/json",
          "Bb-Api-Subscription-Key": this.subscriptionKey,
          Authorization: "Bearer " + this.authService.getAccessToken(),
        },
        responseType: "json",
      })
      .toPromise();
  }

  getTransactionCodeValues(transactionCodeId: string) {
    let url = ApiUrls.GetTransactionCodeValuesUrl.replace(
      "{0}",
      transactionCodeId
    );
    return this.httpClient
      .get(url, {
        headers: {
          "Content-Type": "application/json",
          "Bb-Api-Subscription-Key": this.subscriptionKey,
          Authorization: "Bearer " + this.authService.getAccessToken(),
        },
        responseType: "json",
      })
      .toPromise();
  }

  getClass() {
    return this.httpClient
      .get(ApiUrls.GetClassUrl, {
        headers: {
          "Content-Type": "application/json",
          "Bb-Api-Subscription-Key": this.subscriptionKey,
          Authorization: "Bearer " + this.authService.getAccessToken(),
        },
        responseType: "json",
      })
      .toPromise();
  }

  getClassesList(classes: any[]) {
    let array = classes;
    let response: string[] = [];
    array.map(function (a) {
      let res = "";
      if (a.inactive == false) {
        if (typeof a.value === "string") {
          res = a.value.toLowerCase();
        } else {
          res = a.value;
        }
        response.push(res);
      }
    });
    return response;
  }

  async getTc() {
    let _tc = JSON.parse(JSON.stringify(await this.getTransactionCode()));
    let tcDataCollection: any[] = [];
    let endCount = 0;

    for (let i = 0; i < _tc.length; i++) {
      let tcData = { name: _tc[i].name, values: [] };
      tcDataCollection.push(tcData);

      let transactionCodevalues = JSON.parse(
        JSON.stringify(
          await this.getTransactionCodeValues(_tc[i].transaction_code_id)
        )
      );

      endCount++;
      for (let j = 0; j < transactionCodevalues.length; j++) {
        let fr = tcDataCollection.filter(
          (obj) => obj.name == transactionCodevalues[j].name
        )[0];

        let tcVal = "";
        if (typeof transactionCodevalues[j].value === "string") {
          tcVal = transactionCodevalues[j].value.toLowerCase();
        } else {
          tcVal = transactionCodevalues[j].value;
        }
        fr.values.push(tcVal);
      }
    }
    return tcDataCollection;
  }

  getReviewTableRange(columns: any[]) {
    let len = columns.length;
    if (len === 14) {
      return "A1:N1";
    } else if (len === 15) {
      return "A1:O1";
    } else if (len === 16) {
      return "A1:P1";
    } else if (len === 17) {
      return "A1:Q1";
    } else if (len === 18) {
      return "A1:R1";
    } else if (len === 19) {
      return "A1:S1";
    } else if (len === 20) {
      return "A1:T1";
    } else if (len === 21) {
      return "A1:U1";
    } else if (len === 22) {
      return "A1:V1";
    } else if (len === 23) {
      return "A1:W1";
    } else if (len === 24) {
      return "A1:X1";
    } else if (len === 25) {
      return "A1:Y1";
    } else if (len === 26) {
      return "A1:Z1";
    } else if (len === 27) {
      return "A1:AA1";
    } else if (len === 28) {
      return "A1:AB1";
    } else if (len === 29) {
      return "A1:AC1";
    } else if (len === 30) {
      return "A1:AD1";
    } else if (len === 31) {
      return "A1:AE1";
    } else if (len === 32) {
      return "A1:AF1";
    } else if (len === 33) {
      return "A1:AG1";
    } else if (len === 34) {
      return "A1:AH1";
    } else if (len === 35) {
      return "A1:AI1";
    } else {
      return "A1:AA1";
    }
  }

  async validate(fromSubmitData: boolean = false) {
    this.SpinnerService.show();
    let _class = JSON.parse(JSON.stringify(await this.getClass()));
    let filteredClass = this.getClassesList(_class);
    let tcDataCollection = await this.getTc();

    return this.getReviewTabData().then(async (response: any[]) => {
      let len = response.length;
      let invoiceIdColNo = this.toColumnName(
        this.col_all.indexOf(this.col_4[0])
      );
      for (let row = 2; row <= len; row++) {
        let invoiceId = await this.getSingleCellValue(invoiceIdColNo + row);
        if (!invoiceId) {
          this.setSingleRowColor(row);
        }
      }
      return this.validateReviewPage(
        response,
        filteredClass,
        tcDataCollection,
        fromSubmitData
      );
    });
  }
  // ExcelDateToJSDate = function (date: number) {
  // 	var currentDate = new Date();
  // 	if (currentDate.toString().indexOf('India Standard Time') === -1) {
  // 		return new Date(Math.round((date - 25568) * 86400 * 1000));
  // 	} else {
  // 		return new Date(Math.round((date - 25569) * 86400 * 1000));
  // 	}
  // };
  SerialDateToJSDate(excelSerialDate: any): Date {
    return new Date(Date.UTC(0, 0, excelSerialDate - 1));
  }

  validateReviewPage(
    data: any[],
    filteredClass: any[],
    tcDataCollection: any[],
    fromSubmitData: boolean
  ): boolean {
    let headers = data[0];
    var data2 = JSON.parse(JSON.stringify(data));
    delete data2[0];
    let reviewData = data2;
    const vd: any[] = [];
    let response = { Headers: headers, ErrorsCount: 0, ValidationData: vd };
    let isDataValid: boolean = false;

    if (reviewData.length > 1) {
      var invoiceObj = undefined;
      const invoiceObjRows: any[] = [];

      for (let index = 1; index < reviewData.length; index++) {
        let currentRowData = reviewData[index];
        let row = index; // + 1;

        let vendorId = this.getCellValue(
          this.col_1[1],
          headers,
          currentRowData
        );
        let invoiceNumber = this.getCellValue(
          this.col_1[2],
          headers,
          currentRowData
        );

        var excelInvoiceDate = this.getCellValue(
          this.col_1[3],
          headers,
          currentRowData
        );

        var excelDueDate = this.getCellValue(
          this.col_1[4],
          headers,
          currentRowData
        );

        var excelPostStatus = this.getCellValue(
          this.col_1[5],
          headers,
          currentRowData
        );

        var excelApprovalStatus = this.getCellValue(
          this.col_1[8],
          headers,
          currentRowData
        );

        let drAcountNr = this.getCellValue(
          "Debit account",
          headers,
          currentRowData
        );
        let crAcountNr = this.getCellValue(
          "Credit account",
          headers,
          currentRowData
        );

        let debitClass = this.getCellValue(
          "Debit Class",
          headers,
          currentRowData
        );
        let creditClass = this.getCellValue(
          "Credit Class",
          headers,
          currentRowData
        );
        let amount = this.getCellValue("Amount", headers, currentRowData);
        let debitAmount = this.getCellValue(
          "Debit Amount",
          headers,
          currentRowData
        );
        let creditAmount = this.getCellValue(
          "Credit Amount",
          headers,
          currentRowData
        );

        if (invoiceObj === undefined) {
          invoiceObj = {
            VendorId: vendorId,
            HasRowValidationErrors: false,
            ErrorMessage: "",
            Rows: invoiceObjRows,
          };
          response.ValidationData.push(invoiceObj);
        }

        const er: string[] = [];
        const invalidTc: string[] = [];
        let rowObj = {
          Row: row,
          InvalidVendorId: false,
          InvalidInvoiceNumber: false,
          InvalidPostStatus: false,
          InvalidApprovalStatus: false,
          InvalidCrAccount: false,
          InvalidDrAccount: false,
          InvalidInvoiceDate: false,
          InvalidDueDate: false,
          InvalidAmount: false,
          InvalidDrAmount: false,
          InvalidCrAmount: false,
          InvalidCrClass: false,
          InvalidDrClass: false,
          HasErrors: false,
          Errors: er,
          InvalidTransactionCodes: invalidTc,
        };

        //Validate vendor id
        if (vendorId === "") {
          invoiceObj.HasRowValidationErrors = true;
          rowObj.HasErrors = true;
          rowObj.InvalidVendorId = true;
          response.ErrorsCount = response.ErrorsCount + 1;
          rowObj.Errors.push("UiStrings.InvalidVendorId");
        }

        //Validate invoice number
        if (invoiceNumber === "") {
          invoiceObj.HasRowValidationErrors = true;
          rowObj.HasErrors = true;
          rowObj.InvalidInvoiceNumber = true;
          response.ErrorsCount = response.ErrorsCount + 1;
          rowObj.Errors.push("UiStrings.InvalidInvoiceNumber");
        }

        //Validate post status
        if (
          excelPostStatus === "" ||
          !this.isValidPostStatus(excelPostStatus.toString())
        ) {
          invoiceObj.HasRowValidationErrors = true;
          rowObj.HasErrors = true;
          rowObj.InvalidPostStatus = true;
          response.ErrorsCount = response.ErrorsCount + 1;
          rowObj.Errors.push("UiStrings.InvalidPostStatus");
        }

        //Validate Approval status
        if (
          excelApprovalStatus === "" ||
          !this.isValidApprovalStatus(excelApprovalStatus.toString())
        ) {
          invoiceObj.HasRowValidationErrors = true;
          rowObj.HasErrors = true;
          rowObj.InvalidApprovalStatus = true;
          response.ErrorsCount = response.ErrorsCount + 1;
          rowObj.Errors.push("UiStrings.InvalidApprovalStatus");
        }

        //Validate debit account
        if (drAcountNr === "") {
          invoiceObj.HasRowValidationErrors = true;
          rowObj.HasErrors = true;
          rowObj.InvalidDrAccount = true;
          response.ErrorsCount = response.ErrorsCount + 1;
          rowObj.Errors.push("UiStrings.InvalidDrAcNumber");
        }

        //Validate credit account
        if (crAcountNr === "") {
          invoiceObj.HasRowValidationErrors = true;
          rowObj.HasErrors = true;
          rowObj.InvalidCrAccount = true;
          response.ErrorsCount = response.ErrorsCount + 1;
          rowObj.Errors.push("UiStrings.InvalidCrAcNumber");
        }

        // Validate class
        if (
          debitClass === "" ||
          filteredClass.indexOf(debitClass.toString().toLowerCase()) === -1
        ) {
          invoiceObj.HasRowValidationErrors = true;
          rowObj.HasErrors = true;
          rowObj.InvalidDrClass = true;
          response.ErrorsCount = response.ErrorsCount + 1;
          rowObj.Errors.push("UiStrings.InvalidClass");
        }

        if (
          creditClass === "" ||
          filteredClass.indexOf(creditClass.toString().toLowerCase()) === -1
        ) {
          invoiceObj.HasRowValidationErrors = true;
          rowObj.HasErrors = true;
          rowObj.InvalidCrClass = true;
          response.ErrorsCount = response.ErrorsCount + 1;
          rowObj.Errors.push("UiStrings.InvalidClass");
        }

        // Validate Amount
        if (amount === "" || isNaN(Number(amount))) {
          invoiceObj.HasRowValidationErrors = true;
          rowObj.HasErrors = true;
          rowObj.InvalidAmount = true;
          response.ErrorsCount = response.ErrorsCount + 1;
          rowObj.Errors.push("UiStrings.InvalidAmount");
        }
        if (debitAmount === "" || isNaN(Number(debitAmount))) {
          invoiceObj.HasRowValidationErrors = true;
          rowObj.HasErrors = true;
          rowObj.InvalidDrAmount = true;
          response.ErrorsCount = response.ErrorsCount + 1;
          rowObj.Errors.push("UiStrings.InvalidDebitAmount");
        }
        if (creditAmount === "" || isNaN(Number(creditAmount))) {
          invoiceObj.HasRowValidationErrors = true;
          rowObj.HasErrors = true;
          rowObj.InvalidCrAmount = true;
          response.ErrorsCount = response.ErrorsCount + 1;
          rowObj.Errors.push("UiStrings.InvalidCreditAmount");
        }

        //Validate invoice date
        // let invoiceDate = new Date(
        // 	Math.round((toInteger(excelInvoiceDate) - 25569) * 86400 * 1000)
        // );
        //console.log('JSDate: ', excelInvoiceDateJS);
        //let parsedInvDate = new Date(invoiceDate);
        let excelInvoiceDateJS: Date = new Date(excelInvoiceDate.toString());
        var format =
          /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
        if (excelInvoiceDateJS.toString() === "Invalid Date") {
          invoiceObj.HasRowValidationErrors = true;
          rowObj.HasErrors = true;
          rowObj.InvalidInvoiceDate = true;
          response.ErrorsCount = response.ErrorsCount + 1;
          rowObj.Errors.push("UiStrings.InvalidInvoiceDate");
        } else if (!format.test(excelInvoiceDateJS.toISOString())) {
          invoiceObj.HasRowValidationErrors = true;
          rowObj.HasErrors = true;
          rowObj.InvalidInvoiceDate = true;
          response.ErrorsCount = response.ErrorsCount + 1;
          rowObj.Errors.push("UiStrings.InvalidInvoiceDate");
        }

        // // Validate due date
        let excelDueDateJS: Date = new Date(excelDueDate.toString());
        var format =
          /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
        if (excelDueDateJS.toString() === "Invalid Date") {
          invoiceObj.HasRowValidationErrors = true;
          rowObj.HasErrors = true;
          rowObj.InvalidDueDate = true;
          response.ErrorsCount = response.ErrorsCount + 1;
          rowObj.Errors.push("UiStrings.InvalidDueDate");
        } else if (!format.test(excelDueDateJS.toISOString())) {
          invoiceObj.HasRowValidationErrors = true;
          rowObj.HasErrors = true;
          rowObj.InvalidDueDate = true;
          response.ErrorsCount = response.ErrorsCount + 1;
          rowObj.Errors.push("UiStrings.InvalidDueDate");
        }

        // Validate transaction codes
        for (let i = 0; i < tcDataCollection.length; i++) {
          let tcValue = this.getCellValue(
            "Debit " + tcDataCollection[i].name,
            headers,
            currentRowData
          );
          if (
            tcValue !== "" &&
            tcDataCollection[i].values.indexOf(
              tcValue.toString().toLowerCase()
            ) === -1
          ) {
            invoiceObj.HasRowValidationErrors = true;
            rowObj.HasErrors = true;
            response.ErrorsCount = response.ErrorsCount + 1;
            rowObj.InvalidTransactionCodes.push(
              "Debit " + tcDataCollection[i].name
            );
            rowObj.Errors.push(
              "Debit " + tcDataCollection[i].name + " is invalid"
            );
          }

          let tcCrValue = this.getCellValue(
            "Credit " + tcDataCollection[i].name,
            headers,
            currentRowData
          );
          if (
            tcCrValue !== "" &&
            tcDataCollection[i].values.indexOf(
              tcCrValue.toString().toLowerCase()
            ) === -1
          ) {
            invoiceObj.HasRowValidationErrors = true;
            rowObj.HasErrors = true;
            response.ErrorsCount = response.ErrorsCount + 1;
            rowObj.InvalidTransactionCodes.push(
              "Credit " + tcDataCollection[i].name
            );
            rowObj.Errors.push(
              "Credit " + tcDataCollection[i].name + " is invalid"
            );
          }
        }

        invoiceObj.Rows.push(rowObj);
      }

      let filteredInvoices = response.ValidationData.filter(
        (obj) => obj.HasRowValidationErrors == true
      );

      if (filteredInvoices.length > 0) {
        for (let j = 0; j < filteredInvoices.length; j++) {
          let currentInvoice = filteredInvoices[j];

          let filteredRows = currentInvoice.Rows.filter(
            (ob: { HasErrors: boolean }) => ob.HasErrors == true
          );
          for (let k = 0; k < filteredRows.length; k++) {
            let row = filteredRows[k].Row + 1;

            if (filteredRows[k].InvalidVendorId) {
              this.markCellRed(
                row,
                this.toColumnName(headers.indexOf(this.col_1[1]))
              );
            }
            if (filteredRows[k].InvalidInvoiceNumber) {
              this.markCellRed(
                row,
                this.toColumnName(headers.indexOf(this.col_1[2]))
              );
            }
            if (filteredRows[k].InvalidInvoiceDate) {
              this.markCellRed(
                row,
                this.toColumnName(headers.indexOf(this.col_1[3]))
              );
            }
            if (filteredRows[k].InvalidDueDate) {
              this.markCellRed(
                row,
                this.toColumnName(headers.indexOf(this.col_1[4]))
              );
            }
            if (filteredRows[k].InvalidPostStatus) {
              this.markCellRed(
                row,
                this.toColumnName(headers.indexOf(this.col_1[5]))
              );
            }
            if (filteredRows[k].InvalidApprovalStatus) {
              this.markCellRed(
                row,
                this.toColumnName(headers.indexOf(this.col_1[8]))
              );
            }

            if (filteredRows[k].InvalidDrAccount) {
              this.markCellRed(
                row,
                this.toColumnName(headers.indexOf("Debit account"))
              );
            }
            if (filteredRows[k].InvalidCrAccount) {
              this.markCellRed(
                row,
                this.toColumnName(headers.indexOf("Credit account"))
              );
            }
            if (filteredRows[k].InvalidDrClass) {
              this.markCellRed(
                row,
                this.toColumnName(headers.indexOf("Debit Class"))
              );
            }
            if (filteredRows[k].InvalidCrClass) {
              this.markCellRed(
                row,
                this.toColumnName(headers.indexOf("Credit Class"))
              );
            }
            if (filteredRows[k].InvalidAmount) {
              this.markCellRed(
                row,
                this.toColumnName(headers.indexOf("Amount"))
              );
            }
            if (filteredRows[k].InvalidDrAmount) {
              this.markCellRed(
                row,
                this.toColumnName(headers.indexOf("Debit Amount"))
              );
            }
            if (filteredRows[k].InvalidCrAmount) {
              this.markCellRed(
                row,
                this.toColumnName(headers.indexOf("Credit Amount"))
              );
            }

            ////Write invalid tc errors
            if (filteredRows[k].InvalidTransactionCodes.length > 0) {
              for (
                let l = 0;
                l < filteredRows[k].InvalidTransactionCodes.length;
                l++
              ) {
                let tcIndex = headers.indexOf(
                  filteredRows[k].InvalidTransactionCodes[l]
                );
                this.markCellRed(row, this.toColumnName(tcIndex));
              }
            }
            this.toastService.error(
              "Invalid data. Please verify the data in row number " + row + "."
            );
          }
        }
      } else {
        //show success message
        // if (fromSubmitData) {
        // }
        this.toastService.success("Records has been validated.");
        isDataValid = true;
      }
    } else {
      this.toastService.error("Data does not exist.");
    }
    this.SpinnerService.hide();
    return isDataValid;
  }

  getReviewTabData(): Promise<any[]> {
    let values;
    return Excel.run(async (context) => {
      let r = context.workbook.worksheets.getItem("Invoice").getUsedRange(true);
      r.load("values");
      await context.sync();
      values = r.values;

      if (values === null) {
        throw new Error("UiStrings.IncompleteRows");
      }

      return values;
    });
  }

  toColumnName(num: number) {
    num = num + 1;
    for (var ret = "", a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
      ret =
        String.fromCharCode(parseInt(((num % b) / a).toString()) + 65) + ret;
    }
    return ret;
  }

  getCellValue(columnName: string, columnHeader: any[], rowData: any[]) {
    let index = columnHeader.indexOf(columnName);
    let response: String = "";
    if (index !== -1) {
      response = String(rowData[index]).trim();
    } else {
      throw new Error("UiStrings.InvalidCell");
    }
    return response;
  }

  markCellRed(row: any, column: string) {
    return Excel.run(function (context) {
      var sheet = context.workbook.worksheets.getItem("Invoice");
      let cell = row;
      var range = sheet.getRange(column + cell);
      range.format.fill.color = "Red";
      return context.sync();
    });
  }
  async getSingleCellValue(cellAddress: string) {
    let cellData: any;
    await Excel.run(async (context) => {
      let sheet = context.workbook.worksheets.getItem("Invoice");
      let cell = sheet.getRange(cellAddress);
      cell.load(["values"]);
      await context.sync();
      cellData = cell.values[0][0];
      await context.sync();
    });
    return cellData;
  }
  async setSingleCellValue(cellAddress: string, value: string) {
    await Excel.run(async (context) => {
      let sheet = context.workbook.worksheets.getItem("Invoice");
      let cell = sheet.getRange(cellAddress);
      cell.values = [[value]];
      await context.sync();
    });
  }
  async clearSingleCellValue(cellAddress: string) {
    await Excel.run(async (context) => {
      let sheet = context.workbook.worksheets.getItem("Invoice");
      let cell = sheet.getRange(cellAddress);
      cell.clear();
      await context.sync();
    });
  }
  async setSingleRowColor(rowNumber: number, color?: string) {
    await Excel.run(async (context) => {
      var sheet = context.workbook.worksheets.getItem("Invoice");
      var range = sheet.getRange("A" + rowNumber + ":AC" + rowNumber);
      if (color) {
        range.format.fill.color = color;
      } else {
        range.format.fill.clear();
      }
      await context.sync();
    });
  }

  percentOf(transactionAmount: any, totalAmount: any) {
    return (transactionAmount / totalAmount) * 100;
  }

  isValidPostStatus(excelApprovalStatus: string) {
    return (
      PostStatus.NotPosted === excelApprovalStatus ||
      PostStatus.Posted === excelApprovalStatus ||
      PostStatus.DoNotPost === excelApprovalStatus
    );
  }

  isValidApprovalStatus(excelApprovalStatus: string) {
    return (
      ApprovalStatus.Approved === excelApprovalStatus ||
      ApprovalStatus.Pending === excelApprovalStatus
    );
  }

  errorHandle(
    e: any,
    bodyValues: any,
    i_debit_Acc: number,
    i_credit_Acc: number,
    row: number,
    distributionRowCount: number
  ) {
    if (e.error.ErrorPath == null) {
      this.toastService.error(
        e.error.Error +
          ". Error detail: " +
          e.error.Details[0] +
          " Row Number: " +
          row
      );
    } else {
      this.toastService.error(
        "Error: " + e.error.Details[0] + " Row Number: " + row
      );

      let ep = e.error.ErrorPath.split(".");
      let errorType = ep[2].toString().toUpperCase();

      /// markRed based on type
      if (errorType == "debitaccountnumber".toUpperCase()) {
        let errDetail: string = e.error.Details[0];

        let key1 = "accounts";
        let key2 = "and";
        let key3 = ".";
        let key4 = "accounts '";
        let key5 = "' does";
        let dAcc;
        let cAcc;

        if (errDetail.indexOf(key1) == -1 && errDetail.indexOf(key2) == -1) {
          dAcc = errDetail
            .substring(
              errDetail.indexOf(key4) + key4.length,
              errDetail.indexOf(key5)
            )
            .trim();

          for (let i = 0; i < bodyValues.length; i++) {
            if (
              dAcc == bodyValues[i][i_debit_Acc] ||
              dAcc == bodyValues[i][i_credit_Acc]
            ) {
              this.markCellRed(i + 2, this.toColumnName(i_debit_Acc));
              this.markCellRed(i + 2, this.toColumnName(i_credit_Acc));
            }
          }
        } else {
          dAcc = errDetail
            .substring(
              errDetail.indexOf(key1) + key1.length,
              errDetail.indexOf(key2)
            )
            .trim();
          cAcc = errDetail
            .substring(
              errDetail.indexOf(key2) + key2.length,
              errDetail.indexOf(key3)
            )
            .trim();
          for (let i = 0; i < bodyValues.length; i++) {
            if (
              dAcc == bodyValues[i][i_debit_Acc] &&
              cAcc == bodyValues[i][i_credit_Acc]
            ) {
              this.markCellRed(i + 2, this.toColumnName(i_debit_Acc));
              this.markCellRed(i + 2, this.toColumnName(i_credit_Acc));
            }
          }
        }
      }
      if (errorType == "VENDOR") {
        let i_vendor_name = this.col_all.indexOf("Vendor");
        let i_vendor_id = this.col_all.indexOf("Vendor Id");
        for (let i = 0; i < distributionRowCount; i++) {
          let rowNumber = row + i;
          this.markCellRed(rowNumber, this.toColumnName(i_vendor_name));
          this.markCellRed(rowNumber, this.toColumnName(i_vendor_id));
        }
      }
    }
  }
}
