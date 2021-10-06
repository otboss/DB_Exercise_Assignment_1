import { Gender } from "./gender";

export interface Employee {
    firstName: string;
    middleName: string;
    lastName: string;
    gender: Gender;
    phone: string;
}