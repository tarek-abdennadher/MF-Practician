import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-new-message-mobile',
  templateUrl: './new-message-mobile.component.html',
  styleUrls: ['./new-message-mobile.component.scss']
})
export class NewMessageMobileComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  displaySendAction() {
    this.router.navigate(["messagerie-ecrire"]);
  }
}
