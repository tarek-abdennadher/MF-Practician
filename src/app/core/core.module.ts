import { NgModule, Optional, SkipSelf } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HlsConnexionModule } from "hls-connexion";
import { LoginComponent } from "./components/login/login.component";
import { ResetPasswordComponent } from "./components/reset-password/reset-password.component";
import { ChangePasswordComponent } from "./components/change-password/change-password.component";
import { FooterComponent } from './components/footer/footer.component';

/*** The CoreModule takes on the role of the root AppModule ,
 * but is not the module which gets bootstrapped by Angular at run-time.
 * The CoreModule should contain singleton services,
 * universal components and other features where there’s only once instance per application. */
@NgModule({
  declarations: [
    LoginComponent,
    ResetPasswordComponent,
    ChangePasswordComponent,
    FooterComponent,
  ],
  imports: [CommonModule, HlsConnexionModule],
  providers: [],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        "CoreModule is already loaded. Import it in the AppModule only"
      );
    }
  }
}
