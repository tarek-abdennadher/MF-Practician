import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HlsLinksModule } from "hls-links";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MessagingReplyComponent } from "../messaging-reply/messaging-reply.component";
import { MessagingDetailComponent } from "./messaging-detail.component";
import { HlsMessagingDetailModule } from "hls-messaging-detail";
import { HlsNewMessageDetailModule } from "hls-new-message-detail";
import { MessageDetailRoutingModule } from "./messaging-detail-routing";
import { NgxSpinnerModule } from "ngx-spinner";
import { NotifierModule, NotifierOptions } from "angular-notifier";
const notifierOptions: NotifierOptions = {
  position: {
    horizontal: {
      position: "right",
      distance: 20
    },
    vertical: {
      position: "bottom",
      distance: 250
    }
  },
  theme: "material",
  behaviour: {
    autoHide: 2000,
    onClick: false,
    onMouseover: "pauseAutoHide",
    showDismissButton: false
  },
  animations: {
    enabled: true,
    show: {
      preset: "fade",
      speed: 1500,
      easing: "ease"
    },
    hide: {
      preset: "fade",
      speed: 300,
      easing: "ease",
      offset: 50
    },
    shift: {
      speed: 300,
      easing: "ease"
    },
    overlap: 150
  }
};
@NgModule({
  declarations: [MessagingDetailComponent, MessagingReplyComponent],
  imports: [
    CommonModule,
    HlsLinksModule,
    MessageDetailRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
    MatProgressSpinnerModule,
    HlsLinksModule,
    HlsMessagingDetailModule,
    HlsNewMessageDetailModule,
    NgxSpinnerModule,
    NotifierModule.withConfig(notifierOptions)
  ],
  providers: []
})
export class MessageDetailModule {}
