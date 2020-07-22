import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { SongPlayerPageRoutingModule } from "./song-player-routing.module";

import { SongPlayerPage } from "./song-player.page";

import { LottieModule } from "ngx-lottie";
import player from "lottie-web";

// Note we need a separate function as it's required
// by the AOT compiler.
export function lottiePlayerFactory() {
  return player;
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SongPlayerPageRoutingModule,
    LottieModule.forRoot({ player: lottiePlayerFactory, useCache: true }),
  ],
  declarations: [SongPlayerPage],
})
export class SongPlayerPageModule {}
