import { SendType } from "../enmus/send-type";

export class Message {
  public id?: number;
  public sendType?: SendType | string;
  public body?: string;
  public documentHeader?: string;
  public documentBody?: string;
  public documentFooter?: string;
  public object?: any;
  public toReceivers?: any;
  public ccReceivers?: any;
  public sender?: any;
  public parent_id?: number;
  public sender_id?: number;
  public address?: string;
  public freeObject?: string;
  public uuid?: string;
  public hasFiles: boolean;
  public showFileToPatient: boolean;

  constructor();
  constructor(message?: any) {
    this.id = (message && message.id) || "";
    this.sendType = (message && message.sendType) || SendType.MESSAGING;
    this.body = (message && message.body) || "";
    this.documentHeader = (message && message.documentHeader) || null;
    this.documentBody = (message && message.documentBody) || null;
    this.documentFooter = (message && message.documentFooter) || null;
    this.toReceivers = (message && message.toReceivers) || [];
    this.ccReceivers = (message && message.ccReceivers) || [];
    this.sender = (message && message.sender) || "";
    this.parent_id = (message && message.parent_id) || "";
    this.sender_id = (message && message.sender_id) || "";
    this.address = (message && message.address) || "";
    this.freeObject = (message && message.freeObject) || "";
    this.uuid = (message && message.uuid) || "";
    this.hasFiles = (message && message.hasFiles) || false;
    this.showFileToPatient = (message && message.showFileToPatient) || true;
  }
}
