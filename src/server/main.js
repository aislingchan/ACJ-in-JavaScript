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
    await acjDb.addDummyAcjSubmissions(db, 6);
    await acjDb.addDummyUsers(db, 3);
    await acjDb.displayTables(db);
}

//setUpDatabase(db);

// db.close((err) => {
//     if (err) return console.error(err.message);
// })


async function runRound(db){
    //begin round of ACJ
    console.log("in runRound");
    const usr = await acjDb.getAcjUser(db, 1);
    let avoid = [];
    const res = await acjDb.getAcjResource(db, 1);
    await acj.prepareNewAcjRound(db, res);

    await acjDb.displayTables(db);
    console.log("Begin Judging");

    //Judge each pairing
    let dueComps = await acjDb.getIncompleteComparisons(db, res.round, res.id);
    console.log("get incomplete comparisons");
    console.log(dueComps);
    while(dueComps.length > 0){
        console.log("In judging loop")
        let currentCmp = await acj.getAComparison(res, res.round, usr.userId, avoid, db);
        // console.log("Got a comparison object:");
        // console.log(currentCmp);
        // console.log("displaying updated comparison table");
        // await acjDb.displayTable(db, "acjComparison");
        await makeDecision(db, currentCmp, usr.userId);
        dueComps = await acjDb.getIncompleteComparisons(db, res.round, res.id);
        //console.log(dueComps);
        //acjDb.displayTable(db, "acjComparison");
    }
}

//Make decision on each pair based on some answer key
async function makeDecision(db, cmp, userId){
    const l_ranking = perfectRanking[cmp.left_id.toString()];
    const r_ranking = perfectRanking[cmp.right_id.toString()];
    console.log(`Left ranking (id: ${cmp.left_id}): ${l_ranking}. Right ranking (id: ${cmp.right_id}): ${r_ranking}`);
    if(l_ranking < r_ranking){
        console.log("left win");
        await acj.checkInput(userId, cmp.id, true, db);
    }
    else{
        console.log("right win");
        await acj.checkInput(userId, cmp.id, false, db);
    }
}

//key: submission id, value: true ranking
const perfectRanking = {
    '1': 7,
    '2': 3,
    '3': 2,
    '4': 6,
    '5': 9,
    '6': 5,
    '7': 4,
    '8': 10,
    '9': 1,
    '10': 8
}

//log info on the submissions and comparisons for this round
//begin another round and repeat until x number of rounds completed
//return ranking of all submissions

async function runACJ(db){
    await setUpDatabase(db);
    await runRound(db);
    await acjDb.displayTables(db);
}

runACJ(db);