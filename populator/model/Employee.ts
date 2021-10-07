import { Gender } from "./Gender";

export interface Employee {
    firstName: string;
    middleName: string;
    lastName: string;
    gender: Gender;
    phone: string;
}