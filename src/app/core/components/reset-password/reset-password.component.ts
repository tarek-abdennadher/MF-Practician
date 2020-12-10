import { Component, OnInit, Inject } from "@angular/core";
import { LoginService } from "@app/core/services/login.service";
import { ActivatedRoute, Router } from "@angular/router";
import { LocalStorageService } from "ngx-webstorage";
import { GlobalService } from "@app/core/services/global.service";
import { trimFunction } from "@app/shared/functions/trim";
import { DOCUMENT } from "@angular/common";
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
    public globalService: GlobalService,
    @Inject(DOCUMENT) private document: Document
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
      } else {
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

  redirectToLoginPatient() {
    this.document.location.href = this.url.patient_connexion;
  }
  public redirectToPracticien() {
    this.errorMessage = "";
    this.successMessage = "";
    this.router.navigate(["/connexion"]);
  }
  public redirectToPatient() {
    this.document.location.href = this.url.patient_connexion;
  }
  public redirectToSiteMap() {
    this.document.location.href = this.globalService.SITE_MAP;
  }
  public redirectToWhoAreWe() {
    this.document.location.href = this.globalService.WHO_ARE_WE_SITE;
  }
  public redirectToOurSolution() {
    this.document.location.href = this.globalService.OUR_SOLUTION_SITE;
  }
  public redirectToOurBlog() {
    this.document.location.href = this.globalService.OUR_BLOG_SITE;
  }
  public redirectToContact() {
    this.document.location.href = this.globalService.CONTACT_SITE;
  }
}
