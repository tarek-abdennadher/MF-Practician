export class MessageDto {
  public id?: number;
  public body?: string;
  public documentHeader?: string;
  public documentBody?: string;
  public documentFooter?: string;
  public object?: any;
  public toReceivers?: any;
  public ccReceivers?: any;
  public sender?: any;
  public parent?: any;
  public hasFiles?: boolean;
  public requestTypeId?: number;
  public requestTitleId?: number;
  public uuid?: string;
  public showFileToPatient: boolean;
  constructor();
  constructor(message?: any) {
    this.id = (message && message.id) || "";
    this.body = (message && message.body) || "";
    this.documentHeader = (message && message.documentHeader) || "";
    this.documentBody = (message && message.documentBody) || "";
    this.documentFooter = (message && message.documentFooter) || "";
    this.toReceivers = (message && message.toReceivers) || [];
    this.ccReceivers = (message && message.ccReceivers) || [];
    this.sender = (message && message.sender) || "";
    this.parent = (message && message.parent) || "";
    this.hasFiles = (message && message.hasFiles) || false;
    this.showFileToPatient = (message && message.showFileToPatient) || false;
    this.requestTypeId = (message && message.requestTypeId) || "";
    this.requestTitleId = (message && message.requestTitleId) || "";
    this.uuid = (message && message.uuid) || "";
  }
}
