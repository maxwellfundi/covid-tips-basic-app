import { NgModule } from "@angular/core";
import { Injectable } from "@angular/core";

import {
  TranslateModule,
  TranslateService,
  TranslateStore,
  TranslateDefaultParser,
  TranslateFakeCompiler,
  TranslateLoader,
  FakeMissingTranslationHandler,
} from "@ngx-translate/core";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { take } from "rxjs/operators";
import { environment } from "src/environments/environment";

const DEFAULT_TRANSLATION_SOURCE = "app-strings.json";
const DEFAULT_LANGUAGE = "en";
// QUALITY CHECK mode adds debugging strings to project
const QC_MODE = environment.translationsDebug;

export function createTranslateLoader(
  http: HttpClient,
  translationSource = DEFAULT_TRANSLATION_SOURCE
): TranslateLoader {
  return new AppTranslateLoader(http, translationSource) as any;
}

/**
 * Extends the default ngx app translate service implementation to inject a default
 * http loader and include a custom method to update the source file for strings
 */
@Injectable({ providedIn: "root" })
export class AppTranslateService extends TranslateService {
  loading$ = new BehaviorSubject(false);
  private http: HttpClient;
  constructor(http: HttpClient) {
    super(
      new TranslateStore(),
      new AppTranslateLoader(http),
      new TranslateFakeCompiler(),
      new TranslateDefaultParser(),
      new FakeMissingTranslationHandler(),
      false,
      true,
      false,
      DEFAULT_LANGUAGE
    );
    this.http = http;
  }

  /**
   * Specify a json file to load translations from for a given language
   * @param translationSource - filepath relative to assets/i81n/{lang} folder.
   * Omit to use default source
   */
  async setTranslationSourceFile(
    translationSource = DEFAULT_TRANSLATION_SOURCE
  ) {
    this.loading$.next(true);
    const lang = this.currentLang || this.defaultLang;
    // NOTE - getTranslation expects only one argument, so cast to any type
    this.currentLoader = createTranslateLoader(this.http, translationSource);
    await this.reloadLang(lang).pipe(take(1)).toPromise();
    console.log("translations loaded");
    this.loading$.next(false);
  }

  /**
   * Minimal implementation of standard get function used by ngx-translate
   * NOTE, lacks support for more complex interactions like default getter, could adapt from:
   * https://github.com/ngx-translate/core/blob/master/projects/ngx-translate/core/src/lib/translate.service.ts
   */
  get(key: string, interpolateParams?: Object): Observable<any> {
    const lang = this.currentLang || this.defaultLang;
    return new Observable((subscribe) => {
      const translations = this.translations[lang] || {};
      const translation = translations[key];
      // marked but hasn't been extracted.
      if (!translation) {
        subscribe.next(QC_MODE ? `{{EXTRACT}} ${key}` : key);
        return subscribe.complete();
      }
      // translation exists but same as default English string
      if (translation === key && lang !== "en") {
        subscribe.next(QC_MODE ? `{{MISSING}} ${key}` : key);
        return subscribe.complete();
      } else {
        subscribe.next(translation);
        subscribe.complete();
      }
    });
  }
}

/**
 * Simple loader to pull translations from json files in the app
 */
class AppTranslateLoader {
  constructor(
    private http: HttpClient,
    private translationSource = DEFAULT_TRANSLATION_SOURCE
  ) {
    console.log("loading tranlsations", this.translationSource);
  }

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`assets/i18n/${lang}/${this.translationSource}`);
  }
}

@NgModule({
  imports: [
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
      defaultLanguage: DEFAULT_LANGUAGE,
    }),
  ],
  providers: [
    {
      provide: TranslateService,
      useExisting: AppTranslateService,
      deps: [HttpClient],
    },
  ],

  exports: [TranslateModule],
})
export class AppTranslationModule extends TranslateModule {}
