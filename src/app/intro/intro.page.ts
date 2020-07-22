import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-intro",
  templateUrl: "./intro.page.html",
  styleUrls: ["./intro.page.scss"],
})
export class IntroPage implements OnInit {
  slideOpts = {
    initialSlide: 0,
    speed: 300,
    slidesPerView: 1,
    autoplay: true,
  };

  constructor(router: Router) {
    setTimeout(() => {
      localStorage.setItem("visitedBefore", "true");
      router.navigateByUrl("/");
    }, 6500);
  }

  ngOnInit() {}
}
