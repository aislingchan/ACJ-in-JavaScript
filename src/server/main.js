//import acj and database functions
// import * as acj from "./acj.js";
// import * as acjDb from "./database.js";
// import sqlite3 from 'sqlite3';
// import { rankingLogger } from "./rankingLogger.js";

const acj = require('./acj');
const acjDb = require('./database');
const sqlite3 = require('sqlite3');
const fs = require('fs');

async function setUpDatabase(db){
    await acjDb.initializeDatabase(db);
    await acjDb.clearTables(db);
    //await acjDb.displayTables(db);
    await acjDb.addDummyAcjResources(db,3);
    await acjDb.addDummyAcjSubmissions(db, 10);
    await acjDb.addDummyUsers(db, 3);
    //await acjDb.displayTables(db);
}

async function runRounds(db, roundNum){
    // setting up
    const usr = await acjDb.getAcjUser(db, 1);
    let avoid = [];
    const res = await acjDb.getAcjResource(db, 1);
    await acj.prepareNewAcjRound(db, res);

    for(let i=0; i<roundNum; i++){
        //await acjDb.displayTables(db);
        console.log("Begin Judging");

        //Judge each pairing
        let dueComps = await acjDb.getIncompleteComparisons(db, res.round, res.id);
        console.log("get incomplete comparisons");
        console.log(dueComps);
        while(dueComps.length > 0){
            console.log("In judging loop")
            let currentCmp = await acj.getAComparison(res, res.round, usr.id, avoid, db);
            // console.log("Got a comparison object:");
            // console.log(currentCmp);
            // console.log("displaying updated comparison table");
            // await acjDb.displayTable(db, "acjComparison");
            await makeDecision(db, currentCmp, usr.id, 0.05);
            dueComps = await acjDb.getIncompleteComparisons(db, res.round, res.id);
            //console.log(dueComps);
            //acjDb.displayTable(db, "acjComparison");
        }
        // recalculate ranks. Creates new pairings even though they may not be used
        await acj.prepareNewAcjRound(db, res);
    }
}

//Make decision on each pair based on some answer key
async function makeDecision(db, cmp, userId, percentError){
    const l_ranking = acj.perfectRanking[cmp.left_id.toString()];
    const r_ranking = acj.perfectRanking[cmp.right_id.toString()];
    console.log(`Left ranking (id: ${cmp.left_id}): ${l_ranking}. Right ranking (id: ${cmp.right_id}): ${r_ranking}`);
    const perfectDecision = l_ranking > r_ranking;
    const imperfectDecision = Math.random() < (1-percentError) ? perfectDecision : !perfectDecision;
    console.log(`perfect: ${perfectDecision}. imperfect: ${imperfectDecision}`);
    if(imperfectDecision){
        console.log("left win");
        await acj.checkInput(userId, cmp.id, true, db);
    }
    else{
       console.log("right win");
        await acj.checkInput(userId, cmp.id, false, db);
    }
}

// //key: submission id, value: true ranking, worst to best: 9,3,2,7,6,4,1,10,5,8 | 3,2,6,4,1,5 
// const perfectRanking = {
//     '1': 7,
//     '2': 3,
//     '3': 2,
//     '4': 6,
//     '5': 9,
//     '6': 5,
//     '7': 4,
//     '8': 10,
//     '9': 1,
//     '10': 8
// }

//log info on the submissions and comparisons for this round
//begin another round and repeat until x number of rounds completed
//return ranking of all submissions

async function runACJ(){
    const db = acjDb.openDbConn();
    await setUpDatabase(db);
    await runRounds(db, 8);
    await acjDb.displayTables(db);
    acjDb.closeDbConn(db);
    //const results = fs.readFileSync('results.txt');
    //return results;
}

//runACJ();

module.exports = {
    runACJ
}