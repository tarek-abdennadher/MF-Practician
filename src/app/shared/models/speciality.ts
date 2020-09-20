export class Speciality {
    id: number;
    name: string;
    constructor();
    constructor(speciality?: any) {
        this.id = (speciality && speciality.id) || "";
        this.name = speciality && speciality.name || "";
    }

}