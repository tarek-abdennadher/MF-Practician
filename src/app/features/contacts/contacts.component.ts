import { Component, OnInit } from '@angular/core';
import { ContactsService } from '../services/contacts.service';
import { Router } from '@angular/router';
import { Speciality } from '@app/shared/models/speciality';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  specialities: Array<Speciality>;
  users: Array<any>;
  itemsList: Array<any>;
  filtredItemsList: Array<any>;
  types : Array<string>;
  imageSource = "assets/imgs/IMG_3944.jpg";
  links = { isAllSelect: true, isDelete: true, isTypeFilter: true }
  constructor(public router: Router, private contactsService: ContactsService) { }

  ngOnInit(): void {
    this.itemsList = new Array();
    this.filtredItemsList = new Array();
    this.types = new Array();
    this.getAllSpeciality();
    this.getAllContacts();
  }
  getAllContacts(){
    this.contactsService.getContactsPro().subscribe(contacts => {
      this.users = contacts;
      this.itemsList = this.users.map(elm => {
        return {
          id: elm.id,
          isSeen: true,
          users: [{
            id: elm.id,
            fullName: elm.firstName + ' ' + elm.lastName,
            img: "assets/imgs/IMG_3944.jpg",
            title: elm.title,
            type: "MEDICAL",
            speciality: elm.speciality.name
          }],
          object: {
            name: elm.facilityName,
            isImportant: false
          },
          isImportant: false,
          hasFiles: false,
          isViewDetail: true,
          isMarkAsSeen: false,
          isChecked: false
        }
      })
      this.filtredItemsList = this.itemsList;
  },
  error => {
    console.log("en attendant un model de popup à afficher");
  }
  );
  }
  listFilter(value: string) {
    this.filtredItemsList = value != "Tout" ? this.performFilter(value) : this.itemsList;
  }

  performFilter(filterBy: string) {
    return this.itemsList.filter(item =>
      item.users[0].speciality.includes(filterBy));
}

  selectAllActionClicked() {
    this.itemsList.forEach(a => {
        a.isChecked = true;
    });
  }
  deselectAllActionClicked() {
    this.itemsList.forEach(a => {
        a.isChecked = false;
    });
  }
  deleteActionClicked() {
    const ids = [];
    this.itemsList.forEach(a => {
        if (a.isChecked) {
          ids.push(a.id);
        }
    });
    if (ids.length > 0) {
      this.contactsService.deleteMultiple(ids).subscribe(res => {
        this.getAllContacts();
      });

    }
  }

  cardClicked(item) {
    this.router.navigate(["/features/contact-detail/" + item.id]);
  }
  markAsSeenClicked(item) {
    console.log("ko")
  }
  archieveClicked(event) {
    console.log("hello " + event.users[0].id)
  }
  selectItem(event) {
    this.itemsList.forEach(a => {
      if (event.filter(b => b.id == a.id).length >= 1) {
        a.isChecked = true;
      } else {
        a.isChecked = false;
      }
    });
  }
  getAllSpeciality() {
    this.contactsService.getAllSpecialities().subscribe(specialitiesList =>{
        this.specialities = specialitiesList;
        this.types = this.specialities.map(s => s.name);
        this.types.unshift("Tout")
    }, error => {
      console.log("en attendant un model de popup à afficher");
    });
  }
}
