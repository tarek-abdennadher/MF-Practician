export class PatientFile {
    patientId: number;
    practicianId: number;
    additionalAddress: string;
    address: string;
    birthday: string;
    category: Category;
    city: string;
    civility: string;
    email: string;
    firstName: string;
    lastName: string;
    maidenName: string;
    otherPhones: string[];
    phoneNumber: string;
    photoId: string;
    zipCode: string;

    constructor();
    constructor(patientFile?: any) {
        this.patientId = (patientFile && patientFile.patientId) || null;
        this.practicianId = (patientFile && patientFile.practicianId) || null;
        this.additionalAddress = (patientFile && patientFile.additionalAddress) || null;
        this.address = (patientFile && patientFile.address) || null;
        this.birthday = (patientFile && patientFile.birthday) || null;
        this.category = (patientFile && patientFile.category) || null;
        this.city = (patientFile && patientFile.city) || null;
        this.civility = (patientFile && patientFile.civility) || null;
        this.email = (patientFile && patientFile.email) || null;
        this.firstName = (patientFile && patientFile.firstName) || null;
        this.lastName = (patientFile && patientFile.lastName) || null;
        this.maidenName = (patientFile && patientFile.maidenName) || null;
        this.otherPhones = (patientFile && patientFile.otherPhones) || [];
        this.phoneNumber = (patientFile && patientFile.phoneNumber) || null;
        this.photoId = (patientFile && patientFile.photoId) || null;
        this.zipCode = (patientFile && patientFile.zipCode) || null;
    }
}

export class Category {
    id: number;
    name: string;
    constructor();
    constructor(category?: any) {
        this.id = (category && category.id) || null;
        this.name = category && category.name || null;
    }

}