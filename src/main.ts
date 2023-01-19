import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

import 'office-js';

if (environment.production) {
	enableProdMode();
}

platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch((err) => console.error(err));

declare const Office: any;

// Office.initialize = function () {
// 	console.log('Office initialized');
// 	platformBrowserDynamic()
// 		.bootstrapModule(AppModule)
// 		.catch((err) => console.error(err));
// };
