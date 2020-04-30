import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/features/services/account.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  public messages: any;
  constructor(public accountService: AccountService) {

    this.messages = this.accountService.messages;
  }


  ngOnInit(): void {
  }

}
