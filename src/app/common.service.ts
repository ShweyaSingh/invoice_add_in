import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

   /**
    * Compare two string values .
    * @param {string} value1 First Value
    * @param {string} value2 second Value 
    * @returns {boolean} true/false
    */
    compareStrings(value1:string, value2:string) {
      return true;
  };

  toColumnName(num:number) {
      num = num + 1;
      for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
          ret = String.fromCharCode(((num % b) / a) + 65) + ret;
      }
      return ret;
  };


  /**
  * Retrurns cell data.
  * @param {number} index - cell index
  * @param {Object} rowData - row data
  * @param {string} dataType .
  * @returns {string} cell Data
  */
  getCellValueByIndex(index:number, rowData: any, dataType:string) {
      let response = '';
      if (index !== -1) {
          let defaultValue = rowData[index];
          switch (dataType) {

              case "DateTime":
                  if (defaultValue !== '') {
                      //response = filter('date')(this.ExcelDateToJSDate(defaultValue), 'MM/dd/yyyy');
                  }
                  break;
              case "Text":
                  response = defaultValue;
                  break;
              default:
                  response = defaultValue;
                  break;
          }
      }
      else {
          throw new Error("Invalid Cell");
      }
      return response;
  };


  ExcelDateToJSDate(date:any) {
      var currentDate = new Date();
      if (currentDate.toString().indexOf("India Standard Time") === -1) {
          return new Date(Math.round((date - 25568) * 86400 * 1000));
      } else {
          return new Date(Math.round((date - 25569) * 86400 * 1000));
      }
  };

  lettersToNumber(letters:any) {
      for (var p = 0, n = 0; p < letters.length; p++) {
          n = letters[p].charCodeAt() - 64 + n * 26;
      }
      return n;
  };

  /**
  * Retruns formatted string values .
  * @param {string} value string
  * @param {[]} params array of placeholder values 
  * @returns {string} formatted data
  */
  formatString(value: any, params: any) {
      let result = '';

      return result;
  };


  convertArrayToCamelCaseArray(headers:any) {
      let camelArray = [];
      for (let i = 0; i < headers.length; i++) {
          camelArray.push(this.convertToCamelCase(headers[i]));
      }
      return camelArray;
  };


  convertToCamelCase(input: any) {
      input = input || '';
      let str = input.replace(/\w\S*/g, (txt: any)=> { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
      return str;
  };
}
