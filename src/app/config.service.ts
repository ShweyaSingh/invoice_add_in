import { Injectable } from '@angular/core';
import { Endpoints } from './constants/Endpoints';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor() {}

  isDevelopmentMode() {
    return false;
  }

  GetClientId() {
    return '2ff0ee04-a3a4-490d-b501-b1cc8c5c4cca';
  }

  getUrl(path: string) {
    if (path === 'Dashboard') {
      return Endpoints.DashBoardUrl;
    } else if (path === 'Home') {
      return Endpoints.HomeUrl;
    } else if (path === 'Authorization') {
      let url = Endpoints.AuthorizationUrl.replace(
        '{0}',
        encodeURIComponent(Endpoints.RedirectUrl)
      ).replace('{1}', this.GetClientId());
      return url;
    } else if (path === 'SignOut') {
      var signOutUrl = [
        Endpoints.SignOutBaseUrl,
        ['RedirectUrl', encodeURIComponent(Endpoints.SignOutRedirectUrl)].join(
          '='
        ),
      ].join('?');
      return signOutUrl;
    } else {
      throw new Error('Path not found');
    }
  }
}
