// const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database("./acj.db", sqlite3.OPEN_READWRITE, (err) => {
//     if (err) return console.error(err.message);
// })
//move the above code to main file later

export function initializeDatabase(db){
    return new Promise((resolve, reject) => {
        db.serialize(function () {
            console.log("creating tables...");
            let query = "CREATE TABLE IF NOT EXISTS acjResource(id INTEGER PRIMARY KEY, created DATETIME, round INTEGER);";
            db.run(query);
            query = "CREATE TABLE IF NOT EXISTS acjUser(id INTEGER PRIMARY KEY, userId VARCHAR(40));"
            db.run(query);
            query = "CREATE TABLE IF NOT EXISTS acjSubmission(id INTEGER PRIMARY KEY, activity_id INTEGER, rank INTEGER, latestScore FLOAT);";
            db.run(query);
            query = "CREATE TABLE IF NOT EXISTS acjComparison(id INTEGER PRIMARY KEY, user_id VARCHAR(40), activity_id INTEGER, madeBy_id INTEGER, round INTEGER, left_id INTEGER, right_id INTEGER, leftWon INTEGER, rightWon INTEGER, allocated DATETIME, done DATETIME);";
            db.run(query);
        });
        resolve(db);
    });
}

export function dropTables(db){
    db.run("DROP TABLE acjResource");
    db.run("DROP TABLE acjSubmission");
    db.run("DROP TABLE acjComparison");
    db.run("DROP TABLE acjUser");
}

export function addDummyAcjResources(db, n){
    return new Promise((resolve, reject) => {
        let query = "INSERT INTO acjResource(created, round) VALUES (?,?)";
        let d = new Date()
        for(let i=0; i < n; i++){
            console.log(`adding resource with date ${d.toISOString()}`);
            db.run(query, [d.toISOString(), 0], (err) => {
                if (err) return console.error(err.message);
            });
            d.setDate(d.getDate() + 1);
        }
        resolve(db);
    });
}

export function addDummyAcjSubmissions(db, n){
    return new Promise((resolve, reject) => {
        let query = "INSERT INTO acjSubmission(activity_id, rank, latestScore) VALUES (?,?,?)";
        for(let i=0; i<n; i++){
            console.log(`adding submission ${i}`);
            db.run(query, [1, 0, 0], (err) => {
                if (err) return console.error(err.message);
            });
        }
        resolve(db);
    });
}

export function addDummyUsers(db, n){
    return new Promise((resolve, reject) => {
        let query = "INSERT INTO acjUser(userId) VALUES (?)";
        for(let i=0; i<n; i++){
            console.log(`Adding user ${i}`);
            db.run(query, [Math.random().toString(36).slice(2)], (err) => {
                if (err) return console.error(err.message);
            });
        }
        resolve(db);
    });
}

export function getAcjSubmissions(db, activity_id){
    let query = `SELECT * FROM acjSubmission WHERE activity_id=${activity_id};`;
    return new Promise((resolve, reject) => {
        db.all(query,[], (err, rows) => {
            if (err) return console.error(err.message);
            if (rows.length != 0){
                const subs = {};
                for(let r of rows){
                    subs[r.id] = r;
                }
                resolve(subs);
            }
            else{
                reject("No submission found with the given parameters");
            }
        });
    })
}

export function getAcjUser(db, userId){
    let query = "SELECT * FROM acjUser WHERE userId=?;";
    return new Promise((resolve, reject) => {
        db.get(query, [userId], (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            if(row){
                resolve(row);
            }
            else{
                reject(false);
            }
        });
    });
}

export function getAcjResource(db, id){
    let query = "SELECT * FROM acjResource WHERE id=?;";
    return new Promise((resolve, reject) => {
        db.get(query, [id], (err, row) => {
            if (err){
                return console.error(err.message);
            }
            if(row){
                resolve(row);
            }
            else{
                reject(false);
            }
        });
    });
}

export function retrieveAcjComparison(db, id){
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

export function retrieveAcjComparisonMatching(db, field, val){
    let query = `SELECT * FROM acjComparison WHERE ${field}=?;`;
    return new Promise((resolve, reject) => {
        db.all(query, [val], (err, rows) => {
            if (err) return console.error(err.message);
            console.log(`Rows retrieved: ${rows}`);
            resolve(rows);
        });
    });
}

export function updateSubmission(db, sub){
    let query = `UPDATE acjSubmission SET activity_id=?, rank=?, latestScore=? WHERE id=?`;
    db.run(query,[sub.activity_id, sub.rank, sub.latestScore, sub.id], (err) => {
        if (err) return console.error(err.message);
    });
}

export function updateResource(db, resource){
    let query = `UPDATE acjResource SET created=?, round=? WHERE id=?`;
    db.run(query,[resource.created, resource.round, resource.id], (err) => {
        if (err) return console.error(err.message);
    });
}

export function updateComparison(db, cmp){
    let query = `UPDATE acjComparison SET user_id=?, activity_id=?, madeBy_id=?, round=?, left_id=?, right_id=?, leftWon=?, rightWon=?, allocated=?, done=?;`;
    db.run(query,[cmp.user_id, cmp.activity_id, cmp.madeBy_id, cmp.round, cmp.leftId, cmp.rightId, cmp.leftWon, cmp.rightWon, cmp.allocated, cmp.done], (err) => {
        if (err) return console.error(err.message);
    })
}

export function insertComparison(db, cmp){
    let query = `INSERT INTO acjComparison (user_id, activity_id, madeBy_id, round, left_id, right_id, leftWon, rightWon, allocated, done) VALUES (?,?,?,?,?,?,?,?,?,?);`;
    db.run(query, [cmp.user_id, cmp.activity_id, cmp.madeBy_id, cmp.round, cmp.leftId, cmp.rightId, cmp.leftWon, cmp.rightWon, cmp.allocated, cmp.done], (err) => {
        if(err) return console.error(err.message);
    })
} 

export function getIncompleteComparisons(db, round, activity_id){
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

export function getUsersIncompleteComparisons(db, round, uname, activity_id){
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

export function getUnallocatedComparisons(db, round, activity_id){
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

export function displayTable(db, tableName){
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM ${tableName}`;
        db.all(query, [], (err, rows) => {
            if (err) return console.error(err.message);
            console.log(tableName);
            console.log(rows);
            resolve(db);
        });
    });
     
}

export function displayTables(db){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all("select name from sqlite_master where type='table'", function (err, tables) {
                if (err) return console.error(err.message);
                console.log("displaying tables...");
                for(let t of tables){
                    displayTable(db, t.name);
                }
                resolve(db);
            });
        });
    });
    
    
}

export function clearTable(db, tableName){
    let query = `DELETE FROM ${tableName}`
    db.run(query,[], (err) => {
        if (err) return console.error(err.message);
    })
}

export function clearTables(db){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all("select name from sqlite_master where type='table'", function (err, tables) {
                if (err) return console.error(err.message);
                console.log("clearing tables...");
                for(let t of tables){
                    console.log(`clearing ${t.name}`);
                    clearTable(db, t.name);
                }
                resolve(db);
            });
        })
    });
    
    
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
//testing(db);
