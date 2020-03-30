import { Component, OnInit } from "@angular/core";
import { MyDocumentsService } from "./my-documents.service";
import * as FileSaver from "file-saver";

@Component({
  selector: "app-my-documents",
  templateUrl: "./my-documents.component.html",
  styleUrls: ["./my-documents.component.scss"]
})
export class MyDocumentsComponent implements OnInit {
  links = {
    isFilter: true
  };
  attachements = [];
  constructor(private mydocumentsService: MyDocumentsService) {}

  ngOnInit(): void {
    this.getMyAttachements();
  }
  getMyAttachements() {
    this.mydocumentsService.getMyAttachements().subscribe(attachements => {
      attachements.forEach(attachement => {
        this.mydocumentsService
          .getNodeDetailsFromAlfresco(attachement.nodeId)
          .subscribe(node => {
            const splitName = node.entry.name.split(".");
            const extention = splitName[splitName.length - 1];
            if (node.entry) {
              this.attachements.push({
                title: node.entry.name,
                date: new Date(node.entry.createdAt).toLocaleDateString(),
                name:
                  attachement.senderDetails.patient != null
                    ? attachement.senderDetails.patient.fullName
                    : attachement.senderDetails.practician.fullName,
                type: extention,
                nodeId: attachement.nodeId
              });
            }
          });
      });
    });
  }
  downloadFile(attachement) {
    this.mydocumentsService
      .downloadFile(attachement.nodeId)
      .subscribe(response => {
        const blob = new Blob([response.body]);
        const filename = attachement.title;
        const filenameDisplay = filename;
        const dotIndex = filename.lastIndexOf(".");
        const extension = filename.substring(dotIndex + 1, filename.length);
        let resultname: string;
        if (filenameDisplay !== "") {
          resultname = filenameDisplay.includes(extension)
            ? filenameDisplay
            : filenameDisplay + "." + extension;
        } else {
          resultname = filename;
        }
        FileSaver.saveAs(blob, resultname);
      });
  }
  getType(extention:string){
   switch (extention.toLowerCase()) {
     case "pdf":
       return 'application/pdf';
       case "png":
       return 'image/png';
       case "jpeg":
       return 'image/jpeg';
       case "jpg":
       return 'image/jpg';
     default:
      return 'text/plain';
    }
  }
  visualizeFile(attachement) {
    this.mydocumentsService
      .downloadFile(attachement.nodeId)
      .subscribe(response => {
        const filename = attachement.title;
        const filenameDisplay = filename;
        const dotIndex = filename.lastIndexOf(".");
        const extension = filename.substring(dotIndex + 1, filename.length);

        const blob = new Blob([response.body],{type:this.getType(extension)});

        let resultname: string;
        if (filenameDisplay !== "") {
          resultname = filenameDisplay.includes(extension)
            ? filenameDisplay
            : filenameDisplay + "." + extension;
        } else {
          resultname = filename;
        }
        this.openFile("",filename,blob);
      });
  }

   openFile(resData, fileName,blob) {
    var ieEDGE = navigator.userAgent.match(/Edge/g);
    var ie = navigator.userAgent.match(/.NET/g); // IE 11+
    var oldIE = navigator.userAgent.match(/MSIE/g);

    if (ie || oldIE || ieEDGE) {
       window.navigator.msSaveBlob(blob, fileName);
    }
    else {
       var fileURL = URL.createObjectURL(blob);
       var win = window.open();
       win.document.write('<iframe src="' + fileURL + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>')

    }
}
}
