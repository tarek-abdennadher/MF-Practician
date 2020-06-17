import { Component, OnInit } from '@angular/core';
import { GlobalService } from '@app/core/services/global.service';
import { AccountService } from '@app/features/services/account.service';

@Component({
  selector: 'app-my-contacts',
  templateUrl: './my-contacts.component.html',
  styleUrls: ['./my-contacts.component.scss']
})
export class MyContactsComponent implements OnInit {
  public labels: any;
  constructor(
    private globalService: GlobalService,
    private accountService: AccountService) {
    this.labels = this.accountService.messages;
  }

  ngOnInit(): void {
  }

}
