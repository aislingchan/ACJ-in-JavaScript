let express = require('express');
let router = express.Router();
let sim = require('../main');
const acjDB = require('../database');
const e = require('express');
const acj = require('../acj');

router.get('/', function (req, res, next) {
    console.log(req.session);
    res.render('index', {
        isAuthenticated: req.session.isAuthenticated,
        isTeacher: req.session.isTeacher,
        username: req.session.account?.username,
    });
});

router.get('/activity', function (req, res, next) {
    res.render('activity', {
        isAuthenticated: req.session.isAuthenticated,
        isTeacher: req.session.isTeacher
    });
});

router.post('/activity', async function(req, res, next) {
    //create resource json obj
    const dateObj = new Date(req.body.dueDate)
    const newResource = {
        created: new Date(),
        title: req.body.title,
        dueDate: dateObj,
        submissionInstrs: req.body.submissionInstrs,
        gradingInstrs: req.body.gradingInstrs,
        submissionType: req.body.submissionType,
        maxRounds: req.body.maxRounds
    };
    //add the resource to db
    try{
        const db = acjDB.openDbConn();
        await acjDB.insertResource(db, newResource);
        // get id of newly created resource
        const resIdObj = await acjDB.getAcjResourceFromTitle(db, req.body.title);
        //enroll students and markers
        const studentsArray = req.files.students.data.toString().split(",");
        const markersArray = req.files.markers.data.toString().split(",");
        for (let s of studentsArray){
            const stuName = s.trim();
            await acjDB.enrollUser(db, stuName, resIdObj.id, 1, 0);
        }
        for (let m of markersArray){
            const markerName = m.trim();
            const isPresent = await acjDB.isEnrolled(db, markerName, resIdObj.id);
            if(isPresent){
                //if the user was already enrolled (when enrolling students), just update their marking permissions
                await acjDB.updateEnrollmentPermissions(db, markerName, resIdObj.id, 1, 1);
            }
            else{
                await acjDB.enrollUser(db, markerName, resIdObj.id, 0, 1);
            }
        }
        acjDB.closeDbConn(db);
        res.render('activity', {
            isAuthenticated: req.session.isAuthenticated,
            isTeacher: req.session.isTeacher,
            isSuccess: true
        })
    }
    catch(err){
        console.log(err);
        res.render('activity',{
            isAuthenticated: req.session.isAuthenticated,
            isTeacher: req.session.isTeacher,
            isFail: true
        })
    }
})

router.get('/submission/:activityId', async function (req, res, next) {
    try{
        const db = acjDB.openDbConn();
        let enrolled = await acjDB.isEnrolled(db,req.session.account?.username, req.params.activityId);
        if (!enrolled){
            throw "Not enrolled";
        }
        let resource = await acjDB.getAcjResource(db, req.params.activityId);
        const userIdObj = await acjDB.getUserIdFromUsername(db,req.session.account?.username);
        const sub = await acjDB.getUserSubmissionForResource(db, userIdObj.id, resource.id);
        if (sub) {
            resource.isSubmitted = true;
            resource.code = sub.data.toString();
        }
        else{
            resource.isSubmitted = false;
        }
        resource.isAuthenticated = req.session.isAuthenticated;
        resource.isTeacher = req.session.isTeacher;
        acjDB.closeDbConn(db);
        res.render('submission', resource);
    }
    catch(err){
        console.log(err);
        res.render('submission', {
            isAuthenticated: req.session.isAuthenticated,
            isTeacher: req.session.isTeacher
        });
    }    
});

router.post('/submission/:activityId', async function(req, res, next) {
    const {data, mimetype} = req.files.filedata;
    let sub = {
        data: data,
        subType: mimetype,
        actId: req.params.activityId
    }
    try{
        const db = acjDB.openDbConn();
        const userIdObj = await acjDB.getUserIdFromUsername(db,req.session.account?.username);
        sub.userId = userIdObj.id;
        await acjDB.insertSubmission(db, sub);
        acjDB.closeDbConn(db);
        res.redirect(`/status`);
    }
    catch{
        res.send("error occurred. File not uploaded");
    }
});

router.post('/submission/delete/:activityId', async function(req, res, next) {
    try{
        const db = acjDB.openDbConn();
        const userIdObj = await acjDB.getUserIdFromUsername(db,req.session.account?.username);
        await acjDB.deleteSubmission(db, userIdObj.id, req.params.activityId);
        acjDB.closeDbConn(db);
        res.redirect(`/status`);
    }
    catch{
        res.send("error occurred");
    }
});

router.get('/judging/:activity_id', async function (req, res, next) {
    try{
        const db = acjDB.openDbConn();
        const userIdObj = await acjDB.getUserIdFromUsername(db,req.session.account?.username);
        const resource = await acjDB.getAcjResource(db, req.params.activity_id);
        // get incomplete comparisons
        let dueComps = await acjDB.getIncompleteComparisons(db, resource.round, req.params.activity_id);
        // if there are no incomplete comparisons and there are rounds left to be done
        if(dueComps.length == 0 && (resource.round <= resource.maxRounds)){
            await acj.prepareNewAcjRound(db, resource);
        }
        //check incompComparisons again
        dueComps = await acjDB.getIncompleteComparisons(db, resource.round, req.params.activity_id);
        if(dueComps.length > 0){
            const cmp = await acj.getAComparison(resource, resource.round, userIdObj.id, [], db);
            //console.log(cmp);
            const leftSub = await acjDB.getAcjSubmission(db, cmp.left_id);
            const rightSub = await acjDB.getAcjSubmission(db, cmp.right_id);
            //console.log(`left_id: ${cmp.left_id}. right_id: ${cmp.right_id}`);
            acjDB.closeDbConn(db);
            res.render('judging', {
                isAuthenticated: req.session.isAuthenticated,
                isTeacher: req.session.isTeacher,
                courseTitle: resource.title,
                leftCode: leftSub.data.toString(),
                rightCode: rightSub.data.toString(),
                leftId: cmp.left_id,
                rightId: cmp.right_id,
                id: req.params.activity_id,
                cmpId: cmp.id,
                gradingInstrs: resource.gradingInstrs
            });
        }
        else{
            //show final ranking
            let subs = await acjDB.getAcjSubmissions(db, req.params.activity_id);
            let ranking = []
            for(subId in subs){
                const userData = await acjDB.getAcjUser(db, subs[subId].user_id);
                //console.log(username);
                const rankingEntry = {
                    rank: subs[subId].rank,
                    username: userData.username,
                    latestScore: subs[subId].latestScore,
                    subId: subId
                }
                ranking.push(rankingEntry);
            }
            ranking.sort(acj.cmp3).reverse();
            acjDB.closeDbConn(db);
            res.render('ranking', {
                isAuthenticated: req.session.isAuthenticated,
                isTeacher: req.session.isTeacher,
                subs: ranking,
                courseTitle: resource.title
            });
        }
    }
    catch(err){
        console.log(err);
        res.send("Error occurred");
    }
});

router.post('/judging/:activity_id/:decision', async function(req, res, next) {
    try{
        // store comments if any
        const db = acjDB.openDbConn();
        const userIdObj = await acjDB.getUserIdFromUsername(db,req.session.account?.username);
        if (req.body.leftComments != false){
            let leftComment = {
                user_id: userIdObj.id,
                submission_id: req.body.leftId,
                comment: req.body.leftComments
            }
            await acjDB.insertComment(db, leftComment);
        }
        if (req.body.rightComments != false){
            let rightComment = {
                user_id: userIdObj.id,
                submission_id: req.body.rightId,
                comment: req.body.rightComments
            }
            await acjDB.insertComment(db, rightComment);
        }
        // process judgement (checkInput()). left => decision=0, right => decision=1
        const leftWon = req.params.decision == 0;
        await acj.checkInput(userIdObj.id, req.body.cmpId, leftWon, db);
        acjDB.closeDbConn(db);
        // redirect
        res.redirect(`/judging/${req.params.activity_id}`);
    }
    catch(err){
        console.log(err.message);
        res.send("error occurred");
    }
});

router.get('/submitted_work/:sub_id', async function (req, res, next) {
    try{
        console.log("IN GET ROUTE");
        console.log(req.params.sub_id);
        const db = acjDB.openDbConn();
        let subData = await acjDB.getAcjSubmission(db, req.params.sub_id);
        let userData = await acjDB.getAcjUser(db, subData.user_id);
        acjDB.closeDbConn(db);
        res.render('submitted_work', {
            isAuthenticated: req.session.isAuthenticated,
            isTeacher: req.session.isTeacher,
            rank: subData.rank,
            code: subData.data,
            username: userData.username
        })
    }
    catch(err){
        console.log(err.message);
        res.render('error', {
            isAuthenticated: req.session.isAuthenticated,
            isTeacher: req.session.isTeacher
        });
    }
});

router.get('/status', async function (req, res, next) {
    let activities = [];
    try{
        const db = acjDB.openDbConn();
        let resources = await acjDB.getAllResourcesForUser(db, req.session.account?.username);
        const userIdObj = await acjDB.getUserIdFromUsername(db, req.session.account?.username);
        for (let r of resources){
            let activityObj = {
                title: r.title,
                deadline: (new Date(r.dueDate)).toString(),
                activityId: r.id
            }
            const curTime = new Date().getTime();
            const dueTime = new Date(r.dueDate).getTime();
            if(curTime < dueTime){
                activityObj.beforeDeadline = true;
            }
            if(r.canSubmit === 1){
                activityObj.isSubmitter = true;
                //find if user submitted
                let sub = await acjDB.getUserSubmissionForResource(db, userIdObj.id, r.id);
                if (sub) {
                    activityObj.isSubmitted = true;
                    //find if marking has finished
                    if (r.round > r.maxRounds){
                        activityObj.ranking = sub.rank;
                        const numSubs = await acjDB.getNumAcjSubmissions(db, r.id);
                        activityObj.totalSubs = numSubs;
                        const comments = await acjDB.getCommentsForSubmission(db, sub.id);
                        activityObj.comments = comments;
                    }
                }
            }
            if(r.canJudge === 1){
                //find num of comparisons done
                const numComps = await acjDB.getNumComparisonsMadeByUser(db, userIdObj.id, r.id);
                activityObj.numJudgementsMade = numComps['COUNT(id)'];
                activityObj.isAssessor = true;
                //check if judging has ended
                if (r.round <= r.maxRounds){
                    activityObj.stillJudging = true;
                }
            }
            activities.push(activityObj);
        }
        acjDB.closeDbConn(db);
        res.render('status', {
            isAuthenticated: req.session.isAuthenticated,
            isTeacher: req.session.isTeacher,
            activity: activities
        })
    }
    catch(err){
        console.log(err);
        res.render('status', {
            isAuthenticated: req.session.isAuthenticated,
            isTeacher: req.session.isTeacher
        });
    }
});

module.exports = router;