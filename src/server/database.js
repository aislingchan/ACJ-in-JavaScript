const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database("./acj.db", sqlite3.OPEN_READWRITE, (err) => {
//     if (err) return console.error(err.message);
// })
//move the above code to main file later

function initializeDatabase(db){
    return new Promise((resolve, reject) => {
        db.serialize(function () {
            console.log("creating tables...");
            let query = "CREATE TABLE IF NOT EXISTS acjResource(id INTEGER PRIMARY KEY, created DATETIME, round INTEGER, title VARCHAR(100), dueDate DATETIME, submissionInstrs TEXT, gradingInstrs TEXT, submissionType VARCHAR(50), maxRounds INTEGER);";
            db.run(query);
            query = "CREATE TABLE IF NOT EXISTS acjUser(id INTEGER PRIMARY KEY, username VARCHAR(255), role INTEGER);" //role=0 -> student, role=1 -> teacher
            db.run(query);
            query = "CREATE TABLE IF NOT EXISTS acjSubmission(id INTEGER PRIMARY KEY, activity_id INTEGER, rank INTEGER, latestScore FLOAT, user_id INTEGER, uploaded DATETIME, data BLOB, submissionType VARCHAR(50));";
            db.run(query);
            query = "CREATE TABLE IF NOT EXISTS acjComparison(id INTEGER PRIMARY KEY, user_id INTEGER, activity_id INTEGER, madeBy_id INTEGER, round INTEGER, left_id INTEGER, right_id INTEGER, leftWon INTEGER, rightWon INTEGER, allocated DATETIME, done DATETIME);";
            db.run(query);
            query = "CREATE TABLE IF NOT EXISTS acjEnrollment(id INTEGER PRIMARY KEY, username VARCHAR(255), activity_id INTEGER, canSubmit INTEGER, canJudge INTEGER);"
            db.run(query);
            query = "CREATE TABLE IF NOT EXISTS acjComment(id INTEGER PRIMARY KEY, user_id INTEGER, submission_id INTEGER, comment TEXT);"
            db.run(query);
            console.log("finished creating tables");
        });
        resolve(db);
    });
}

//DONE
function dropTables(db){
    db.run("DROP TABLE acjResource");
    db.run("DROP TABLE acjSubmission");
    db.run("DROP TABLE acjComparison");
    db.run("DROP TABLE acjUser");
    db.run("DROP TABLE acjEnrollment");
    db.run("DROP TABLE acjComment");
}

//TO BE TESTED
function addDummyAcjResources(db, n){
    return new Promise((resolve, reject) => {
        let query = "INSERT INTO acjResource(created, round, title, dueDate, submissionInstrs, gradingInstrs, submissionType, maxRounds) VALUES (?,?,?,?,?,?,?,?)";
        let d = new Date()
        for(let i=0; i < n; i++){
            console.log(`adding resource with date ${d.toISOString()}`);
            db.run(query, [d.toISOString(), 0, "sample-title", d.toISOString(), "sample submission instrs", "sample grading instrs", "sample filetype", 8], (err) => {
                if (err) return console.error(err.message);
            });
            d.setDate(d.getDate() + 1);
        }
        resolve(db);
    });
}

//TO BE TESTED
function addDummyAcjSubmissions(db, n){
    return new Promise((resolve, reject) => {
        let query = "INSERT INTO acjSubmission(activity_id, rank, latestScore, user_id, uploaded, data, submissionType) VALUES (?,?,?,?,?,?,?)";
        let d = new Date();
        for(let i=0; i<n; i++){
            console.log(`adding submission ${i}`);
            db.run(query, [1, 0, 0, i, d.toISOString(), null, "sample submission type"], (err) => {
                if (err) return console.error(err.message);
            });
        }
        resolve(db);
    });
}

//TO BE TESTED
function addDummyUsers(db, n){
    return new Promise((resolve, reject) => {
        let query = "INSERT INTO acjUser(username, role) VALUES (?,?)";
        for(let i=0; i<n; i++){
            console.log(`Adding user ${i}`);
            db.run(query, [Math.random().toString(36).slice(2), 0], (err) => {
                if (err) return console.error(err.message);
            });
        }
        resolve(db);
    });
}

//DONE
function getAcjSubmissions(db, activity_id){
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

function getNumAcjSubmissions(db, activity_id){
    let query = `SELECT * FROM acjSubmission WHERE activity_id=${activity_id};`;
    return new Promise((resolve, reject) => {
        db.all(query,[], (err, rows) => {
            if (err) return console.error(err.message);
            resolve(rows.length);
        });
    })
}

function getAcjSubmission(db, id){
    let query = `SELECT * FROM acjSubmission WHERE id=${id};`;
    return new Promise((resolve, reject) => {
        db.get(query,[], (err, sub) => {
            if (err) return console.error(err.message);
            if (sub){
                resolve(sub);
            }
            else{
                reject("No submission found with the given parameters");
            }
        });
    })
}

//DONE
function getAcjUser(db, id){
    let query = "SELECT * FROM acjUser WHERE id=?;";
    return new Promise((resolve, reject) => {
        db.get(query, [id], (err, row) => {
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

function getAcjUserFromUsername(db, username){
    let query = "SELECT * FROM acjUser WHERE username=?;";
    return new Promise((resolve, reject) => {
        db.get(query, [username], (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            if(row){
                resolve(row);
            }
            else{
                resolve(false);
            }
        });
    });
}

function getUserIdFromUsername(db, username){
    let query = "SELECT id FROM acjUser WHERE username=?;";
    return new Promise((resolve, reject) => {
        db.get(query, [username], (err, row) => {
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

//DONE
function getAcjResource(db, id){
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

function getAcjResourceFromTitle(db, title){
    let query = "SELECT * FROM acjResource WHERE title=?;";
    return new Promise((resolve, reject) => {
        db.get(query, [title], (err, row) => {
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

//DONE
function retrieveAcjComparison(db, id){
    let query = `SELECT * FROM acjComparison WHERE id=?;`;
    return new Promise((resolve, reject) => {
        db.all(query, [id], (err, rows) => {
            if (err) return console.error(err.message);
            if (rows.length != 0){
                // console.log("In retrieveAcjComparison");
                // console.log(rows);
                resolve(rows[0]);
            }
        });
    });
}

//DONE
function retrieveAcjComparisonMatching(db, field, val){
    let query = `SELECT * FROM acjComparison WHERE ${field}=?;`;
    return new Promise((resolve, reject) => {
        db.all(query, [val], (err, rows) => {
            if (err) return console.error(err.message);
            //console.log(`Rows retrieved: ${rows}`);
            resolve(rows);
        });
    });
}

//TO BE TESTED
function updateSubmission(db, sub){
    let query = `UPDATE acjSubmission SET activity_id=?, rank=?, latestScore=?, user_id=?, data=?, uploaded=?, submissionType=? WHERE id=?`;
    return new Promise((resolve, reject) => {
        db.run(query,[sub.activity_id, sub.rank, sub.latestScore, sub.user_id, sub.data, sub.uploaded, sub.submissionType, sub.id], (err) => {
            if (err) return console.error(err.message);
            resolve();
        });
    });
}

//TO BE TESTED
function updateResource(db, resource){
    let query = `UPDATE acjResource SET created=?, round=?, title=?, dueDate=?, submissionInstrs=?, gradingInstrs=?, submissionType=?, maxRounds=? WHERE id=?`;
    return new Promise((resolve, reject) => {
        db.run(query,[resource.created, resource.round, resource.title, resource.dueDate, resource.submissionInstrs, resource.gradingInstrs, resource.submissionType, resource.maxRounds, resource.id], (err) => {
            if (err) return console.error(err.message);
            resolve();
        });
    })
}

//TO BE TESTED
function updateComparison(db, cmp){
    let query = `UPDATE acjComparison SET user_id=?, activity_id=?, madeBy_id=?, round=?, left_id=?, right_id=?, leftWon=?, rightWon=?, allocated=?, done=? WHERE id=?;`;
    return new Promise((resolve, reject) => {
        db.run(query,[cmp.user_id, cmp.activity_id, cmp.madeBy_id, cmp.round, cmp.left_id, cmp.right_id, cmp.leftWon, cmp.rightWon, cmp.allocated, cmp.done, cmp.id], (err) => {
            if (err) return console.error(err.message);
            resolve();
        })
    })
    
}

//TO BE TESTED
function insertComparison(db, cmp){
    let query = `INSERT INTO acjComparison (user_id, activity_id, madeBy_id, round, left_id, right_id, leftWon, rightWon, allocated, done) VALUES (?,?,?,?,?,?,?,?,?,?);`;
    return new Promise((resolve, reject) => {
        db.run(query, [cmp.user_id, cmp.activity_id, cmp.madeBy_id, cmp.round, cmp.left_id, cmp.right_id, cmp.leftWon, cmp.rightWon, cmp.allocated, cmp.done], (err) => {
            if(err) return console.error(err.message);
            resolve();
        });
    })
} 

function insertUser(db, uname, role){
    let query = `INSERT INTO acjUser (username, role) VALUES (?,?);`;
    return new Promise((resolve, reject) => {
        db.run(query, [uname, role], (err) => {
            if(err) return console.error(err.message);
            resolve();
        });
    })
}

//TO BE TESTED
function insertResource(db, res){
    let query = `INSERT INTO acjResource (created, round, title, dueDate, submissionInstrs, gradingInstrs, submissionType, maxRounds) VALUES (?,?,?,?,?,?,?,?)`
    return new Promise((resolve, reject) => {
        db.run(query, [res.created.toISOString(), 0, res.title, res.dueDate.toISOString(), res.submissionInstrs, res.gradingInstrs, res.submissionType, res.maxRounds], (err) => {
            if (err) return console.error(err.message);
            resolve();
        })
    });
}

//insert submission
function insertSubmission(db, sub){
    const query = `INSERT INTO acjSubmission (activity_id, rank, latestScore, user_id, uploaded, data, submissionType) VALUES (?,?,?,?,?,?,?)`;
    let uploadDate = new Date();
    return new Promise((resolve, reject) => {
        db.run(query,[sub.actId, 0, 0, sub.userId, uploadDate.toISOString(), sub.data, sub.subType], (err) => {
            if (err) {
                console.log(err.message);
                reject();
            }
            resolve();
        })
    })
}

function insertComment(db, comment){
    const query = `INSERT INTO acjComment (user_id, submission_id, comment) VALUES (?,?,?)`;
    return new Promise((resolve, reject) => {
        db.run(query,[comment.user_id, comment.submission_id, comment.comment], (err) => {
            if (err) {
                console.log(err.message);
                reject();
            }
            resolve();
        })
    })
}

function deleteSubmission(db, user_id, activity_id){
    const query = "DELETE FROM acjSubmission WHERE user_id=? AND activity_id=?";
    return new Promise((resolve, reject) => {
        db.run(query,[user_id, activity_id], (err) => {
            if (err) {
                console.log(err.message);
                reject();
            }
            resolve();
        })
    });
}

//DONE
function getIncompleteComparisons(db, round, activity_id){
    let query = `SELECT * FROM acjComparison WHERE activity_id=? AND round=? AND leftWon=0 AND rightWon=0;`;
    return new Promise((resolve, reject) => {
        db.all(query, [activity_id, round], (err, cmps) => {
            if (err) return console.error(err.message);
            if(cmps){
                resolve(cmps)
            }
        })
    })
}

//TO BE TESTED
function getUsersIncompleteComparisons(db, round, user_id, activity_id){
    let query = `SELECT * FROM acjComparison WHERE activity_id=? AND round=? AND leftWon=0 AND rightWon=0 AND user_id=?;`;
    return new Promise((resolve, reject) => {
        db.all(query, [activity_id, round, user_id], (err, cmps) => {
            if (err) return console.error(err.message);
            if(cmps){
                resolve(cmps)
            }
        })
    })
}

//TO BE TESTED (uses user_id/username)
function getUnallocatedComparisons(db, round, activity_id){
    //let query = `SELECT * FROM acjComparison WHERE activity_id=? AND round=? AND user_id=?;`;
    let query = `SELECT * FROM acjComparison WHERE activity_id=? AND round=? AND user_id IS NULL;`;
    return new Promise((resolve, reject) => {
        db.all(query, [activity_id, round], (err,cmps) => {
            if (err) return console.error(err.message);
            if(cmps){
                resolve(cmps);
            }
        })
    })
}

function getAllResourcesForUser(db, username){
    let query = `SELECT acjResource.id, acjEnrollment.canSubmit, acjEnrollment.canJudge, acjResource.title, acjResource.dueDate, acjResource.submissionInstrs, acjResource.submissionType, acjResource.round, acjResource.maxRounds
                FROM acjEnrollment
                RIGHT JOIN acjResource
                ON acjEnrollment.activity_id = acjResource.id
                WHERE acjEnrollment.username=?;`
    return new Promise((resolve, reject) => {
        db.all(query, [username], (err,resources) => {
            if (err) return console.error(err.message);
            if(resources){
                resolve(resources);
            }
        })
    })
}

function enrollUser(db, username, activity_id, canSubmit, canJudge){
    const query = `INSERT INTO acjEnrollment (username, activity_id, canSubmit, canJudge) VALUES (?,?,?,?);`;
    return new Promise((resolve, reject) => {
        db.run(query,[username, activity_id, canSubmit, canJudge], (err) => {
            if (err) {
                console.log(err.message);
                reject();
            }
            resolve();
        })
    })
}

// find if a user is enrolled in an activity, returns true or false
function isEnrolled(db, username, activityId){
    let query = `SELECT *
                FROM acjEnrollment
                WHERE username=? AND activity_id=?;`
    return new Promise((resolve, reject) => {
        db.get(query, [username, activityId], (err,resource) => {
            if (err) return console.error(err.message);
            if(resource){
                resolve(true);
            }
            else{
                resolve(false);
            }
        })
    })
}

function updateEnrollmentPermissions(db, username, activityId, canSubmit, canJudge){
    let query = `UPDATE acjEnrollment SET canSubmit=?, canJudge=? WHERE username=? AND activity_id=?;`;
    return new Promise((resolve, reject) => {
        db.run(query,[canSubmit, canJudge, username, activityId], (err) => {
            if (err) {
                console.error(err.message);
                reject();
            }
            resolve();
        })
    })
}

function getCommentsForSubmission(db, sub_id){
    let query = `SELECT comment
                FROM acjComment
                WHERE submission_id=?;`
    return new Promise((resolve, reject) => {
        db.all(query, [sub_id], (err,comments) => {
            if (err) return console.error(err.message);
            if(comments){
                resolve(comments);
            }
        })
    })
}

function getUserSubmissionForResource(db, user_id, activity_id){
    let query = `SELECT * FROM acjSubmission WHERE user_id=? AND activity_id=?;`
    return new Promise((resolve, reject) => {
        db.get(query, [user_id, activity_id], (err, sub) => {
            if (err) {
                return console.error(err.message);
            }
            if (sub){
                resolve(sub);
            }
            else{
                resolve();
            }
        })
    })
}

function getNumComparisonsMadeByUser(db, user_id, activity_id){
    let query = `SELECT COUNT(id)
                FROM acjComparison
                WHERE madeBy_id=? and activity_id=?`
    return new Promise((resolve, reject) => {
        db.get(query, [user_id, activity_id], (err, count) => {
            if (err) return console.error(err.message);
            if(count){
                resolve(count);
            }
        })
    })
}

//DONE
function displayTable(db, tableName){
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

//DONE
function displayTables(db){
    return new Promise((resolve, reject) => {
        db.all("select name from sqlite_master where type='table'", async function (err, tables) {
            if (err) return console.error(err.message);
            console.log("displaying tables...");
            for(let t of tables){
                await displayTable(db, t.name);
            }
            resolve(db);
        });
    });
}

//DONE
function clearTable(db, tableName){
    let query = `DELETE FROM ${tableName}`
    return new Promise((resolve, reject) => {
        db.run(query,[], (err) => {
            if (err) return console.error(err.message);
            resolve();
        });
    });
}

//DONE
function clearTables(db){
    return new Promise((resolve, reject) => {
        db.all("select name from sqlite_master where type='table'", async function (err, tables) {
            if (err) return console.error(err.message);
            console.log("clearing tables...");
            for(let t of tables){
                console.log(`clearing ${t.name}`);
                await clearTable(db, t.name);
            }
            resolve(db);
        });
    }); 
}

function openDbConn(){
    const db = new sqlite3.Database("./acj.db", sqlite3.OPEN_READWRITE, (err) => {
        if (err) return console.error(err.message);
        console.log("Openning db connection");
    })
    return db;
}

function closeDbConn(db){
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Closed the db connection");
    })
}

async function testingStuff(){
    let db = openDbConn();
    //const sub = await getAcjSubmission(db, 2);
    //console.log(sub);
    //console.log(y);
    const u = await getAcjUser(db,)
    //await insertUser(db, "qwertyuiop", 1);
    //await displayTables(db);
    //await initializeDatabase(db);
    closeDbConn(db);
}

//testingStuff();

module.exports = {
    initializeDatabase,
    dropTables,
    addDummyAcjResources,
    addDummyAcjSubmissions,
    addDummyUsers,
    getAcjSubmissions,
    getAcjUser,
    getAcjResource,
    retrieveAcjComparison,
    retrieveAcjComparisonMatching,
    updateSubmission,
    updateResource,
    updateComparison,
    insertComparison,
    insertResource,
    insertUser,
    getIncompleteComparisons,
    getUsersIncompleteComparisons,
    getUnallocatedComparisons,
    displayTable,
    displayTables,
    clearTable,
    clearTables,
    openDbConn,
    closeDbConn,
    getAllResourcesForUser,
    getCommentsForSubmission,
    getUserSubmissionForResource,
    getNumComparisonsMadeByUser,
    getUserIdFromUsername,
    getAcjUserFromUsername,
    isEnrolled,
    insertSubmission,
    deleteSubmission,
    getAcjSubmission,
    insertComment,
    getNumAcjSubmissions,
    enrollUser,
    getAcjResourceFromTitle,
    updateEnrollmentPermissions
}