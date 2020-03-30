import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/features/services/account.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {
  labels;
  topText = 'Mon compte';
  page = 'MY_ACCOUNT';
  backButton = true;
  constructor(private accountService: AccountService,
              private router: Router) {
    this.labels = this.accountService.messages;
  }

  ngOnInit(): void {
  }
  BackButton() {
    this.router.navigate(['/features/messageries']);
  }
  return() {
    this.router.navigate(['/features/messageries']);
  }
}
