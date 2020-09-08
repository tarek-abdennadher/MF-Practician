import { Component, OnInit } from '@angular/core';
import { OrderDirection } from '@app/shared/enmus/order-direction';
import { FeaturesService } from '../features.service';
import { MyPatientsService } from '../services/my-patients.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MyDocumentsService } from '../my-documents/my-documents.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { GlobalService } from '@app/core/services/global.service';
import { MyPatients } from '@app/shared/models/my-patients';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-my-patients-blocked',
  templateUrl: './my-patients-blocked.component.html',
  styleUrls: ['./my-patients-blocked.component.scss']
})
export class MyPatientsBlockedComponent implements OnInit {
  isMyPatients = true;
  links = { isAdd: false, isTypeFilter: false };
  pageNo = 0;
  myPatients = [];
  number = 0;
  filtredPatients = [];
  listLength = 0;
  direction: OrderDirection = OrderDirection.DESC;
  avatars: {
    doctor: string;
    child: string;
    women: string;
    man: string;
    secretary: string;
    user: string;
  };
  page = "PATIENT";
  topText = this.globalService.messagesDisplayScreen.blocked_patients;
  imageSource: string;
  scroll = false;
  constructor(
    private featureService: FeaturesService,
    private myPatientsService: MyPatientsService,
    private sanitizer: DomSanitizer,
    private documentService: MyDocumentsService,
    private router: Router,
    private route: ActivatedRoute,
    private globalService: GlobalService) {
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnInit(): void {
    this.initProhibitedPatients();
    // update list after detail view
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        let currentRoute = this.route;
        while (currentRoute.firstChild) currentRoute = currentRoute.firstChild;
        this.getPatientsProhibitedOfCurrentParactician(this.pageNo);
      });
  }
  initProhibitedPatients() {
    this.featureService.setActiveChild(null);
    this.getPatientsProhibitedOfCurrentParactician(this.pageNo);
  }
  getPatientsProhibitedOfCurrentParactician(pageNo) {
    this.myPatients = [];
    this.filtredPatients = [];
    this.myPatientsService
      .getPatientsProhibitedOfCurrentParactician(pageNo, this.direction)
      .subscribe(myPatients => {
        this.number = myPatients.length;
        myPatients.forEach(elm => {
          this.myPatients.push(
            this.mappingMyPatients(elm, elm.prohibited, elm.archived)
          );
        });
        this.filtredPatients = this.myPatients;
      });
  }

  getNextPatientsProhibitedOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPatientsProhibitedOfCurrentParactician(pageNo, this.direction)
      .subscribe(myPatients => {
        if (myPatients.length > 0) {
          this.number = this.number + myPatients.length;
          myPatients.forEach(elm => {
            this.myPatients.push(
              this.mappingMyPatients(elm, elm.prohibited, elm.archived)
            );
          });
        }
      });
  }
  mappingMyPatients(patient, prohibited, archived) {
    const myPatients = new MyPatients();
    myPatients.users = [];
    myPatients.users.push({
      id: patient.id,
      accountId: patient.patient ? patient.patient.accountId : null,
      patientId: patient.patient ? patient.patient.id : null,
      fullName: patient.fullName,
      img: this.avatars.user,
      civility: patient.civility
    });
    myPatients.id = patient.id;
    myPatients.photoId = patient.photoId;
    myPatients.isMarkAsSeen = false;
    myPatients.isSeen = true;
    myPatients.isProhibited = prohibited;
    myPatients.isArchived = archived;
    myPatients.isPatientFile = patient.patient ? false : true;
    myPatients.users.forEach(user => {
      this.documentService
        .getDefaultImageEntity(user.id, "PATIENT_FILE")
        .subscribe(
          response => {
            let myReader: FileReader = new FileReader();
            myReader.onloadend = e => {
              user.img = this.sanitizer.bypassSecurityTrustUrl(
                myReader.result as string
              );
            };
            let ok = myReader.readAsDataURL(response);
          },
          error => {
            user.img = this.avatars.user;
          }
        );
    });

    return myPatients;
  }
  cardClicked(item) {
    this.router.navigate(["fiche-patient"], {
      queryParams: {
        id: item.users[0].id
      },
      relativeTo: this.route
    });
  }
  authorizeAction(item) {
    this.myPatientsService
      .authorizePatient(item.users[0].patientId)
      .subscribe(resp => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter(
            elm => elm.users[0].id != item.users[0].id
          );
        }
        this.number--;
      });
  }
  onScroll() {
    if (this.listLength != this.filtredPatients.length) {
      this.listLength = this.filtredPatients.length;
      this.pageNo++;
      this.getNextPatientsProhibitedOfCurrentParactician(this.pageNo);
    }
  }
}
