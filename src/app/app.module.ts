import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

// Ionic Native
import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Device } from "@ionic-native/device/ngx";
import { FCM } from "@ionic-native/fcm/ngx";
import { HTTP } from "@ionic-native/http/ngx";

// Firebase
import { AngularFireModule } from "@angular/fire";
import { AngularFireMessagingModule } from "@angular/fire/messaging";
import { AngularFireAnalyticsModule } from "@angular/fire/analytics";
import { AngularFirePerformanceModule } from "@angular/fire/performance";

// App
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { getErrorHandler } from "src/errorHandler";
import { environment } from "src/environments/environment";
import { AppTranslationModule } from "./modules/translation.module";

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AppTranslationModule,
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
