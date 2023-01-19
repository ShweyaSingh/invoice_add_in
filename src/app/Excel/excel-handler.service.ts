import { Injectable } from '@angular/core';
import { CommonService } from '../common.service';

@Injectable({
  providedIn: 'root'
})
export class ExcelHandlerService {

  constructor(private commonService: CommonService) { 
  }

  /**
 * Clear validation errors from worksheet.
 * @param {string} worksheet - Worsheet name
 * @param {string} selectedRange - Range selected in worksheet
 */
  clearValidationErrors(worksheet : string, selectedRange : string) {
    return Excel.run(function (context) {
        var sheet = context.workbook.worksheets.getItem(worksheet);
        var range = sheet.getRange(selectedRange);
        range.clear();
        return context.sync();
    });
  };


  /**
  * Check if worksheet exists.
  * @param {string} worksheetName - Worsheet name
  * @returns {boolean} - true if exists
  */
  workSheetExists(worksheetName :string) {
    let v = undefined;
    Excel.run(function (context) {
        let currentWorksheet = context.workbook.worksheets.getItem(worksheetName);
        v = currentWorksheet.load("id");
        return context.sync()
            .then(function () {
                return true;
            });
    }).catch(function (error) {
        
    });
    return false;
  }

  /**
 * Check if worksheet exists.
 * @param {string} worksheetName - Worsheet name
 * @returns {object} promise
 */
  deleteWorksheet(worksheetName: string) {
    //LoggerService.logInfo(ExcelConstants.ExcelHandlerModule, ExcelConstants.ExcelHandlerService, "activateWorksheet", CommonService.formatString(UiStrings.DeleteWorksheetMsg, []));
    return window.Excel.run(function (context) {
        let worksheet = context.workbook.worksheets.getItem(worksheetName);
        worksheet.delete();
        return context.sync();
    });
  };


  /**
  * Activate specified worksheet.
  * @param {string} worksheetName - Worsheet name
  * @returns {object} promise 
  */
  activateWorksheet(worksheetName : string) {
    //LoggerService.logInfo(ExcelConstants.ExcelHandlerModule, ExcelConstants.ExcelHandlerService, "activateWorksheet", CommonService.formatString(UiStrings.ActivateWorksheetMsg, []));
    return Excel.run(function (context) {
        let sheet = context.workbook.worksheets.getItem(worksheetName);
        sheet.activate();
        return context.sync();
    });
  };

  /**
  * Gets used range with data.
  * @param {string} worksheetName - Worsheet name
  * @param {string} range - Range under worksheet
  * @returns {Object} Range data
  */
  getUsedRangeData(worksheetName : string) {
    let values;
    window.Excel.run(function (context) {
        let r = context.workbook.worksheets.getItem(worksheetName).getUsedRange(true);
        r.load('values');
        return context.sync().then(function () {
            values = r.values;
            if (values === null) { 
              //throw new Error(UiStrings.IncompleteRows); 
              throw new Error('There seems to be a lot of incomplete rows in the worksheet, please review'); 
            }
            else { 
              return values; 
            }
        }).catch();
    }).catch(function (error) {  });
  };

  /**
  * Deletes worksheet if exists.
  * @param {string} worksheetName worksheet to be deleted.
  */
  deleteWorksheetIfExists(worksheetName : string) {
    if(this.workSheetExists(worksheetName)){
      window.Excel.run(async (context) => {
        let worksheet = context.workbook.worksheets.getItem(worksheetName);
        worksheet.delete();
        context.sync().then(function () { return true; })
            .catch(function (error) { });
      });
    }
    return true;
  };


  /**
  * Updates the cell value.
  * @param {string} sheetName - Worsheet name
  * @param {string} row - Row index
  * @param {string} column - Column Index
  * @param {[[]]} value - Cell value
  * @returns {object} promise
  */
   updateCellValue(sheetName: string, row:number, column: string, value: string) {
    return Excel.run(function (context) {
        var sheet = context.workbook.worksheets.getItem(sheetName);
        var range = sheet.getRange(column + row);
        range.values = [[value]];
        return context.sync();
    });
};

/**
* Updates the cell value.
* @param {string} sheetName - Worsheet name
* @param {string} row - Row index
* @param {string} column - Column Index
* @returns {[[]]} value - Cell value
*/
 fetchCellValue(sheetName: string, row: number, column: any) {
  let values: any[][];
  var col = this.commonService.lettersToNumber(column);
  Excel.run(async function (context) {
      var sheet = context.workbook.worksheets.getItem(sheetName);
      var cell = sheet.getCell(row - 1, col - 1);
      cell.load("address, values");
      await context.sync();
    values = cell.values;
  }).then(function () {
      return values;
  }).catch();
};

toColumnName(num: any) {
  num = num + 1;
  for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
      ret = String.fromCharCode(((num % b) / a) + 65) + ret;
  }
  return ret;
};


}