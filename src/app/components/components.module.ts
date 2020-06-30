import { NgModule } from "@angular/core";

import { InfoSitesDisclaimer } from "./info-sites-disclaimer";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PartnersFooterComponent } from "./partners-footer";
import { LanguageSelectComponent } from "./language-select";
import { IonicModule } from "@ionic/angular";

/**
 * Shared and common components used throuhgout the app
 */
const COMMON_COMPONENTS = [
  InfoSitesDisclaimer,
  PartnersFooterComponent,
  LanguageSelectComponent,
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule],
  exports: COMMON_COMPONENTS,
  declarations: COMMON_COMPONENTS,
})
export class ComponentsModule {}
