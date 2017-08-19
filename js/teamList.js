var baseTeamApiUrl = 'http://127.0.0.1:8081/';

function populateTeamLists() {
	httpGetAsync(baseTeamApiUrl, function(teamsString) {
		var teams = JSON.parse(teamsString);

		var teamLists = document.querySelector('.team-lists');
		for (var i = 0; i < teams.length; i++) {
			addTeam(teamLists, teams[i]);
		}
	});	
}

function clearTeamLists() {
	var teamLists = document.querySelector('.team-lists');
	while (teamLists.hasChildNodes()) {
		teamLists.removeChild(teamLists.lastChild);
	}
}

function addTeam(teamLists, team) {
	var teamList = document.createElement('div');
	teamList.className += ' team-list';

	var sumGuesses = getGuessSum(team);

	teamList.appendChild(createTeamNameElement(team.name));

	var sortedPlayers = team.players.sort((p1, p2) => {
		if (p2.picked !== p1.picked) {
			return p2.picked - p1.picked;
		}
		return p2.lastName < p1.lastName ? 1 : -1;
	});

	for (var i = 0; i < sortedPlayers.length; i++) {
		teamList.appendChild(createPlayerElement(sortedPlayers[i], sumGuesses, i%2===0));
	}

	teamLists.appendChild(teamList);
}

function getGuessSum(team) {
	var sum = 0;
	for (var i = 0; i < team.players.length; i++) {
		sum += team.players[i].picked;
	}
	return sum;
}

function createTeamNameElement(teamName) {
	var teamDiv = document.createElement('div');
	teamDiv.className += ' team-name';
	teamDiv.appendChild(document.createTextNode(teamName));
	return teamDiv;
}

function createPlayerElement(player, sumGuesses, isEven) {
	var pickPercent = sumGuesses === 0 ? 0 : Math.floor(player.picked/sumGuesses*100);

	var playerDiv = document.createElement('div');
	playerDiv.className += ' player';
	playerDiv.className += ' ' + player.position;
	var t = isEven ? ' even-row' : ' odd-row';
	playerDiv.className += t;

	var positionDiv = document.createElement('div');
	positionDiv.className += ' player-position';
	positionDiv.appendChild(document.createTextNode(player.position));

	var nameDiv = document.createElement('div');
	nameDiv.className += ' player-name';
	nameDiv.appendChild(document.createTextNode(player.firstName + ' ' + player.lastName));

	var pickedDiv = document.createElement('div');
	pickedDiv.className += ' picked-percent';
	pickedDiv.appendChild(document.createTextNode(pickPercent + '%'));

	playerDiv.appendChild(positionDiv);
	playerDiv.appendChild(nameDiv);
	playerDiv.appendChild(pickedDiv);

	return playerDiv;
}

function resetPlayerPickedCounts() {
	// I know I know, not a get request... TODO
	httpGetAsync(baseTeamApiUrl + 'reset_data');
	clearTeamLists();
	populateTeamLists();
}


function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
}


populateTeamLists();
//testWrite();

