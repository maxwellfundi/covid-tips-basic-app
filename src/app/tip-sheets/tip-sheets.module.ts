import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "src/app/components/components.module";
import { TipSheetsPageRoutingModule } from "./tip-sheets-routing.module";
import {
  TipSheet1Component,
  TipSheet2Component,
  TipSheet3Component,
  TipSheet4Component,
  TipSheet5Component,
  TipSheet6Component,
  TipSheet7Component,
  TipSheet8Component,
  TipSheet9Component,
  TipSheet10Component,
  TipSheet11Component,
  TipSheet12Component,
  TipSheet13Component,
  TipSheet14Component,
  TipSheet15Component,
} from "./content";

import { TipSheetTitleComponent } from "./components/tip-sheet-title";
import { AppTranslationModule } from "../modules/translation.module";
import { TipSheetsHomePage } from "./pages/home/home.page";
import { TipSheetDetailPage } from "./pages/detail/detail.page";

const TIP_SHEET_CONTENT_COMPONENTS = [
  TipSheet1Component,
  TipSheet2Component,
  TipSheet3Component,
  TipSheet4Component,
  TipSheet5Component,
  TipSheet6Component,
  TipSheet7Component,
  TipSheet8Component,
  TipSheet9Component,
  TipSheet10Component,
  TipSheet11Component,
  TipSheet12Component,
  TipSheet13Component,
  TipSheet14Component,
  TipSheet15Component,
  TipSheetTitleComponent,
  TipSheetsHomePage,
  TipSheetDetailPage,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TipSheetsPageRoutingModule,
    ComponentsModule,
    AppTranslationModule,
  ],
  declarations: TIP_SHEET_CONTENT_COMPONENTS,
  exports: [TipSheetTitleComponent, TipSheetsHomePage, TipSheetDetailPage],
})
export class TipSheetsPageModule {}
