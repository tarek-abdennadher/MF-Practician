import { Component, OnInit } from "@angular/core";
import { LoginService } from "@app/core/services/login.service";
import { ActivatedRoute, Router } from "@angular/router";
import { LocalStorageService } from "ngx-webstorage";
import { GlobalService } from "@app/core/services/global.service";
import { trimFunction } from '@app/shared/functions/trim';
@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.scss"]
})
export class ResetPasswordComponent implements OnInit {
  public errorMessage = "";
  email = "";
  public successMessage = "";
  messages: any;
  url: any;
  constructor(
    public loginService: LoginService,
    public route: ActivatedRoute,
    public localStorage: LocalStorageService,
    public router: Router,
    public globalService: GlobalService
  ) {
    this.messages = loginService.messages;
    this.url = globalService.url;
  }

  ngOnInit(): void {
    this.errorMessage = "";
    this.successMessage = "";
  }
  submit(model) {
    model.email = trimFunction(model.email);
    this.errorMessage = "";
    this.successMessage = "";
    this.loginService.getRoleByEmail(model.email).subscribe(res => {
      if (res && (res == "PRACTICIAN" || res == "SECRETARY")) {
        this.loginService.resetPassword(model.email).subscribe(res => {
          if (res) {
            this.successMessage = this.loginService.messages.reset_password_success;
          } else {
            this.errorMessage = this.loginService.messages.reset_password_failure;
          }
        });
      }
      else {
        this.errorMessage = this.loginService.messages.acces_denied;
      }
    });
  }
  signupAction() {
    this.errorMessage = "";
    this.successMessage = "";
    this.router.navigate(["/demonstration"]);
  }
  logoAction() {
    this.router.navigate(["/connexion"]);
  }
}
