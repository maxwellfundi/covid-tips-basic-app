import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "home",
    loadChildren: () =>
      import("./home/home.module").then((m) => m.HomePageModule),
  },
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "tip-sheets",
    loadChildren: () =>
      import("./tip-sheets/tip-sheets.module").then(
        (m) => m.TipSheetsPageModule
      ),
  },
  {
    path: "activities",
    loadChildren: () =>
      import("./activities/activities.module").then(
        (m) => m.ActivitiesPageModule
      ),
  },
  {
    path: "songs",
    loadChildren: () =>
      import("./songs/songs.module").then((m) => m.SongsPageModule),
  },
  {
    path: "stories",
    loadChildren: () =>
      import("./stories/stories.module").then((m) => m.StoriesPageModule),
  },
  {
    path: "take-a-pause",
    loadChildren: () =>
      import("./take-a-pause/take-a-pause.module").then(
        (m) => m.TakeAPausePageModule
      ),
  },
  {
    path: "chat",
    loadChildren: () =>
      import("./chat/chat.module").then((m) => m.ChatPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      useHash: true,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
