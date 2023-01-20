import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PinkToast } from './invoice/toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastr: ToastrService) { }

  /**
     * Show information.
     * @param {string} subject - Title of toast
     * @param {string} message - Message content 
     */
  info(subject : string, message : string) {
      this.toastr.info(message, subject, { closeButton: true, timeOut: 0, extendedTimeOut: 0, positionClass: 'toast-bottom-right' });
  };

  /**
   * Show Success message.
   * @param {string} subject - Title of toast
   * @param {string} message - Message content 
   */
  success(subject : string, message? : string) {
    this.toastr.success(message, subject, { closeButton: true, timeOut: 0, extendedTimeOut: 0, positionClass: 'toast-bottom-right' });
  };

  successWithLink(subject : string, message? : string) {
    this.toastr.success(message, subject, {toastComponent:PinkToast  ,closeButton: true, timeOut: 0, extendedTimeOut: 0, positionClass: 'toast-bottom-right',enableHtml: true });
  };
  
  /**
   * Show Warning message.
   * @param {string} subject - Title of toast
   * @param {string} message - Message content 
   */
  warning(subject : string, message : string) {
    this.toastr.warning(message, subject, { closeButton: true, timeOut: 0, extendedTimeOut: 0, positionClass: 'toast-bottom-right' });
  };

  /**
   * Show error message.
   * @param {string} subject - Title of toast
   * @param {string} message - Message content 
   */
  error(subject : string, message? : string) {
    this.toastr.error(message, subject, { closeButton: true, timeOut: 0, extendedTimeOut: 0, positionClass: 'toast-bottom-right' });
  };

}
