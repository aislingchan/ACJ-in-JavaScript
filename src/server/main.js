//import acj and database functions
import * as acj from "./acj.js";
import * as acjDb from "./database.js";
import sqlite3 from 'sqlite3';

//set up database and populate database with dummy data
//const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./acj.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
})

async function setUpDatabase(db){
    await acjDb.initializeDatabase(db);
    await acjDb.clearTables(db);
    await acjDb.displayTables(db);
    await acjDb.addDummyAcjResources(db,3);
    await acjDb.addDummyAcjSubmissions(db, 10);
    await acjDb.addDummyUsers(db, 3);
    await acjDb.displayTables(db);
}

//setUpDatabase(db);

// db.close((err) => {
//     if (err) return console.error(err.message);
// })


async function runRound(db){
    //begin round of ACJ
    const usr = await acjDb.getAcjUser(db, 1);
    let avoid = [];
    const res = await acjDb.getAcjResource(db, 1);
    await acj.prepareNewAcjRound(db, res);

    await acjDb.displayTables(db);

    //get a pairing
    let currentCmp = await acj.getAComparison(res, 1, usr.userId, avoid, db);
    console.log("Got a comparison");
    console.log(currentCmp);
}

//take in marker's decision on each pair (make decision based on some answer key)


//log info on the submissions and comparisons for this round
//begin another round and repeat until x number of rounds completed
//return ranking of all submissions

async function runACJ(db){
    await setUpDatabase(db);
    await runRound(db);
}

runACJ(db);