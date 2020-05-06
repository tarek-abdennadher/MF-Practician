export class PracticianSearch {
  id: number;
  isSeen: boolean;
  users: [
    {
      fullName: string;
      img: any;
      title: string;
      type: string;
      civility: string;
    }
  ];
  object: {
    name: string;
    isImportant: boolean;
    isLocalisation: boolean;
  };
  time: string;
  isImportant: boolean;
  hasFiles: boolean;
  isViewDetail: boolean;
  isArchieve: boolean;
  isChecked: boolean;
  photoId: string;
}
