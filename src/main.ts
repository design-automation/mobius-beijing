import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (true/*environment.production*/) {
  enableProdMode();
}

// needs ./assets/cesium for deployment on server
window['CESIUM_BASE_URL'] = '/assets/cesium';

platformBrowserDynamic().bootstrapModule(AppModule);
