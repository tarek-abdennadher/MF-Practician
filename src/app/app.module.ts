import { BrowserModule } from "@angular/platform-browser";
import { NgxWebstorageModule } from "ngx-webstorage";
import { NgModule, LOCALE_ID } from "@angular/core";
import { AppComponent } from "./app.component";
import { FeaturesModule } from "./features/features.module";
import { AppRoutingModule } from "./app-routing.module";
import { RouterModule } from "@angular/router";
import localeFr from "@angular/common/locales/fr";
import { registerLocaleData } from "@angular/common";
import { CoreModule } from "./core/core.module";
import { GlobalService } from "./core/services/global.service";
import { HttpClientModule } from "@angular/common/http";

registerLocaleData(localeFr, "fr");
@NgModule({
  declarations: [AppComponent],
  imports: [
    NgxWebstorageModule.forRoot(),
    AppRoutingModule,
    BrowserModule,
    RouterModule,
    CoreModule,
    FeaturesModule,
    HttpClientModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: "fr-Fr" }],
  bootstrap: [AppComponent]
})
export class AppModule {}
