import { Component, Input } from "@angular/core";

@Component({
  selector: "app-tip-sheet-title",
  template: ` <div class="tip-title-container">
    <div class="tip-list-number">{{ tipSheet.number }}</div>
    <div style="flex: 1; text-align:left">
      <h2 class="tip-list-title">DEMO-1 PARENTING</h2>
      <h2 class="tip-list-subtitle">{{ tipSheet.title }}</h2>
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
        font-size: 80px;
        margin-right: 10px;
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
export class TipSheetTitleComponent {
  @Input() tipSheet: ITipSheet;
}

interface ITipSheet {
  number: number;
  title: string;
}
