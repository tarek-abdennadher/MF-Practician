import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/features/services/account.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-my-leaves',
  templateUrl: './my-leaves.component.html',
  styleUrls: ['./my-leaves.component.scss']
})
export class MyLeavesComponent implements OnInit {
  public messages: any;
  public leavesForm: FormGroup;
  constructor(private service: AccountService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.messages = this.service.messages;
  }

  initInfoForm() {
    this.leavesForm = this.formBuilder.group({
      practicianId: "",
      leaveStartDate: null,
      leaveEndDate: null
    });
  }

}
