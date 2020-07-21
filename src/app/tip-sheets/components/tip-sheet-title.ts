import { Component, Input, OnInit } from "@angular/core";
import { TIP_SHEETS } from "../data/tip-sheets.data";

@Component({
  selector: "app-tip-sheet-title",
  template: ` <div class="tip-title-container">
    <div class="tip-list-number">{{ tipSheet.number }}</div>
    <div style="flex: 1; text-align:left">
      <h2 class="tip-list-subtitle" translate>
        {{ tipSheet.title }}
      </h2>
    </div>
  </div>`,
  styles: [
    `
      .tip-title-container {
        display: flex;
        align-items: center;
      }
      .tip-list-number {
        color: var(--ion-color-tertiary);
        font-size: 40px;
        margin-left: 10px;
        margin-right: 30px;
        line-height: 80px;
      }
      .tip-list-title {
        color: var(--ion-color-secondary);
        font-size: 20px;
        font-weight: bold;
        margin: 0;
      }
      .tip-list-subtitle {
        color: var(--ion-color-tertiary);
        font-size: 20px;
        font-weight: bold;
        margin: 0;
      }
    `,
  ],
})
export class TipSheetTitleComponent implements OnInit {
  @Input() number: number;
  tipSheet: typeof TIP_SHEETS[0];
  constructor() {}
  ngOnInit() {
    this.tipSheet = TIP_SHEETS.find((t) => t.number === this.number);
  }
}
