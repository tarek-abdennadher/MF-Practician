export class MessageArchived {
  id: number;
  isSeen: boolean;
  users: [
    {
      fullName: string;
      img: string |ArrayBuffer;
      title: string;
      type: string;
      photoId: string;
    }
  ];
  object: {
    name: string;
    isImportant: boolean;
  };
  time: string;
  isImportant: boolean;
  hasFiles: boolean;
  isViewDetail: boolean;
  isChecked: boolean;
}
