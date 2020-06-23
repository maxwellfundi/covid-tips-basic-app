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
import { TipSheetsPage } from "./tip-sheets.page";

import { TipSheetTitleComponent } from "./components/tip-sheet-title";
import { TipSheetHeaderComponent } from "./components/tip-sheet-header";

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
  TipSheetHeaderComponent,
  TipSheetsPage,
  TipSheetTitleComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TipSheetsPageRoutingModule,
    ComponentsModule,
    TranslateModule.forChild(),
  ],
  declarations: TIP_SHEET_CONTENT_COMPONENTS,
  exports: [TipSheetHeaderComponent, TipSheetTitleComponent],
})
export class TipSheetsPageModule {}
