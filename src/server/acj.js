import * as database from './database.js';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./acj.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
})

class Acj {
    constructor(){
        this.papers = {}; //collection of submissions ids and submissions
    }

    // recalculates the score for each paper based on its previous comparisons
    recalc1(round){
        this.updateRanks();
        for(const [n, pp] of this.papers.entries()){
            let sc = 0;
            let cmprank;
            if(pp.comparisons.length){
                for(let cmp in pp.comparisons){
                    if(round <= 4){
                        cmprank = this.papers[cmp[withID]].rank;
                        if(cmp[won]){
                            sc += 1;
                        }
                        else{
                            sc -= 1;
                        }
                    }
                    else if(round <= 8){
                        cmprank = this.papers[cmp[withID]].rank;
                        if(cmp[won]){
                            sc += cmprank;
                        }
                        else{
                            sc -= (this.papers.length - cmprank);
                        }
                    }
                    else{
                        cmprank = this.papers[cmp[withID]].rank;
                        let thisrank = pp.rank;
                        let rmsRankDiff = Math.sqrt((cmprank-thisrank)*(cmprank-thisrank));
                        if(cmp[won]){
                            sc += thisrank + thisrank/rmnRankDiff;
                        }
                        else{
                            sc += thisrank - thisrank/rmsRankDiff;
                        }
                    }
                }
                sc = sc / pp.comparisons.length;
            }
            pp.addScore(round, sc);
        }
    }

    updateRanks(){
        let rankList = [];
        for(let p in this.papers){
            rankList.push({
                id: p.id,
                score: p.latestScore()
            });
        }
        rankList.sort(cmp2);
        for(let n = 0; n < rankList.length; n++){
            this.papers[rankList[n][id]].rank = n;
        }
    }

    getPairingsByRank(){
        this.updateRanks();
        let targetsList = [];
        let toPairList = [];
        let pairedList = {};
        let pairedCount = 0;

        for(let p in this.papers){
            //Calculate a score for each paper based on its past comparisons
            let cws = 0;
            if(p.comparisons.length > 0){
                let n = 0;
                let rank = p.rank;
                let scci = 0;
                for(let c in p.comparisons){
                    n++;
                    let compRank = this.papers[c[withID]].rank;
                    scci += ((rank - compRank) / (1 + Math.sqrt((rank-compRank)*(rank-compRank))));
                }
                cws = rank + scci;
            }

            targetsList.push({
                id: p.id,
                score: cws,
                rank: p.rank,
                targetRank: parseInt(floor(cws+0.5)),
                paired: false
            });
            toPairList.push({
                id: p.id,
                score: p.rank,
                targetRank: parseInt(floor(cws+0.5)),
                paired: false
            });
            pairedList[p.id] = false;
        }
        targetsList.sort(cmp2);//sorting by score
        toPairList.sort(cmp2);//sorting by score
        const s = toPairList.length;
        let pairings = [];
        let nextID = nextAlternating(false, s);
        while(nextID !== false){
            let pl = toPairList[nextID];
            //pair the paper if it is unpaired
            if(pairedList[pl[id]] === false){
                pairedList[pl[id]] = true;
                let suggestID = nextOffsetAlternating(false, pl[targetRank], s);
                while((suggestID !== false) && ((pairedList[targetsList[suggestID][id]]) || (targetsList[suggestID][id]==pl[id]) || (this.papers[pl[id]].countComparisons(targetsList[suggestID][id])))){
                    suggestID = nextOffsetAlternating(suggestID, pl[targetsRank], s);
                }
                if(suggestID === false){
                    suggestID = nextOffsetAlternating(false, pl[targetRank], s);
                    while((suggestID !== false) && (targetsList[suggestID][id]==pl[id])){
                        suggestID = nextOffsetAlternating(suggestID, pl[targetRank], s);
                    }
                }
                if(suggestID !== false){
                    pairedList[targetsList[suggestID][id]] = true;
                    pairings.push([pl[id], targetsList[suggestID][id]]);
                }
            }
            nextID = nextAlternating(nextID, s);
        }
        return pairings;
    }
}

class Submission {
    constructor(id){
        this.id = id;
        this.perfectScore = null;
        this.comparisons = [];
        this.acjScores = {};
        this.rank = 0;
        this._latestScore = 0;
    }

    addComparison(withID, won, round){
        this.comparisons.push({ 
            withID: withID,
            won: won,
            round: round
        });
    }

    countComparisons(withID){
        let count = 0;
        for(let c in this.comparisons){
            if(c.withID === withID){
                count++;
            }
        }
        return count;
    }

    addScore(round, score){
        this.acjScores[round] = score;
        this._latestScore = score;
    }

    latestScore(){
        return this._latestScore;
    }
}

//Compares two submissions based on latest score
function cmp(a, b){
    if(a.latestScore() == b.latestScore()){
        return 0;
    }
    return (a.latestScore() < b.latestScore()) ? -1 : 1;
}

//Compares two submissions based on score
function cmp2(a, b){
    if(a[score] == b[score]){
        return 0;
    }
    return (a[score] < b[score]) ? -1 : 1;
}

//param after: index of a list or false
//param count: size of a list
//returns an index of the list or false
//if after is false, returns middle index of the list
//if after is an index in the first half of the list then it calculates and returns an index in the second half 
//of the list, unless the calculated index in not within range (in that case it returns false)
function nextAlternating(after, count){
    let next; // index of the list that will be return
    const start = parseInt(floor((count / 2) - 0.5)); //middle index of the list
    if(after === false){
        next = start;
    }
    else{
        let diff = start - after;
        if(diff >= 0){
            next = start + diff + 1;
        }
        else{
            next = start + diff;
        }
    }
    return ((next >= 0)&&(next < count)) ? next : false;
}

//like nextAlternating but instead of pivoting around the middle index,
//the function pivots around a given index (begin)
function nextOffsetAlternating(after, begin, count){
    let start = begin;
    let next;
    if(start < 0){
        start = 0;
    }
    if(start >= count){
        start = count-1;
    }
    if(after === false){
        next = start;
    }    
    else{
        let diff = start - after;
        if(diff >= 0){
            next = start + diff + 1;
        }
        else{
            next = start + diff;
        }
    }
    if(next < 0){
        next = 2 * start - next + 1;
    }
    else if(next >= count){
        next = 2 * start - next;
    }
    if((next >= 0) && (next < count)){
        return next;
    }
    else{
        return false;
    }

}

async function prepareNewAcjRound(db, resource){
    const engine = new Acj();
    let subs = await database.getAcjSubmissions(db, 2);
    for(let sub in subs){
        let acjPaper = new Submission(sub.id);
        acjPaper._latestScore = sub.latestScore;
        acjPaper.rank = sub.rank;
        let lcmps = await database.retrieveAcjComparisonMatching(db,'left_id', sub.id);
        if(lcmps){
            for(let cmp in lcmps){
                if(cmp.done > 0){
                    acjPaper.addComparison(cmp.rightId, cmp.leftWon, cmp.round);
                }
            }
        }
        let rcmps = await database.retrieveAcjComparisonMatching(db, 'right_id', sub.id);
        if(rcmps){
            for(let cmp in rcmps){
                if(cmp.done > 0){
                    acjPaper.addComparison(cmp.leftId, cmp.rightWon, cmp.round);
                }
            }
        }
        engine.papers[sub.id] = acjPaper;
    }
    if(resource.round >= 0){
        engine.recalc1(resource.round);
        for(let p in engine.papers){
            subs[p.id].latestScore = p._latestScore;
            subs[p.id].rank = p.rank;
            database.updateSubmission(db, subs[p.id]);
        }
    }
    const pairings = engine.getPairingsByRank();
    resource.round += 1;
    database.updateResource(db,resource);
    for(let p in pairings){
        let cmpr = new acjComparison();
        cmpr.activity_id = resource.id;
        cmpr.leftId = p[0];
        cmpr.rightId = p[1];
        cmpr.allocated = 0;
        cmpr.done = 0;
        cmpr.round = resource.round;
        database.insertComparison(db, cmpr);
    }
}

function getAComparison(resource, round, uname, avoid, db){
    let takeComp;
    let dueComps = database.getUsersIncompleteComparisons(db, round, uname, resource.id);
    if(dueComps.length > 0){
        takeComp = dueComps[0];
        takeComp.allocated = new Date();
        database.updateComparison(db, takeComp);
    }
    else{
        takeComp = false;
        dueComps = database.getUnallocatedComparisons(db, round, resource.id);
        if(dueComps.length == 0){
            clearOverdueComps(resource, db);
            dueComps = database.getUnallocatedComparisons(db, round, resource.id);
            let n = 0;
            while((takeComp == false) && (n < dueComps.length)){
                if(avoid.indexOf(dueComps[n].id) == -1){
                    takeComp = dueComps[n];
                    takeComp.allocated = new Date();
                    takeComp.user_id = uname;
                    database.updateComparison(db,takeComp);
                }
                n++;
            }

        }
        return takeComp;
    }
}

function clearOverdueComps(resource, timelimit = 600, db){
    let dueComps = database.getIncompleteComparisons(db, resource.round);
    const pretime = new Date() - timelimit;
    for(let d in dueComps){
        if((d.allocated < pretime) && (d.allocated > 0)){
            d.allocated = 0;
            d.user_id = '';
            database.updateComparison(db, d);
        }
    }
}

// TODO get marker's decision and updates comparison in database
//  (basic version, must chose either left or right)
function checkInput(activity, userInfo, cmpId, leftWon, db){
    let cmp = database.retrieveAcjComparison(db, cmpId);
    if(leftWon){
        cmp.leftWon = true;
        cmp.done = new Date();
        cmp.madeBy_id = userInfo.user.id;
    }
    else{
        cmp.rightWon = true;
        cmp.done = new Date();
        cmp.madeBy_id = userInfo.user.id;
    }
    database.updateComparison(db, cmp);
}

class acjComparison{
    constructor(){
        this.id = null;
        this.user_id = null;
        this.activity_id = null;
        this.madeBy_id = null;
        this.round = 0;
        this.leftId = null;
        this.rightId = null;
        this.leftWon = false;
        this.rightWon = false;
        this.allocated = new Date();
        this.done = new Date();
    }
}

