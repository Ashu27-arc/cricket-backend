// utils/commentaryGenerator.js

const commentaryTemplates = {
    runs: {
        0: [
            "Dot ball! {bowler} keeps it tight",
            "No run there, good bowling by {bowler}",
            "Defended well by {batsman}",
            "Maiden over building up here"
        ],
        1: [
            "{batsman} pushes it for a single",
            "Quick single taken by {batsman}",
            "Good running between the wickets",
            "Rotates the strike with a single"
        ],
        2: [
            "Two runs! Good placement by {batsman}",
            "Couple of runs added to the total",
            "{batsman} finds the gap for two",
            "Well run two by {batsman}"
        ],
        3: [
            "Three runs! Excellent running",
            "They've run hard for three",
            "{batsman} places it well for three runs",
            "Good cricket, three runs added"
        ],
        4: [
            "FOUR! Beautiful shot by {batsman}!",
            "What a boundary! {batsman} finds the fence",
            "FOUR runs! Excellent timing by {batsman}",
            "Cracking shot for four by {batsman}!",
            "BOUNDARY! {batsman} pierces the field"
        ],
        6: [
            "SIX! What a shot by {batsman}!",
            "MAXIMUM! {batsman} sends it into the stands!",
            "SIX runs! Massive hit by {batsman}!",
            "OUT OF THE PARK! {batsman} goes big!",
            "HUGE SIX! {batsman} clears the boundary with ease!"
        ]
    },
    wicket: [
        "WICKET! {batsman} is out! What a breakthrough!",
        "OUT! {batsman} has to go back to the pavilion",
        "GONE! {batsman} is dismissed! Great bowling!",
        "WICKET FALLS! {batsman} is out for {runs}",
        "BREAKTHROUGH! {batsman} departs after scoring {runs}"
    ],
    extras: {
        wide: [
            "Wide ball! Extra run to the batting side",
            "That's called wide, pressure on the bowler",
            "Wide delivery, {batsman} leaves it alone"
        ],
        'no-ball': [
            "No ball! Free hit coming up!",
            "That's a no-ball, extra run and free hit",
            "Overstepping! No ball called"
        ],
        bye: [
            "Bye! {batsman} misses, keeper misses too",
            "Byes taken, neither batsman nor keeper could collect",
            "Extra runs via byes"
        ],
        'leg-bye': [
            "Leg bye! Ball hits the pad and they run",
            "Leg byes taken, off the pads",
            "Extra runs via leg byes"
        ]
    },
    milestones: {
        50: "FIFTY! What an innings by {batsman}! Raises the bat to acknowledge the crowd!",
        100: "CENTURY! Outstanding knock by {batsman}! What a player!",
        team50: "FIFTY up for {team}! Good start to the innings",
        team100: "HUNDRED up for {team}! Solid batting display",
        team150: "150 up for {team}! Building a good total",
        team200: "200 up for {team}! Excellent batting performance"
    },
    overComplete: [
        "End of over {over}. {team} are {runs}/{wickets}. Batsmen change ends - {newStriker} now on strike",
        "Over {over} completed. Current score: {runs}/{wickets}. Strike rotated, {newStriker} to face next over",
        "That's the end of over {over}. {team}: {runs}/{wickets}. {newStriker} and {newNonStriker} swap ends"
    ],
    inningsEnd: [
        "That's the end of the innings! {team} finish on {runs}/{wickets}",
        "Innings complete! {team} have scored {runs} runs for the loss of {wickets} wickets",
        "All over! {team} end their innings at {runs}/{wickets}"
    ]
};

function generateCommentary(ballData, matchState) {
    const { runs, isWicket, extra, batsmanOnStrike, nonStriker } = ballData;
    const { teamA, teamB, batting, runs: totalRuns, wickets, ballCount } = matchState;

    let commentary = "";

    // Wicket commentary
    if (isWicket) {
        const template = commentaryTemplates.wicket[Math.floor(Math.random() * commentaryTemplates.wicket.length)];
        commentary = template
            .replace('{batsman}', batsmanOnStrike)
            .replace('{runs}', totalRuns);
    }
    // Extra runs commentary
    else if (extra) {
        const extraTemplates = commentaryTemplates.extras[extra.type] || [];
        if (extraTemplates.length > 0) {
            const template = extraTemplates[Math.floor(Math.random() * extraTemplates.length)];
            commentary = template.replace('{batsman}', batsmanOnStrike);
        }
    }
    // Regular runs commentary
    else {
        const runTemplates = commentaryTemplates.runs[runs] || commentaryTemplates.runs[0];
        const template = runTemplates[Math.floor(Math.random() * runTemplates.length)];
        commentary = template
            .replace('{batsman}', batsmanOnStrike)
            .replace('{bowler}', 'Bowler');
    }

    // Add milestone commentary
    const milestoneCommentary = checkMilestones(matchState, runs);
    if (milestoneCommentary) {
        commentary += ` ${milestoneCommentary}`;
    }

    return {
        text: commentary,
        timestamp: new Date().toISOString(),
        ballNumber: ballCount + 1,
        over: Math.floor(ballCount / 6) + 1,
        ballInOver: (ballCount % 6) + 1
    };
}

function checkMilestones(matchState, runsScored) {
    const { runs, batting } = matchState;

    // Team milestones
    if (runs >= 200 && runs - runsScored < 200) {
        return commentaryTemplates.milestones.team200.replace('{team}', batting);
    }
    if (runs >= 150 && runs - runsScored < 150) {
        return commentaryTemplates.milestones.team150.replace('{team}', batting);
    }
    if (runs >= 100 && runs - runsScored < 100) {
        return commentaryTemplates.milestones.team100.replace('{team}', batting);
    }
    if (runs >= 50 && runs - runsScored < 50) {
        return commentaryTemplates.milestones.team50.replace('{team}', batting);
    }

    return null;
}

function generateOverSummary(overData, overNumber, matchState, newStriker, newNonStriker) {
    const overRuns = overData.reduce((sum, ball) => sum + ball.runs + (ball.extra ? ball.extra.value : 0), 0);
    const overWickets = overData.reduce((sum, ball) => sum + (ball.isWicket ? 1 : 0), 0);

    const template = commentaryTemplates.overComplete[Math.floor(Math.random() * commentaryTemplates.overComplete.length)];

    return {
        text: template
            .replace('{over}', overNumber)
            .replace('{team}', matchState.batting)
            .replace('{runs}', matchState.runs)
            .replace('{wickets}', matchState.wickets)
            .replace('{newStriker}', newStriker || matchState.striker)
            .replace('{newNonStriker}', newNonStriker || matchState.nonStriker),
        timestamp: new Date().toISOString(),
        type: 'over-summary',
        overNumber,
        overRuns,
        overWickets,
        batsmenAfterOver: {
            striker: newStriker || matchState.striker,
            nonStriker: newNonStriker || matchState.nonStriker
        }
    };
}

function generateInningsEndCommentary(matchState) {
    const template = commentaryTemplates.inningsEnd[Math.floor(Math.random() * commentaryTemplates.inningsEnd.length)];

    return {
        text: template
            .replace('{team}', matchState.batting)
            .replace('{runs}', matchState.runs)
            .replace('{wickets}', matchState.wickets),
        timestamp: new Date().toISOString(),
        type: 'innings-end'
    };
}

module.exports = {
    generateCommentary,
    generateOverSummary,
    generateInningsEndCommentary
};