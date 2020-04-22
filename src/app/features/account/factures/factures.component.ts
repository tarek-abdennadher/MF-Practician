import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/features/services/account.service';

@Component({
  selector: 'app-factures',
  templateUrl: './factures.component.html',
  styleUrls: ['./factures.component.scss']
})
export class FacturesComponent implements OnInit {
  public messages: any;
  constructor(public accountService: AccountService) {

    this.messages = this.accountService.messages;
  }

  ngOnInit(): void {
  }

}
