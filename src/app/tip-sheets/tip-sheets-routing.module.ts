import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
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

const routes: Routes = [
  {
    path: "",
    component: TipSheetsPage,
  },
  {
    path: "1",
    component: TipSheet1Component,
  },
  {
    path: "2",
    component: TipSheet2Component,
  },
  {
    path: "3",
    component: TipSheet3Component,
  },
  {
    path: "4",
    component: TipSheet4Component,
  },
  {
    path: "5",
    component: TipSheet5Component,
  },
  {
    path: "6",
    component: TipSheet6Component,
  },
  {
    path: "7",
    component: TipSheet7Component,
  },

  {
    path: "8",
    component: TipSheet8Component,
  },

  {
    path: "9",
    component: TipSheet9Component,
  },

  {
    path: "10",
    component: TipSheet10Component,
  },
  {
    path: "11",
    component: TipSheet11Component,
  },
  {
    path: "12",
    component: TipSheet12Component,
  },
  {
    path: "13",
    component: TipSheet13Component,
  },

  {
    path: "14",
    component: TipSheet14Component,
  },

  {
    path: "15",
    component: TipSheet15Component,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TipSheetsPageRoutingModule {}
