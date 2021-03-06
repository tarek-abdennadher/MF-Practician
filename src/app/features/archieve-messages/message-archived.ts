export class MessageArchived {
  id: number;
  isSeen: boolean;
  progress: any;
  users: [
    {
      fullName: string;
      img: string | ArrayBuffer;
      title: string;
      type: string;
      photoId: string;
      civility: string;
      id: number;
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
  automaticallyGenerated: boolean
}
