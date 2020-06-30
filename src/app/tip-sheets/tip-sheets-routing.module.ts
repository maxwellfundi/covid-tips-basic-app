import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TipSheetsHomePage } from "./pages/home/home.page";
import { TipSheetDetailPage } from "./pages/detail/detail.page";

const routes: Routes = [
  {
    path: "",
    component: TipSheetsHomePage,
  },
  {
    path: ":tipSheetNumber",
    component: TipSheetDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TipSheetsPageRoutingModule {}
