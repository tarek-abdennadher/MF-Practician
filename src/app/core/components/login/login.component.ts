import { Component, OnInit, OnDestroy } from '@angular/core';;
import { LoginService } from '@app/core/services/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { GlobalService } from '@app/core/services/global.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  previousURL = '';
  email = '';
  public errorMessage = '';
  public successMessage = '';
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
    this.errorMessage = '';
    this.successMessage = '';
    this.route.queryParams
      .subscribe(params => {
        this.previousURL = params['return'] || 'features';
        this.errorMessage = params['failure'] || '';
        this.successMessage = params['success'] || '';
      });
    this.localStorage.clear();
    this.localStorage.store('token', null);
  }
  submit(model) {
    this.email = model.email;
    this.errorMessage = '';
    this.successMessage = '';
    this.loginService
      .authenticate(model)
      .subscribe(this.handleResponseToken, this.handleError);
  }

  handleResponseToken = token => {
    this.localStorage.clear('token');
    if (token && token.id_token) {
      this.localStorage.store('token', token.id_token);
      this.loginService
        .getAccountInfo(this.email)
        .subscribe(this.handleResponseUser, this.handleError);
    } else {
      this.errorMessage = this.loginService.messages.bad_credentials;
    }
  }

  handleResponseUser = account => {
    const userData = account.practician != null ? account.practician : account.secretary;
    this.localStorage.store("user", userData);
    this.localStorage.store("role", account.role);
    this.router.navigate([this.previousURL]);
  }

  handleError = err => {
    if (err && err.error && err.error.apierror) {
      this.errorMessage = err.error.apierror.message;
    } else {
      throw err;
    }
  }
  forgotPassword() {
    this.errorMessage = '';
    this.successMessage = '';
    this.router.navigate(['/mot-de-passe-oublie']);
  }
  practicianConnexion() {
    this.errorMessage = '';
    this.successMessage = '';
    this.router.navigate(['/demonstration']);
  }
}
