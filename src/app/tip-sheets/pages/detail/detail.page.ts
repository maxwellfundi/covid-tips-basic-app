import { Component, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppTranslateService } from "src/app/modules/translation.module";
import { TIP_SHEETS } from "../../data/tip-sheets.data";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.page.html",
  styleUrls: ["./detail.page.scss"],
})
export class TipSheetDetailPage implements OnDestroy {
  totalTipSheets = TIP_SHEETS.length;
  tipSheet: typeof TIP_SHEETS[0];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translations: AppTranslateService
  ) {
    const sheetNumber = Number(route.snapshot.params.tipSheetNumber);
    const tipSheet = TIP_SHEETS.find((s) => s.number === sheetNumber);
    this.translations
      .setTranslationSourceFile(`tip-sheet-${sheetNumber}.json`)
      .then(() => {
        this.tipSheet = tipSheet;
      });
  }
  ngOnDestroy() {
    this.translations.setTranslationSourceFile();
  }

  nextTipSheet() {
    this.router.navigate(["../", this.tipSheet.number + 1], {
      relativeTo: this.route,
      replaceUrl: true,
    });
  }
  goBack() {
    this.router.navigate(["../"], { relativeTo: this.route });
  }
}
