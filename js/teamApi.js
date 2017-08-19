var http = require("http");
var fs = require('fs');
var qs = require('querystring');

var dataUrl = '../data/teams.json';

http.createServer(function(request, response) {
	var url = request.url;
	var responseData = getTeamData();
	if (url === '/reset_data') {
		resetData();
		responseData = getTeamData();
		response.writeHead(200, {'Content-Type': 'text/plain', "Access-Control-Allow-Origin": "*"});

		response.end(responseData);
	} else if (url === '/create_question') {
		responseData = JSON.stringify(createQuestion(responseData));
		response.writeHead(200, {'Content-Type': 'text/plain', "Access-Control-Allow-Origin": "*"});

		response.end(responseData);
	} else if (url === '/fetch_question') {
		responseData = JSON.stringify(formulateQuestion());
		response.writeHead(200, {'Content-Type': 'text/plain', "Access-Control-Allow-Origin": "*"});

		response.end(responseData);
	} else if (url === '/verify_answers') {
		//var feedback = verifyResponses(/* read the body */);
		
		var body = '';
		request.on('data', function(data) {
			body += data;
		});

		request.on('end', function() {
			var feedback = checkAnswers(JSON.parse(body));
			responseData = JSON.stringify(feedback);
		    response.writeHead(200, {'Content-Type': 'text/plain', "Access-Control-Allow-Origin": "*"});

		    response.end(responseData);
		});
	} else {
		response.writeHead(200, {'Content-Type': 'text/plain', "Access-Control-Allow-Origin": "*"});

		response.end(responseData);
	}
}).listen(8081);

function checkAnswers(answers) {
	var feedback = [];
	for (var i = 0; i < answers.length; i++) {
		var answer = answers[i];
		var answerFeedback = {};
		answerFeedback.index = answer.index;
		answerFeedback.status = isCorrectPlayer(answer.firstName, answer.lastName);
		feedback.push(answerFeedback);
	}

	return feedback;
}

function isCorrectPlayer(firstName, lastName) {
	// player was the target player
	if (playerMatchesByNames(questionInfo.player, firstName, lastName)) {
		return 0;
	}

	var playerAlreadyGuessed = questionInfo.guessedPlayers.find((guessedPlayer) => { return playerMatchesByNames(guessedPlayer, firstName, lastName); });
	// player already has been guessed
	if (playerAlreadyGuessed) {
		return 0;
	}

	var teams = JSON.parse(getTeamData());
	var team = teams.find((_team) => { return _team.name === questionInfo.team; });
	var player = team.players.find((p) => { return playerMatchesByNames(p, firstName, lastName); });

	// player not on team
	if (!player) {
		return 0;
	}

	questionInfo.guessedPlayers.push({ 'firstName': firstName, 'lastName': lastName });

	player.picked += 1;
	writeTeamData(teams);

	return 1;
}

function playerMatchesByNames(player, firstName, lastName) {
	return firstName === player.firstName && lastName === player.lastName;
}

function getTeamData() {
	return fs.readFileSync(dataUrl);
}

function writeTeamData(teams) {
	fs.writeFileSync(dataUrl, JSON.stringify(teams));
}

function createQuestion(teamsString) {
	var teams = JSON.parse(teamsString);

	questionInfo.typeId = 1;

	var team = pickRandom(teams);
	questionInfo.team = team.name;

	var player = pickRandom(team.players);
	questionInfo.player = { 'firstName': player.firstName, 'lastName': player.lastName };

	questionInfo.answerCount = pickReverseWeightedRandomAnswerCount(team.players.length);

	questionInfo.guessedPlayers = [];

	questionInfo.questionText = 'Name ' + questionInfo.answerCount + ' teammate(s) of ' + questionInfo.player.firstName + ' ' + questionInfo.player.lastName + ' on the ' + questionInfo.team + '.';
	return formulateQuestion();
}

function formulateQuestion() {
	return { 'questionText': questionInfo.questionText, 'answerCount': questionInfo.answerCount };
}

function pickRandom(targetList) {
	var rand = Math.floor(Math.random() * targetList.length);

	return targetList[rand];
}
// if max = 5
// 16 chances to pick 1
// 9 chances to pick 2
// 4 chances to pick 3
// 1 chance to pick 4
// 0 chances to pick 5
function pickReverseWeightedRandomAnswerCount(max) {
	var distrubatableShares = getSharesToBeDistributed(max);
	var rand = Math.floor(Math.random()*distrubatableShares);

	var numberOfChances = max-1;
	while (numberOfChances > 0) {
		if (rand < numberOfChances*numberOfChances) {
			return max - numberOfChances;
		}
		rand -= numberOfChances*numberOfChances;
		numberOfChances--;
	}
}

function getSharesToBeDistributed(max) {
	var sum = 0;
	for (var i = max-1; i > 0; i--) {
		sum += i*i;
	}
	return sum;
}

function resetData() {
	var teams = JSON.parse(getTeamData().toString().replace(/\r?\n|\r|\t/g, ''));

	for (var i = 0; i < teams.length; i++) {
		var team = teams[i];
		for (var j = 0; j < team.players.length; j++) {
			var player = team.players[j];
			player.picked = 0;
		}
	}

	writeTeamData(teams);
}

var questionInfo = {};