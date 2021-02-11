import { Component, OnDestroy, OnInit } from "@angular/core";
import { FeaturesService } from "@app/features/features.service";
import { MyPatientsService } from "@app/features/services/my-patients.service";
import { OrderDirection } from "@app/shared/enmus/order-direction";
import { DomSanitizer, Title } from "@angular/platform-browser";
import { MyDocumentsService } from "@app/features/my-documents/my-documents.service";
import { MyPatients } from "@app/shared/models/my-patients";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { GlobalService } from "@app/core/services/global.service";
import { filter, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
declare var $: any;
@Component({
  selector: "app-my-invitations",
  templateUrl: "./my-invitations.component.html",
  styleUrls: ["./my-invitations.component.scss"],
})
export class MyInvitationsComponent implements OnInit, OnDestroy {
  private _destroyed$ = new Subject();
  isMyPatients = true;
  links = { isAdd: false, isTypeFilter: false };
  isInvitation: Boolean = true;
  pageNo = 0;
  myPatients = [];
  number = 0;
  filtredPatients = [];
  scrollDown = true;
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
    this.scroll = true;
    this.initPendingPatients();
    // update list after detail view
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === "/mes-invitations?loading=true") {
          let currentRoute = this.route;
          while (currentRoute.firstChild)
            currentRoute = currentRoute.firstChild;
            this.scrollDown = true;
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
    this.featureService
      .markReceivedNotifAsSeen()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((resp) => {
        this.featureService.listNotifications = this.featureService.listNotifications.filter(
          (notif) => notif.messageId != null
        );
      });
  }
  getPendingListRealTime(pageNo) {
    this.getPatientsPendingOfCurrentParactician(pageNo);
  }

  getPatientsPendingOfCurrentParactician(pageNo) {
    this.scrollDown = false;
    this.filtredPatients = [];
    this.myPatientsService
      .getPendingInvitationsV3(pageNo, this.direction)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((result) => {
        this.scroll = false;
        this.number = result.listSize;
        result.list.forEach((elm) => {
          this.filtredPatients.push(this.mappingMyPatients(elm, elm.prohibited, elm.archived));
        });
        this.scrollDown = true;
      });
  }

  getNextPatientsPendingOfCurrentParactician(pageNo) {
    this.myPatientsService
      .getPendingInvitationsV3(pageNo, this.direction)
      .pipe(takeUntil(this._destroyed$))
      .subscribe(result => {
        this.number = result.listSize;
        if (result.list.length > 0) {
          result.list.forEach(elm => {
            this.filtredPatients.push(this.mappingMyPatients(elm, elm.prohibited, elm.archived));
          });
        }
        this.scrollDown = true;
      });
  }

  onScroll() {
    if (this.scrollDown) {
      this.scrollDown = false;
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
      civility: patient.civility,
    });
    myPatients.id = patient.id;
    myPatients.photoId = patient.photoId;
    myPatients.isMarkAsSeen = false;
    myPatients.isSeen = true;
    myPatients.isProhibited = prohibited;
    myPatients.isArchived = archived;
    myPatients.isPatientFile = patient.patient ? false : true;
    myPatients.users.forEach((user) => {
      this.documentService
        .getDefaultImageEntity(user.id, "PATIENT_FILE")
        .pipe(takeUntil(this._destroyed$))
        .subscribe(
          (response) => {
            let myReader: FileReader = new FileReader();
            myReader.onloadend = (e) => {
              user.img = this.sanitizer.bypassSecurityTrustUrl(
                myReader.result as string
              );
            };
            let ok = myReader.readAsDataURL(response);
          },
          (error) => {
            user.img = this.avatars.user;
          }
        );
    });

    return myPatients;
  }
  cardClicked(item) {
    jQuery([document.documentElement, document.body]).animate(
      {
        scrollTop: $("#appPatientFile").offset().top - 100,
      },
      1000
    );
    this.router.navigate(["fiche-patient"], {
      queryParams: {
        id: this.featureService.encrypt(item.users[0].id),
        parent: "invitation",
      },
      relativeTo: this.route,
    });
  }
  acceptedAction(item) {
    this.scrollDown = false;
    this.myPatientsService
      .acceptPatientInvitation(item.users[0].patientId)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((resp) => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter(
            (elm) => elm.users[0].id != item.users[0].id
          );
          this.number--;
          this.featureService.setNumberOfPending(
            this.featureService.getNumberOfPendingValue() - 1
          );
          this.featureService.listNotifications = this.featureService.listNotifications.filter(
            (notif) => notif.senderId != item.users[0].accountId
          );
          this.featureService
            .markNotificationAsSeenBySenderId(item.users[0].accountId)
            .pipe(takeUntil(this._destroyed$))
            .subscribe((resp) => {});
          this.router.navigate(["/mes-invitations"], {
            queryParams: { loading: true },
          });
          this.scrollDown = true;
        }
      });
  }
  refuseAction(item) {
    this.scrollDown = false;
    this.myPatientsService
      .prohibitePatient(item.users[0].patientId)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((resp) => {
        if (resp == true) {
          this.filtredPatients = this.filtredPatients.filter(
            (elm) => elm.users[0].id != item.users[0].id
          );
          this.number--;
          this.featureService.setNumberOfPending(
            this.featureService.getNumberOfPendingValue() - 1
          );
          this.featureService.listNotifications = this.featureService.listNotifications.filter(
            (notif) => notif.senderId != item.users[0].accountId
          );
          this.router.navigate(["/mes-invitations"], {
            queryParams: { loading: true },
          });
          this.scrollDown = true;
        }
      });
  }
}
