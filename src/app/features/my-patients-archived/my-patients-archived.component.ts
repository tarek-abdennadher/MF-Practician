import { Component, OnInit } from '@angular/core';
import { OrderDirection } from '@app/shared/enmus/order-direction';
import { FeaturesService } from '../features.service';
import { MyPatientsService } from '../services/my-patients.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { GlobalService } from '@app/core/services/global.service';
import { MyDocumentsService } from '../my-documents/my-documents.service';
import { MyPatients } from '@app/shared/models/my-patients';
import { filter } from 'rxjs/operators';
declare var $: any;
@Component({
  selector: 'app-my-patients-archived',
  templateUrl: './my-patients-archived.component.html',
  styleUrls: ['./my-patients-archived.component.scss']
})
export class MyPatientsArchivedComponent implements OnInit {
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
  topText = this.globalService.messagesDisplayScreen.archived_patients;
  bottomText = ""
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
    this.initArchivedPatients();
    // update list after detail view
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        let currentRoute = this.route;
        while (currentRoute.firstChild) currentRoute = currentRoute.firstChild;
        this.pageNo = 0;
        this.getPatientsArchivedOfCurrentParactician(this.pageNo);
        setTimeout(() => {
          $(".selectpicker").selectpicker("refresh");
        }, 500);
      });
  }
  initArchivedPatients() {
    this.featureService.setActiveChild(null);
    this.getPatientsArchivedOfCurrentParactician(this.pageNo);
  }
  getPatientsArchivedOfCurrentParactician(pageNo) {
    this.myPatients = [];
    this.filtredPatients = [];
    this.myPatientsService
      .getPatientFilesArchived(pageNo, this.direction)
      .subscribe(myPatients => {
        this.number = myPatients.length;
        myPatients.forEach(elm => {
          this.myPatients.push(this.mappingMyPatients(elm, false, true));
        });
        this.filtredPatients = this.myPatients;
      });
  }

  getNextPatientsArchivedOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPatientFilesArchived(pageNo, this.direction)
      .subscribe(myPatients => {
        if (myPatients.length > 0) {
          this.number = this.number + myPatients.length;
          myPatients.forEach(elm => {
            this.myPatients.push(this.mappingMyPatients(elm, false, true));
          });
        }
      });
  }
  onScroll() {
    if (this.listLength != this.filtredPatients.length) {
      this.listLength = this.filtredPatients.length;
      this.pageNo++;
      this.getNextPatientsArchivedOfCurrentParactician(this.pageNo);
    }
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
  activatedAction(item) {
    this.myPatientsService
      .activatePatientFile(item.users[0].id)
      .subscribe(resp => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter(
            elm => elm.users[0].id != item.users[0].id
          );
          this.number--;
        }
      });
  }
}
