import { Component, OnInit } from "@angular/core";
import { LoginService } from "@app/core/services/login.service";
import { ActivatedRoute, Router } from "@angular/router";
import { LocalStorageService } from "ngx-webstorage";
import { GlobalService } from "@app/core/services/global.service";

@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.scss"]
})
export class ChangePasswordComponent implements OnInit {
  public errorMessage = "";
  newPassword = "";
  token: string;
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
    this.route.queryParams.subscribe(
      params => (this.token = params["token"] || null)
    );
    this.loginService
      .validateToken(this.token)
      .subscribe(this.handleResponseToken, this.handleError);
  }
  // Handle response of token validation
  handleResponseToken = token => {
    this.localStorage.clear("token");
    if (token && token.id_token) {
      this.localStorage.store("token", token.id_token);
    } else {
      this.errorMessage = this.loginService.messages.bad_credentials;
    }
  };
  // submit new password
  submit(model) {
    this.newPassword = model.password;
    const dto = {
      token: this.token,
      password: this.newPassword
    };
    this.loginService
      .changePassword(dto)
      .subscribe(this.handleChangePassword, this.handleError);
  }
  // handle response of password change

  handleChangePassword = result => {
    if (result) {
      this.router.navigate(["/connexion"], {
        queryParams: {
          success: this.loginService.messages.change_password_success
        }
      });
    } else {
      this.errorMessage = this.loginService.messages.change_password_failure;
    }
  };
  // Handle api errors
  handleError = err => {
    if (err && err.error && err.error.apierror) {
      this.errorMessage = err.error.apierror.message;
    } else {
      throw err;
    }
  };
  signupAction() {
    this.errorMessage = "";
    this.router.navigate(["/demonstration"]);
  }
  logoAction() {
    this.router.navigate(["/connexion"]);
  }
}
