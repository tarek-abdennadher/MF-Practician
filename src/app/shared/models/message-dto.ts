export class MessageDto {
  public id?: number;
  public body?: string;
  public object?: any;
  public toReceivers?: any;
  public ccReceivers?: any;
  public sender?: any;
  public parent?: any;
  public hasFiles?: boolean;

  constructor();
  constructor(message?: any) {
    this.id = (message && message.id) || "";
    this.body = (message && message.body) || "";
    this.toReceivers = (message && message.toReceivers) || [];
    this.ccReceivers = (message && message.ccReceivers) || [];
    this.sender = (message && message.sender) || "";
    this.parent = (message && message.parent) || "";
    this.hasFiles = (message && message.hasFiles) || false;
  }
}
