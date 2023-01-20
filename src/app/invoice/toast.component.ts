import {
    animate,
    keyframes,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';
import { Component } from '@angular/core';

import { Toast, ToastrService, ToastPackage } from 'ngx-toastr';;

@Component({
    selector: '[pink-toast-component]',
    styles: [`
      :host {
        background-color: #51A351;
        position: relative;
        overflow: hidden;
        margin: 0 0 6px;
        padding: 10px 10px 10px 10px;
        width: 300px;
        border-radius: 3px 3px 3px 3px;
        color: #FFFFFF;
        pointer-events: all;
        cursor: pointer;
      }
      .btn-pink {
        -webkit-backface-visibility: hidden;
        -webkit-transform: translateZ(0);
      }
      .display-f{
        display:flex;
      }
    `],
    template: `
    <div class="row display-f" [style.display]="state.value === 'inactive' ? 'none' : ''">
      <div >
        <div *ngIf="title" [class]="options.titleClass" [attr.aria-label]="title">
          Invoice Created with id:{{ title }}
          <a (click)="urlgeneration()">Go to Invoice Page</a>
        </div>
      </div>
      <div class="col-3 text-right">
      <button type="button" aria-label="Close" class="toast-close-button ng-tns-c44-1 ng-star-inserted" style="">
        <span aria-hidden="true" class="ng-tns-c44-1">×</span>
    </button>

      </div>
    </div>
    <div *ngIf="options.progressBar">
      <div class="toast-progress" [style.width]="width + '%'"></div>
    </div>
    `,
    animations: [
        trigger('flyInOut', [
            state('inactive', style({
                opacity: 0,
            })),
            transition('inactive => active', animate('400ms ease-out', keyframes([
                style({
                    transform: 'translate3d(100%, 0, 0) skewX(-30deg)',
                    opacity: 0,
                }),
                style({
                    transform: 'skewX(20deg)',
                    opacity: 1,
                }),
                style({
                    transform: 'skewX(-5deg)',
                    opacity: 1,
                }),
                style({
                    transform: 'none',
                    opacity: 1,
                }),
            ]))),
            transition('active => removed', animate('400ms ease-out', keyframes([
                style({
                    opacity: 1,
                }),
                style({
                    transform: 'translate3d(100%, 0, 0) skewX(30deg)',
                    opacity: 0,
                }),
            ]))),
        ]),
    ],
    preserveWhitespaces: false,
})
export class PinkToast extends Toast {
    // used for demo purposes
    undoString = 'undo';

    // constructor is only necessary when not using AoT
    constructor(
        protected override toastrService: ToastrService,
        public override toastPackage: ToastPackage,
    ) {
        super(toastrService, toastPackage);
    }
    urlgeneration() {
        var baseURL = 'https://host.nxt.blackbaud.com/payables/invoice/'
        var invoiceID = this.title;
        var envURL = '?envid=t-oAUKR6VAfUmGKUov33_hFw'
        var targetURL = baseURL + invoiceID + envURL;
        window.open(targetURL);
    }
    action(event: Event) {
        event.stopPropagation();
        this.undoString = 'undid';
        this.toastPackage.triggerAction();
        return false;
    }
}