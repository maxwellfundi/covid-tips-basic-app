import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

// Ionic Native
import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Device } from "@ionic-native/device/ngx";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { FCM } from "@ionic-native/fcm/ngx";
import { HTTP } from "@ionic-native/http/ngx";

// Firebase
import { AngularFireModule } from "@angular/fire";
import { AngularFireMessagingModule } from "@angular/fire/messaging";
import { AngularFireAnalyticsModule } from "@angular/fire/analytics";
import { AngularFirePerformanceModule } from "@angular/fire/performance";

// Translation
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

// App
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { getErrorHandler } from "src/errorHandler";
import { environment } from "src/environments/environment";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/app-strings.", ".json");
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: "en",
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirePerformanceModule,
    AngularFireAnalyticsModule,
    AngularFireMessagingModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: ErrorHandler, useFactory: getErrorHandler },
    FCM,
    Device,
    HTTP,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
