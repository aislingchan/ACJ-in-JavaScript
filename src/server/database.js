const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./acj.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
})
//move the above code to main file later

function initializeDatabase(db){
    db.serialize(function () {
        db.all("select name from sqlite_master where type='table'", function (err, tables) {
            console.log(tables.length);
            if(tables.length==0){
                query = "CREATE TABLE acjResource(id INTEGER PRIMARY KEY, created DATETIME, round INTEGER);";
                db.run(query);
                query = "CREATE TABLE acjUser(id INTEGER PRIMARY KEY, userId VARCHAR(40));"
                db.run(query);
                query = "CREATE TABLE acjSubmission(id INTEGER PRIMARY KEY, activity_id INTEGER, rank INTEGER, latestScore FLOAT);";
                db.run(query);
                query = "CREATE TABLE acjComparison(id INTEGER PRIMARY KEY, user_id VARCHAR(40), activity_id INTEGER, madeBy_id INTEGER, round INTEGER, left_id INTEGER, right_id INTEGER, leftWon INTEGER, rightWon INTEGER, allocated DATETIME, done DATETIME);";
                db.run(query);
            }
        });
    });
}

function dropTables(db){
    db.run("DROP TABLE acjResource");
    db.run("DROP TABLE acjSubmission");
    db.run("DROP TABLE acjComparison");
    db.run("DROP TABLE acjUser");
}

function addDummyAcjResources(db, n){
    let query = "INSERT INTO acjResource(created, round) VALUES (?,?)";
    let d = new Date()
    for(let i=0; i < n; i++){
        db.run(query, [d.toISOString(), 1], (err) => {
            if (err) return console.error(err.message);
        });
        d.setDate(d.getDate() + 1);
    }
}

function addDummyAcjSubmissions(db, n){
    let query = "INSERT INTO acjSubmission(activity_id, rank, latestScore) VALUES (?,?,?)";
    for(let i=0; i<n; i++){
        db.run(query, [2, 0, 0], (err) => {
            if (err) return console.error(err.message);
        });
    }
}

function getAcjSubmissions(db, activity_id){
    let query = `SELECT * FROM acjSubmission WHERE activity_id=${activity_id};`;
    return new Promise((resolve, reject) => {
        db.all(query,[], (err, rows) => {
            if (err) return console.error(err.message);
            if (rows.length != 0){
                resolve(rows);
            }
            else{
                reject("No submission found with the given parameters");
            }
        });
    })
    
}

function retrieveAcjComparison(db, id){
    let query = `SELECT * FROM acjComparison WHERE id=${id};`;
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            if (err) return console.error(err.message);
            if (rows.length != 0){
                resolve(rows[0]);
            }
        });
    });
}

function retrieveAcjComparisonMatching(db, field, val){
    let query = `SELECT * FROM acjComparison WHERE ${field}=${val};`;
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            if (err) return console.error(err.message);
            if (rows.length != 0){
                resolve(rows);
            }
            else{
                reject("No comparisons found with the given parameters");
            }
        });
    });
}

function updateSubmission(db, sub){
    let query = `UPDATE acjSubmission SET activity_id=?, rank=?, latestScore=? WHERE id=?`;
    db.run(query,[sub.activity_id, sub.rank, sub.latestScore, sub.id], (err) => {
        if (err) return console.error(err.message);
    });
}

function updateResource(db, resource){
    let query = `UPDATE acjResource SET created=?, round=? WHERE id=?`;
    db.run(query,[resource.created, resource.round, resource.id], (err) => {
        if (err) return console.error(err.message);
    });
}

function updateComparison(db, cmp){
    let query = `UPDATE acjComparison SET user_id=?, activity_id=?, madeBy_id=?, round=?, left_id=?, right_id=?, leftWon=?, rightWon=?, allocated=?, done=?;`;
    db.run(query,[cmp.user_id, cmp.activity_id, cmp.madeBy_id, cmp.round, cmp.leftId, cmp.rightId, cmp.leftWon, cmp.rightWon, cmp.allocated.toISOString(), cmp.done.toISOString()], (err) => {
        if (err) return console.error(err.message);
    })
}

function insertComparison(db, cmp){
    let query = `INSERT INTO acjComparison (user_id, activity_id, madeBy_id, round, left_id, right_id, leftWon, rightWon, allocated, done) VALUES (?,?,?,?,?,?,?,?,?);`;
    db.run(query, [cmp.user_id, cmp.activity_id, cmp.madeBy_id, cmp.round, cmp.leftId, cmp.rightId, cmp.leftWon, cmp.rightWon, cmp.allocated.toISOString(), cmp.done.toISOString()], (err) => {
        if(err) return console.error(err.message);
    })
} 

function getIncompleteComparisons(db, round, activity_id){
    let query = `SELECT * FROM acjComparison WHERE activity_id=${activity_id} AND round=${round} AND leftWon=0 AND rightWon=0;`;
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, cmps) => {
            if (err) return console.error(err.message);
            if(cmps){
                resolve(cmps)
            }
        })
    })
}

function getUsersIncompleteComparisons(db, round, uname, activity_id){
    let query = `SELECT * FROM acjComparison WHERE activity_id=${activity_id} AND round=${round} AND leftWon=0 AND rightWon=0 AND user_id=${uname};`;
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, cmps) => {
            if (err) return console.error(err.message);
            if(cmps){
                resolve(cmps)
            }
        })
    })
}

function getUnallocatedComparisons(db, round, activity_id){
    let query = `SELECT * FROM acjComparison WHERE activity_id=${activity_id} AND round=${round} AND user_id='';`;
    return new Promise((resolve, reject) => {
        db.all(query, [], (err,cmps) => {
            if (err) return console.error(err.message);
            if(cmps){
                resolve(cmps);
            }
        })
    })
}

function displayTable(db, tableName){
    let query = `SELECT * FROM ${tableName}`;
    db.all(query, [], (err, rows) => {
        if (err) return console.error(err.message);
        console.log(rows);
    }); 
}

function clearTable(db, tableName){
    let query = `DELETE FROM ${tableName}`
    db.run(query,[], (err) => {
        if (err) return console.error(err.message);
    })
}
//dropTables(db);
//initializeDatabase(db);
//addDummyAcjResources(db);
//displayTable(db, "acjComparison");
//clearTable(db, "acjResource");
//addDummyAcjSubmissions(db, 5);

// async function testingGetAcjSubmissions(db){
//     let x = await getAcjSubmissions(db, 1);
//     console.log(x);
// }

// testingGetAcjSubmissions(db);

//insertComparison(db, c);
//updateSubmission(db, x);

async function testing(db){
    await addDummyAcjSubmissions(db, 10);
    displayTable(db, "acjSubmission");

}
testing(db);
//export {initializeDatabase, addDummyAcjResources, addDummyAcjSubmissions, getAcjSubmissions, retrieveAcjComparisonMatching, updateSubmission, updateResource, insertComparison, getUsersIncompleteComparisons, updateComparison, getUnallocatedComparisons}