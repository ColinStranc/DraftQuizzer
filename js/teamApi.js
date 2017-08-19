var http = require("http");
var fs = require('fs');

var dataUrl = '../data/teams.json';

http.createServer(function(request, response) {
	if (request.url === '/reset_data') {
		resetData();
	}
    response.writeHead(200, {'Content-Type': 'text/plain', "Access-Control-Allow-Origin": "*"});

    response.end(getTeamData());
}).listen(8081);

function getTeamData() {
	return fs.readFileSync(dataUrl);
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

	fs.writeFileSync(dataUrl, JSON.stringify(teams));
}