import { Component } from "@angular/core";
import { AppTranslateService } from "../modules/translation.module";

@Component({
  selector: "app-language-select",
  template: `<ion-item style="color:white">
    <ion-label
      ><ion-icon name="language-outline" style="font-size:20px"></ion-icon
    ></ion-label>
    <ion-select
      placeholder="Language"
      [(ngModel)]="currentLanguage"
      (ionChange)="languageUpdated()"
    >
      <ion-select-option *ngFor="let l of languages" [value]="l">{{
        l.name
      }}</ion-select-option>
    </ion-select>
  </ion-item>`,
})
export class LanguageSelectComponent {
  currentLanguage: ILanguage;
  languages = LANGUAGES;
  constructor(private translate: AppTranslateService) {}

  languageUpdated() {
    this.translate.use(this.currentLanguage.code);
  }

  ngOnInit() {
    const lang = this.translate.currentLang || this.translate.defaultLang;
    this.currentLanguage = LANGUAGES.find((l) => l.code === lang);
  }
}
interface ILanguage {
  code: string;
  name: string;
}

const LANGUAGES: ILanguage[] = [
  {
    code: "en",
    name: "English",
  },
  {
    code: "sw",
    name: "Kiswahili",
  },
  {
    code: "af",
    name: "Afrikaans",
  },
];
