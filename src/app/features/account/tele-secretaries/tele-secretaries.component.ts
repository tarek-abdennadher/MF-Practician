import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/features/services/account.service';

@Component({
  selector: 'app-tele-secretaries',
  templateUrl: './tele-secretaries.component.html',
  styleUrls: ['./tele-secretaries.component.scss']
})
export class TeleSecretariesComponent implements OnInit {
  public messages: any;
  constructor(public accountService: AccountService) {

    this.messages = this.accountService.messages;
  }

  ngOnInit(): void {
  }

}
