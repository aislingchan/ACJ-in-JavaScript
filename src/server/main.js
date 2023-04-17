const acj = require('./acj');
const acjDb = require('./database');
const sqlite3 = require('sqlite3');
const fs = require('fs/promises');

async function setUpDatabase(){
    const db = acjDb.openDbConn();
    await acjDb.initializeDatabase(db);
    await acjDb.clearTables(db);

    await acjDb.addDummyUsers(db);

    const exampleRes = {
        created: new Date(),
        title: "Intro to Java Programming (SAMPLE FOR TESTING)",
        dueDate: new Date(),
        submissionInstrs: "Please make sure your code has comments and proper formatting",
        gradingInstrs: "This activity aims to examine a student's understanding of asynchronous programming",
        submissionType: "Java files",
        maxRounds: 3
    }
    await acjDb.insertResource(db, exampleRes)

    const studentUsernames = ["1234567A@student.gla.ac.uk","2345678B@student.gla.ac.uk","3456789C@student.gla.ac.uk","3462708C@student.gla.ac.uk",
                                    "8432708G@student.gla.ac.uk","6862709H@student.gla.ac.uk","5462264I@student.gla.ac.uk","2464504J@student.gla.ac.uk","8694708K@student.gla.ac.uk",
                                    "9628508L@student.gla.ac.uk"];
    for(let i=0; i<studentUsernames.length; i++){
        console.log(`Enrolling student ${studentUsernames[i]}`);
        await acjDb.enrollUser(db, studentUsernames[i], 1, 1, 0);
    }
    const markerUsernames = ["john.doe@glasgow.ac.uk","jane.doe@glasgow.ac.uk"];
    for(let i=0; i<markerUsernames.length; i++){
        console.log(`Enrolling marker ${markerUsernames[i]}`);
        await acjDb.enrollUser(db, markerUsernames[i], 1, 0, 1);
    }

    for(let i=1; i<11; i++){
        const data = await fs.readFile(`../files-for-testing/java-samples/sample${i}.java`, { encoding: 'utf8' });
        const bufData = Buffer.from(data);

        const userObj = await acjDb.getAcjUserFromUsername(db, studentUsernames[i-1]);
        const actObj = await acjDb.getAcjResourceFromTitle(db, "Intro to Java Programming (SAMPLE FOR TESTING)");

        const exampleSub = {
            actId: actObj.id,
            userId: userObj.id,
            data: bufData,
            subType: null
        }

        await acjDb.insertSubmission(db, exampleSub); 
    }

    if(process.argv[2]){
        console.log(`Enrolling user ${process.argv[2]}`);
        enrolUserForTesting(process.argv[2]);
    }

}

//Enrols a given user, as student and marker, into the sample activity that is already in the database.
//Note: username is an email address (case sensitive).
async function enrolUserForTesting(username){
    const db = acjDb.openDbConn();

    await acjDb.enrollUser(db, username, 1, 1, 1);
    acjDb.closeDbConn(db);
}

async function runRounds(db, roundNum){
    // setting up
    const usr = await acjDb.getAcjUser(db, 1);
    let avoid = [];
    const res = await acjDb.getAcjResource(db, 1);
    await acj.prepareNewAcjRound(db, res);

    for(let i=0; i<roundNum; i++){
        console.log("Begin Judging");

        //Judge each pairing
        let dueComps = await acjDb.getIncompleteComparisons(db, res.round, res.id);
        console.log("get incomplete comparisons");
        console.log(dueComps);
        while(dueComps.length > 0){
            console.log("In judging loop")
            let currentCmp = await acj.getAComparison(res, res.round, usr.id, avoid, db);
            await makeDecision(db, currentCmp, usr.id, 0.05);
            dueComps = await acjDb.getIncompleteComparisons(db, res.round, res.id);
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

if (require.main === module){
    setUpDatabase();
}


module.exports = {
    runACJ
}