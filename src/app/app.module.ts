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
import { LoginService } from "./core/services/login.service";
import { GlobalService } from "./core/services/global.service";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AuthGuard } from "./app.guard";
import { TokenInterceptor } from "./core/interceptors/token.interceptor";
import { AccountModule } from "./features/account/account.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

registerLocaleData(localeFr, "fr");
@NgModule({
  declarations: [AppComponent],
  imports: [
    NgxWebstorageModule.forRoot(),
    AppRoutingModule,
    BrowserModule,
    RouterModule,
    HttpClientModule,
    CoreModule,
    FeaturesModule,
    AccountModule,
    BrowserAnimationsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    { provide: LOCALE_ID, useValue: "fr" },
    LoginService,
    GlobalService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
