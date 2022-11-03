//import acj and database functions
import * as acj from "./acj.js";
import * as acjDb from "./database.js";
import sqlite3 from 'sqlite3';

//set up database
//const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./acj.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
})

async function setUpDatabase(db){
    // await acjDb.initializeDatabase(db);
    // await acjDb.clearTables(db);
    // await acjDb.displayTables(db);
    // await acjDb.addDummyAcjResources(db,3);
    // await acjDb.addDummyAcjSubmissions(db, 10);
    // await acjDb.addDummyUsers(db, 3);
    await acjDb.displayTables(db);

    // return acjDb.initializeDatabase(db)
    //     .then((db) => {
    //         return acjDb.clearTables(db);
    //     })
    //     .then((db) => {
    //         return acjDb.addDummyAcjResources(db, 1);
    //     })
    //     .then((db) => {
    //         return acjDb.addDummyAcjSubmissions(db, 10);
    //     })
    //     .then((db) => {
    //         return acjDb.displayTables(db);
    //     })

    //acjDb.clearTables(db);
    //acjDb.displayTables(db);
    //acjDb.addDummyAcjResources(db, 1);
    // acjDb.addDummyAcjSubmissions(db, 10);
    //acjDb.displayTables(db);
}

setUpDatabase(db);

// db.close((err) => {
//     if (err) return console.error(err.message);
// })
//populate database with dummy data



//begin round of ACJ
let res = acjDb.getAcjResource(db, 1);
res.then((r) => acj.prepareNewAcjRound(db, r)).catch((err) => console.log(err));

//get pairs


//take in marker's decision on each pair (make decision based on some answer key)
//log info on the submissions and comparisons for this round
//begin another round and repeat until x number of rounds completed
//return ranking of all submissions