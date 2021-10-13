import { Employee } from "./model/Employee";
import { Gender } from "./model/Gender";
import { Vehicle } from "./model/Vehicle";
import { Account } from "./model/Account";
import { MongoClient } from "mongodb";
import { Environment } from "./model/Environment";
import * as fs from "fs";
import * as faker from "faker";
import * as mysql from "mysql2";
import * as dotenv from "dotenv";

const env: Partial<Environment>  = (process.argv.includes("--dev") ? dotenv.config({path: "../dev.env"}) : dotenv.config({path: "../.env"})).parsed;
if(env == null) {
    throw `
Error while looking for file '${process.argv.includes("--dev") ? "../dev.env" : "../.env"}'
environment variables file was not found
`;
}

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

const employeeSqlFile: string = "./employee.sql";
const vehiclesSqlFile: string = "./vehicles.sql";
const accountsSqlFile: string = "./accounts.sql";

fs.writeFileSync(employeeSqlFile, `INSERT INTO employees (
    first_name,
    middle_name,
    last_name,
    gender,
    phone
) VALUES `, "utf-8");

fs.writeFileSync(vehiclesSqlFile, `INSERT INTO vehicles (
    eid,
    yr,
    brand,
    model,
    vin
) VALUES `, "utf-8");

fs.writeFileSync(accountsSqlFile, `INSERT INTO accounts (
    eid,
    bic,
    account_number,
    bitcoin_address 
) VALUES `, "utf-8");

const employees: Array<Employee & {ts: Date}> = [];
const vehicles: Array<Vehicle & {ts: Date}> = [];
const accounts: Array<Account & {ts: Date}> = [];
const totalRecords = 10000;

for(let x = 0; x < totalRecords; x++){
    const genderSelection: number = getRandomInt(0,2);

    const employee: Employee = {
        firstName: faker.name.firstName(genderSelection),
        middleName: faker.name.middleName(genderSelection),
        lastName: faker.name.lastName(genderSelection),
        gender: [Gender.M, Gender.F][genderSelection],
        phone: faker.phone.phoneNumberFormat(),
    };

    const vehicle: Vehicle = {
        year: getRandomInt(1992, (new Date).getFullYear()),
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        vin: faker.vehicle.vin(),
    };

    const account: Account = {
        accountNumber: faker.finance.account(),
        bankIdentificationCode: faker.finance.bic(),
        bitcoinAddress: faker.finance.bitcoinAddress()
    };

    const ts: Date = new Date();

    employees.push({ ...employee, ts, });
    vehicles.push({ ...vehicle, ts, });
    accounts.push({ ...account, ts,  });

    fs.appendFileSync(employeeSqlFile, `(
    '${employee.firstName.split("'").join("")}',
    '${employee.middleName.toUpperCase()}',
    '${employee.lastName.split("'").join("")}',
    '${employee.gender}',
    '${employee.phone}'
)${x !== totalRecords - 1 ? "," : ";"}`, "utf-8");  

    fs.appendFileSync(vehiclesSqlFile, `(
    ${x+1},
    ${vehicle.year},
    '${vehicle.brand}',
    '${vehicle.model}',
    '${vehicle.vin}'
)${x !== totalRecords - 1 ? "," : ";"}`, "utf-8");

    fs.appendFileSync(accountsSqlFile, `(
    ${x+1},
    '${account.bankIdentificationCode}',
    '${account.accountNumber}',
    '${account.bitcoinAddress}' 
)${x !== totalRecords - 1 ? "," : ";"}`, "utf-8");  
}

console.log("\nPopulating tables...\n\n");


Promise.all([

    new Promise(async (resolve, reject) => {
        const mysqlClient = mysql.createConnection({
            host: env.MYSQL_HOST,
            user: env.MYSQL_USER,
            database: env.MYSQL_DATABASE,
            password: env.MYSQL_PASSWORD,
            port: parseInt(env.MYSQL_PORT),
        });
        
        mysqlClient.query(
            fs.readFileSync(employeeSqlFile).toString().split("\n").join(""),
            async (err) => {
                if(err) reject(err);
                try{
                    const mysqlStartTime: number = Date.now();
                    await Promise.all([
                        new Promise((resolve, reject) => {
                            mysqlClient.query(
                              fs.readFileSync(vehiclesSqlFile).toString().split("\n").join(""),
                              (err) => {
                                if(err == null){
                                    resolve(null);
                                    return;
                                }
                                reject(err);
                              }  
                            )
                        }),
                        new Promise((resolve, reject) => {
                            mysqlClient.query(
                                fs.readFileSync(accountsSqlFile).toString().split("\n").join(""),
                                (err) => {
                                    if(err == null){
                                        resolve(null);
                                        return;
                                    }
                                    reject(err);
                                }  
                            )
                        }),
                    ]);
                    console.log(`MySQL insertions completed in: ${Date.now() - mysqlStartTime} ms`);
                }
                catch(err){
                    reject(err);
                }
                resolve(null);
            }
        );
    }),

    new Promise((resolve, reject) => {
        const url = `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}`;
        const client = new MongoClient(url);
        
        client.connect().then(async (client) => {
            const db = client.db("cab_company");
            const employeesCollection = db.collection("employees");
            const vehiclesCollection = db.collection("vehicles");
            const accountsCollection = db.collection("accounts");
            try{
                const mongoStartTime: number = Date.now();
                await Promise.all([
                    employeesCollection.insertMany(employees),
                    vehiclesCollection.insertMany(vehicles),
                    accountsCollection.insertMany(accounts),
                ]);
                console.log(`Mongo insertions completed in: ${Date.now() - mongoStartTime} ms`);
                resolve(null);
            }
            catch(err){
                reject(err);
            } 
        });
    }),

]).then(res => {
    process.exit(0);
}).catch(err => {
    throw err;
});