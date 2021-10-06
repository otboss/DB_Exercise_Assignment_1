''' APACHE CASSANDRA SCHEMA FILE '''

CREATE KEYSPACE IF NOT EXISTS cab_company WITH REPLICATION = {'class' : 'NetworkTopologyStrategy', 'datacenter1' : 1};
USE cab_company;

CREATE TABLE IF NOT EXISTS employees (
    eid int,
    first_name text,
    middle_name text,
    last_name text,
    gender text,
    phone text,
    PRIMARY KEY(
        eid
    )
);

CREATE TABLE IF NOT EXISTS vehicles (
    eid int,
    yr int,
    brand text,
    model text,
    vin text,
    PRIMARY KEY(
        eid
    )
);

CREATE TABLE IF NOT EXISTS accounts (
    eid int,
    bic text,
    account_number text,
    bitcoin_address text,
    PRIMARY KEY(
        eid
    )
);