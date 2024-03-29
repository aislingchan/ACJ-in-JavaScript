const database = require('./database');
const rankingLogger = require('./rankingLogger');
const resultsLogger = require('./resultsLogger');

class Acj {
    constructor(){
        this.papers = {}; //collection of submissions ids and submissions
    }

    // recalculates the score for each paper based on its previous comparisons
    recalc1(round){
        this.updateRanks();
        for(let pID in this.papers){
            let sc = 0;
            let cmprank;
            if(this.papers[pID].comparisons.length){
                for(let cmp of this.papers[pID].comparisons){
                    if(round <= 4){
                        cmprank = this.papers[cmp.withID].rank;
                        if(cmp.won){
                            sc += 1;
                        }
                        else{
                            sc -= 1;
                        }
                    }
                    else if(round <= 8){
                        cmprank = this.papers[cmp.withID].rank;
                        if(cmp.won){
                            sc += cmprank;
                        }
                        else{
                            sc -= (Object.keys(this.papers).length - cmprank);
                        }
                    }
                    else{
                        cmprank = this.papers[cmp.withID].rank;
                        let thisrank = this.papers[pID].rank;
                        let rmsRankDiff = Math.sqrt((cmprank-thisrank)*(cmprank-thisrank));
                        if(cmp.won){
                            sc += thisrank + thisrank/rmsRankDiff;
                        }
                        else{
                            sc += thisrank - thisrank/rmsRankDiff;
                        }
                    }
                }
                sc = sc / this.papers[pID].comparisons.length;
            }
            this.papers[pID].addScore(round, sc);
        }
    }

    updateRanks(){
        let rankList = [];
        for(let paperID in this.papers){
            rankList.push({
                id: paperID,
                score: this.papers[paperID].latestScore()
            });
        }
        rankList.sort(cmp2);
        for(let n = 0; n < rankList.length; n++){
            this.papers[rankList[n].id].rank = n;
        }
    }

    getPairingsByRank(){
        this.updateRanks();
        let targetsList = [];
        let toPairList = [];
        let pairedList = {};

        for(let pID in this.papers){
            //Calculate a score for each paper based on its past comparisons
            let cws = 0;
            if(this.papers[pID].comparisons.length > 0){
                let n = 0;
                let rank = this.papers[pID].rank;
                let scci = 0;
                for(let c of this.papers[pID].comparisons){
                    n++;
                    let compRank = this.papers[c.withID].rank;
                    scci += ((rank - compRank) / (1 + Math.sqrt((rank-compRank)*(rank-compRank))));
                }
                cws = rank + scci;
            }

            targetsList.push({
                id: pID,
                score: cws,
                rank: this.papers[pID].rank,
                targetRank: parseInt(Math.floor(cws+0.5)),
                paired: false
            });
            toPairList.push({
                id: pID,
                score: this.papers[pID].rank,
                targetRank: parseInt(Math.floor(cws+0.5)),
                paired: false
            });
            pairedList[pID] = false;
        }
        targetsList.sort(cmp2);//sorting by score
        toPairList.sort(cmp2);//sorting by score
        const s = toPairList.length;
        let pairings = [];
        let nextID = nextAlternating(false, s);
        while(nextID !== false){
            let pl = toPairList[nextID];
            //pair the paper if it is unpaired
            if(pairedList[pl.id] === false){
                pairedList[pl.id] = true;
                let suggestID = nextOffsetAlternating(false, pl.targetRank, s);
                while((suggestID !== false) && ((pairedList[targetsList[suggestID].id]) || (targetsList[suggestID].id==pl.id) || (this.papers[pl.id].countComparisons(targetsList[suggestID].id)))){
                    suggestID = nextOffsetAlternating(suggestID, pl.targetRank, s);
                }
                if(suggestID === false){
                    suggestID = nextOffsetAlternating(false, pl.targetRank, s);
                    while((suggestID !== false) && (targetsList[suggestID].id==pl.id)){
                        suggestID = nextOffsetAlternating(suggestID, pl.targetRank, s);
                    }
                }
                if(suggestID !== false){
                    pairedList[targetsList[suggestID].id] = true;
                    pairings.push([pl.id, targetsList[suggestID].id]);
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
    if(a.score == b.score){
        return 0;
    }
    return (a.score < b.score) ? -1 : 1;
}

//Compares two submissions based on rank
function cmp3(a,b){
    if(a.rank == b.rank){
        return 0
    }
    return (a.rank < b.rank) ? -1 : 1;
}

//param after: index of a list or false
//param count: size of a list
//returns an index of the list or false
//if after is false, returns middle index of the list
//if after is an index in the first half of the list then it calculates and returns an index in the second half 
//of the list, unless the calculated index in not within range (in that case it returns false)
function nextAlternating(after, count){
    let next; // index of the list that will be return
    const start = parseInt(Math.floor((count / 2) - 0.5)); //middle index of the list
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
    let subs = await database.getAcjSubmissions(db, resource.id);
    for(let subID in subs){
        let acjPaper = new Submission(subID);
        acjPaper._latestScore = subs[subID].latestScore;
        acjPaper.rank = subs[subID].rank;
        let lcmps = await database.retrieveAcjComparisonMatching(db,'left_id', subID);
        if(lcmps.length > 0){
            for(let cmp of lcmps){
                if(cmp.done != 0){
                    acjPaper.addComparison(cmp.right_id, cmp.leftWon, cmp.round);
                }
            }
        }
        let rcmps = await database.retrieveAcjComparisonMatching(db, 'right_id', subID);
        if(rcmps){
            for(let cmp of rcmps){
                if(cmp.done != 0){
                    acjPaper.addComparison(cmp.left_id, cmp.rightWon, cmp.round);
                }
            }
        }
        engine.papers[subID] = acjPaper;
    }
    if(resource.round >= 0){
        engine.recalc1(resource.round);
        for(let pID in engine.papers){
            subs[pID].latestScore = engine.papers[pID]._latestScore;
            subs[pID].rank = engine.papers[pID].rank;
            await database.updateSubmission(db, subs[pID]);
        }
    }
    const pairings = engine.getPairingsByRank();
    resource.round += 1;
    await database.updateResource(db,resource);
    //await logSubmissionData(db, resource);
    for(let p of pairings){
        let cmpr = new acjComparison();
        cmpr.activity_id = resource.id;
        cmpr.left_id = p[0];
        cmpr.right_id = p[1];
        cmpr.allocated = 0;
        cmpr.done = 0;
        cmpr.round = resource.round;
        await database.insertComparison(db, cmpr);
    }
}

async function getAComparison(resource, round, user_id, avoid, db){
    let takeComp;
    let dueComps = await database.getUsersIncompleteComparisons(db, round, user_id, resource.id);
    if(dueComps.length > 0){
        takeComp = dueComps[0];
        takeComp.allocated = new Date().toISOString();
        await database.updateComparison(db, takeComp);
    }
    else{
        takeComp = false;
        dueComps = await database.getUnallocatedComparisons(db, round, resource.id);
        if(dueComps.length == 0){
            await clearOverdueComps(resource, db);
            dueComps = await database.getUnallocatedComparisons(db, round, resource.id);
            
        }
        let n = 0;
        while((takeComp == false) && (n < dueComps.length)){
            if(avoid.indexOf(dueComps[n].id) == -1){
                takeComp = dueComps[n];
                takeComp.allocated = new Date().toISOString();
                takeComp.user_id = user_id;
                await database.updateComparison(db,takeComp);
            }
            n++;
        }
    }
    return takeComp;
}

async function clearOverdueComps(resource, db, timelimit = 600){
    let dueComps = await database.getIncompleteComparisons(db, resource.round);
    const pretime = new Date() - timelimit;
    for(let d in dueComps){
        let cmpDate = new Date(d.allocated);
        if((cmpDate < pretime) && (cmpDate > 0)){
            d.allocated = 0;
            d.user_id = '';
            await database.updateComparison(db, d);
        }
    }
}

// get marker's decision and updates comparison in database
//  (basic version, must chose either left or right)
async function checkInput(userId, cmpId, leftWon, db){
    let cmp = await database.retrieveAcjComparison(db, cmpId);
    if(leftWon){
        cmp.leftWon = true;
        cmp.done = new Date().toISOString();
        cmp.madeBy_id = userId;
    }
    else{
        cmp.rightWon = true;
        cmp.done = new Date().toISOString();
        cmp.madeBy_id = userId;
    }
    await database.updateComparison(db, cmp);
}

class acjComparison{
    constructor(){
        this.id = null;
        this.user_id = null;
        this.activity_id = null;
        this.madeBy_id = null;
        this.round = 0;
        this.left_id = null;
        this.right_id = null;
        this.leftWon = false;
        this.rightWon = false;
        this.allocated = new Date().toISOString();
        this.done = new Date().toISOString();
    }
}


async function logSubmissionData(db, resource){
    //retrieve submissions
    const subs = await database.getAcjSubmissions(db, resource.id);
    let subList = Object.values(subs);
    //get submission ids in order of rank
    subList.sort(cmp3)
    const subIds = subList.map(x => x.id);
    //retrieve comparisons
    const comps = await database.retrieveAcjComparisonMatching(db, "round", resource.round - 1);
    let subResults = []
    for(let c of comps){
        subResults.push({id: c.left_id, cmpId: c.right_id, brightness: (((perfectRanking[c.left_id] / Object.keys(perfectRanking).length)*0.5) + 0.5)});
        subResults.push({id: c.right_id, cmpId: c.left_id, brightness: (((perfectRanking[c.right_id] / Object.keys(perfectRanking).length)*0.5) + 0.5)});
    }
    subResults.sort((a,b) => {
        const x = subIds.indexOf(a.id);
        const y = subIds.indexOf(b.id);
        return x < y ? -1 : 1;
    });
    const subResultsStr = subResults.map(x => JSON.stringify(x)).join("/");
    //const subResults = subIds.map(id => JSON.stringify({id: id, brightness: (((perfectRanking[id] / Object.keys(perfectRanking).length)*0.5) + 0.5)})).join("/");

    //log data
    rankingLogger.rankingLogger.log({
        level: "info",
        round: resource.round - 1,
        ranks: subIds
    });
    resultsLogger.resultsLogger.log({
        level: "info",
        results: subResultsStr
    });
}

//key: submission id, value: true ranking, worst to best: 9,3,2,7,6,4,1,10,5,8 | 3,2,6,4,1,5 
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

module.exports = {
    Acj,
    Submission,
    cmp,
    cmp2,
    cmp3,
    nextAlternating,
    nextOffsetAlternating,
    prepareNewAcjRound,
    getAComparison,
    clearOverdueComps,
    checkInput,
    acjComparison,
    perfectRanking
}