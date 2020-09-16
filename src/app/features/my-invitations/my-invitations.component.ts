import { Component, OnInit } from "@angular/core";
import { FeaturesService } from "@app/features/features.service";
import { MyPatientsService } from "@app/features/services/my-patients.service";
import { OrderDirection } from "@app/shared/enmus/order-direction";
import { DomSanitizer } from "@angular/platform-browser";
import { MyDocumentsService } from "@app/features/my-documents/my-documents.service";
import { MyPatients } from "@app/shared/models/my-patients";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { GlobalService } from "@app/core/services/global.service";
import { filter } from "rxjs/operators";
declare var $: any;
@Component({
  selector: "app-my-invitations",
  templateUrl: "./my-invitations.component.html",
  styleUrls: ["./my-invitations.component.scss"]
})
export class MyInvitationsComponent implements OnInit {
  isMyPatients = true;
  links = { isAdd: false, isTypeFilter: false };
  isInvitation: Boolean = true;
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
  topText = this.globalService.messagesDisplayScreen.invitations;
  imageSource: string;
  scroll = false;
  constructor(
    private featureService: FeaturesService,
    private myPatientsService: MyPatientsService,
    private sanitizer: DomSanitizer,
    private documentService: MyDocumentsService,
    private router: Router,
    private route: ActivatedRoute,
    private globalService: GlobalService
  ) {
    this.avatars = this.globalService.avatars;
    this.imageSource = this.avatars.user;
  }

  ngOnInit(): void {
    this.initPendingPatients();
    // update list after detail view
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === "/mes-patients") {
          let currentRoute = this.route;
          while (currentRoute.firstChild)
            currentRoute = currentRoute.firstChild;
          this.pageNo = 0;
          this.getPendingListRealTime(this.pageNo);
          setTimeout(() => {
            $(".selectpicker").selectpicker("refresh");
          }, 500);
        }
      });
  }
  initPendingPatients() {
    this.isInvitation = true;
    this.featureService.setActiveChild(null);
    this.getPendingListRealTime(this.pageNo);
    this.markNotificationsAsSeen();
  }

  markNotificationsAsSeen() {
    this.featureService.markReceivedNotifAsSeen().subscribe(resp => {
      this.featureService.listNotifications = this.featureService.listNotifications.filter(
        notif => notif.messageId != null
      );
    });
  }
  getPendingListRealTime(pageNo) {
    this.number = 0;
    this.getPatientsPendingOfCurrentParactician(pageNo);
  }

  getPatientsPendingOfCurrentParactician(pageNo) {
    this.myPatients = [];
    this.filtredPatients = [];
    this.myPatientsService
      .getPendingInvitations(pageNo, this.direction)
      .subscribe(myPatients => {
        this.number = myPatients.length;
        this.myPatients = [];
        myPatients.forEach(elm => {
          this.myPatients.push(
            this.mappingMyPatients(elm, elm.prohibited, elm.archived)
          );
        });
        this.filtredPatients = this.myPatients;
      });
  }

  getNextPatientsPendingOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPendingInvitations(pageNo, this.direction)
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
  onScroll() {
    if (this.listLength != this.filtredPatients.length) {
      this.listLength = this.filtredPatients.length;
      this.pageNo++;
      this.getNextPatientsPendingOfCurrentParactician(this.pageNo);
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
    jQuery([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#appPatientFile").offset().top
      },
      1000
    );
    this.router.navigate(["fiche-patient"], {
      queryParams: {
        id: item.users[0].id
      },
      relativeTo: this.route
    });
  }
  acceptedAction(item) {
    this.myPatientsService
      .acceptPatientInvitation(item.users[0].patientId)
      .subscribe(resp => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter(
            elm => elm.users[0].id != item.users[0].id
          );
          this.number--;
          this.featureService.setNumberOfPending(
            this.featureService.getNumberOfPendingValue() - 1
          );
          this.featureService.listNotifications = this.featureService.listNotifications.filter(
            notif => notif.senderId != item.users[0].accountId
          );
          this.featureService
            .markNotificationAsSeenBySenderId(item.users[0].accountId)
            .subscribe(resp => {});
        }
      });
  }
  refuseAction(item) {
    this.myPatientsService
      .prohibitePatient(item.users[0].patientId)
      .subscribe(resp => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter(
            elm => elm.users[0].id != item.users[0].id
          );
          this.number--;
          this.featureService.setNumberOfPending(
            this.featureService.getNumberOfPendingValue() - 1
          );
          this.featureService.listNotifications = this.featureService.listNotifications.filter(
            notif => notif.senderId != item.users[0].accountId
          );
        }
      });
  }
}
