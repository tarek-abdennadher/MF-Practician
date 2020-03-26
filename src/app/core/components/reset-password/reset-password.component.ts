import { Component, OnInit } from '@angular/core';
import { LoginService } from '@app/core/services/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  public errorMessage = '';
  email = '';
  public successMessage = '';
  constructor(public loginService: LoginService,
              public route: ActivatedRoute,
              public localStorage: LocalStorageService,
              public router: Router) { }

  ngOnInit(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
  submit(model) {
    this.errorMessage = '';
    this.successMessage = '';
    this.loginService.resetPassword(model.email).subscribe(res => {
      if (res) {
        this.successMessage = this.loginService.messages.reset_password_success;
      } else {
        this.errorMessage = this.loginService.messages.reset_password_failure;
      }
    });
}
}
