import { Role } from '@enum/role';


export class Account {
    id: number;
    email: string;
    password: string;
    phoneNumber: number;
    role: Role;
    enabled: boolean;
    accountNonLocked: boolean;
    numberOfAttempts: number;
    constructor();
    constructor(account?: any) {
        this.id = (account && account.id) || "";
        this.email = account && account.email || "";
        this.password = account && account.password || "";
        this.phoneNumber = account && account.phoneNumber || "";
        this.role = account && account.role || "";
        this.enabled = account && account.enabled || false;
        this.accountNonLocked = account && account.accountNonLocked || false;
        this.numberOfAttempts = account && account.numberOfAttempts || "";

    }

}