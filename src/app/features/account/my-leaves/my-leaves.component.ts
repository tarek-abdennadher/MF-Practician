import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/features/services/account.service';

@Component({
  selector: 'app-my-leaves',
  templateUrl: './my-leaves.component.html',
  styleUrls: ['./my-leaves.component.scss']
})
export class MyLeavesComponent implements OnInit {
  public messages: any;
  constructor(private service: AccountService) { }

  ngOnInit(): void {
    this.messages = this.service.messages;
  }

}
