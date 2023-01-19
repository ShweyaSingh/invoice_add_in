import { Injectable } from '@angular/core';
import { ConfigModule } from '../config.module';
import { InvoiceConstants } from '../invoice/invoice.constants';
import { ExcelHandlerService } from './excel-handler.service';
import { ExcelConstants } from './excel.constants';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor(private excelHandlerService: ExcelHandlerService) { }


  /**
  * Generate Input data.
  * @returns {Promise} boolean if worksheet generated.
  */
  generateInputData() {
    // let responseTemplate = JSON.parse(ConfigModule.ResponseTemplate);

    // if (!this.excelHandlerService.workSheetExists(InvoiceConstants.MandatoryInvoiceTab)) {
    //     AdjustmentService.getTransactionCodes().then(function (tCodes) {
    //         let metaInfo = ConfigService.getInvoiceTabMetaInfo(tCodes);
    //         let columns = ConfigService.getColumnNamesFromMetaInfo(metaInfo);
    //         ExcelHandlerService.createWorksheetWithoutData(AdjustmentConstants.MandatoryInvoiceTab, getReviewTableRange(columns[0]), columns)
    //             .then(function () {
    //                 responseTemplate.Status = true;
    //                 d.resolve(responseTemplate);
    //             }).catch();
    //     }).catch(function () {
    //         // ErrorHandlerService.displayApiErrors(error);
    //         // d.resolve(responseTemplate);
    //     });
    //   }
    //   else {
    //       responseTemplate.Status = false;
    //   }
    //   return responseTemplate;
  };





}
