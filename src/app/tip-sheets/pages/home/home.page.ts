import { Component, OnInit } from "@angular/core";
import { TIP_SHEETS } from "../../data/tip-sheets.data";

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})
export class TipSheetsHomePage {
  tipSheets = TIP_SHEETS;
  constructor() {}
}
