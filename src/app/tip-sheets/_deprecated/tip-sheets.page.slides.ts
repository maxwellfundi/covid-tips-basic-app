import { Component, ViewChild, OnDestroy } from "@angular/core";
import { IonSlides } from "@ionic/angular";
import { ActivatedRoute, Router } from "@angular/router";
import { AppTranslateService } from "../../modules/translation.module";
import { TIP_SHEETS } from "../data/tip-sheets.data";

@Component({
  selector: "app-tip-sheets",
  templateUrl: "./tip-sheets.page.slides.html",
  styleUrls: [],
})
export class TipSheetsPageSlides implements OnDestroy {
  tipSheets = TIP_SHEETS;
  // note - options passed to swiper api: https://swiperjs.com/api/
  slideOptions: IonSlides["options"] = {
    autoHeight: true,
  };
  @ViewChild("slides", { static: true }) slides: IonSlides;
  constructor(
    private translations: AppTranslateService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    console.log("tip sheet page constructor");
  }

  ngOnDestroy() {
    console.log("destroy");
    this.translations.setTranslationSourceFile();
  }

  slideTo(index: number) {
    console.log("slide to", index);
    if (index > 0) {
      this.translations.setTranslationSourceFile(`tip-sheet-${index}.json`);
    }
    this.slides.slideTo(index);
  }

  /***********************************************************************************
   * Route handling and slide bindings
   * Various methods to keep url bar and slider slides in sync. Could be replaced
   * in future if decide to opt for individual pages instead of slides.
   *
   * NOTE - uses query params instead of route (e.g. tips/1) so that full component
   * is not reloaded. This is also bound to by the translations module to dynamically
   * change the list of translations pulled from
   * *******************************************************************************/

  async slideDidChange() {
    const index = await this.slides.getActiveIndex();
    this.updateSheetUrl(index);
  }
  private updateSheetUrl(index: number) {
    return index > 0
      ? this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { sheet: index },
          queryParamsHandling: "merge",
        })
      : this.router.navigate([], {
          relativeTo: this.route,
        });
  }
}
