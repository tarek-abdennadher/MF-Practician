import { Component, OnDestroy, OnInit } from "@angular/core";
import { OrderDirection } from "@app/shared/enmus/order-direction";
import { FeaturesService } from "../features.service";
import { MyPatientsService } from "../services/my-patients.service";
import { DomSanitizer, Title } from "@angular/platform-browser";
import { MyDocumentsService } from "../my-documents/my-documents.service";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { GlobalService } from "@app/core/services/global.service";
import { MyPatients } from "@app/shared/models/my-patients";
import { filter, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
declare var $: any;
@Component({
  selector: "app-my-patients-blocked",
  templateUrl: "./my-patients-blocked.component.html",
  styleUrls: ["./my-patients-blocked.component.scss"]
})
export class MyPatientsBlockedComponent implements OnInit, OnDestroy {
  private _destroyed$ = new Subject();
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
    private globalService: GlobalService,
    private title: Title
  ) {
    this.title.setTitle(this.topText);
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnDestroy(): void {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }

  ngOnInit(): void {
    this.initProhibitedPatients();
    // update list after detail view
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === "/mes-patients-bloques?loading=true") {
          let currentRoute = this.route;
          while (currentRoute.firstChild)
            currentRoute = currentRoute.firstChild;
          this.listLength = 0;
          this.pageNo = 0;
          this.getPatientsProhibitedOfCurrentParactician(this.pageNo);
          setTimeout(() => {
            $(".selectpicker").selectpicker("refresh");
          }, 500);
        }
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
      .pipe(takeUntil(this._destroyed$))
      .subscribe(myPatients => {
        this.number = myPatients.length;
        myPatients.forEach(elm => {
          this.myPatients.push(
            this.mappingMyPatients(elm, elm.prohibited, elm.archived)
          );
        });
        // sorting the list by fullname (in the alphabetic order)
        this.myPatients.sort((p1,p2) => {
            if (p1.users[0].fullName > p2.users[0].fullName) {
                return 1;
            }
        
            if (p1.users[0].fullName < p2.users[0].fullName) {
                return -1;
            }
        
            return 0;
        });
        this.filtredPatients = this.myPatients;
      });
  }

  getNextPatientsProhibitedOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPatientsProhibitedOfCurrentParactician(pageNo, this.direction)
      .pipe(takeUntil(this._destroyed$))
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
      fullName:
        patient.fullName.substring(patient.civility.length) +
        " (" +
        (patient.civility !== "" ? patient.civility : "Enfant") +
        ")",
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
        .pipe(takeUntil(this._destroyed$))
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
    jQuery([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#appPatientFile").offset().top - 100
      },
      1000
    );
    this.router.navigate(["fiche-patient"], {
      queryParams: {
        id: this.featureService.encrypt(item.users[0].id)
      },
      relativeTo: this.route
    });
  }
  authorizeAction(item) {
    this.myPatientsService
      .authorizePatient(item.users[0].patientId)
      .pipe(takeUntil(this._destroyed$))
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
