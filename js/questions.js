var baseTeamApiUrl = 'http://127.0.0.1:8081/';

function loadQuestion() {
	pickQuestion();
}

function addAnswerElement(answers, index) {
	var answerDiv = document.createElement('div');
	answerDiv.className += 'answer';
	var firstName = document.createElement('input');
	firstName.className += 'first-name';
	var lastName = document.createElement('input');
	lastName.className += 'last-name';
	var feedbackDiv = document.createElement('div');
	feedbackDiv.className += 'feedback';
	//feedbackDiv.appendChild(document.createTextNode('&nbsp;'));

	answerDiv.appendChild(firstName);
	answerDiv.appendChild(lastName);
	answerDiv.appendChild(feedbackDiv);
	answerDiv.setAttribute('index', index);

	answers.appendChild(answerDiv);
}

function clearPage(q, as) {
	while(q.hasChildNodes()) {
		q.removeChild(q.lastChild);
	}

	while(as.hasChildNodes()) {
		as.removeChild(as.lastChild);
	}
}

function pickQuestion() {
	var questionDiv = document.querySelector('.question');
	var answersDiv = document.querySelector('.answers');

	httpGetAsync(baseTeamApiUrl + 'create_question', function(questionString) {
		var question = JSON.parse(questionString);

		clearPage(questionDiv, answersDiv);
		questionDiv.appendChild(document.createTextNode(question.questionText));

		for (var i = 0; i < question.answerCount; i++) {
			addAnswerElement(answersDiv, i);
		}
	});
}

function getExistingQuestion() {
	var questionDiv = document.querySelector('.question');
	var answersDiv = document.querySelector('.answers');

	httpGetAsync(baseTeamApiUrl + 'fetch_question', function(questionString) {
		if (questionString !== '{}') {
			var question = JSON.parse(questionString);

			clearPage(questionDiv, answersDiv);
			questionDiv.appendChild(document.createTextNode(question.questionText));

			for (var i = 0; i < question.answerCount; i++) {
				addAnswerElement(answersDiv, i);
			}
		} else {
			questionDiv.appendChild(document.createTextNode('Get a question to start'));
		}
	});
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

function submitAnswers() {
	var answers = getAnswers();
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			setAnswerStatuses(JSON.parse(xmlHttp.responseText));
		}
	}
	xmlHttp.open('POST', baseTeamApiUrl + 'verify_answers');
	xmlHttp.send(JSON.stringify(answers));
}

function setAnswerStatuses(feedback) {
	for (var i = 0; i < feedback.length; i++) {
		var answerFeedback = feedback[i];
		var answer = document.querySelector('.answer[index="' + answerFeedback.index + '"]');
		answer.className += answerFeedback.status === 1 ? ' correct' : ' wrong';
	}
}

function getAnswers() {
	var answersDiv = document.querySelector('.answers');
	var answers = [];

	for (var i = 0; i < answersDiv.childNodes.length; i++) {
		var answer = answersDiv.childNodes[i];

		var index = answer.getAttribute('index');
		var firstName = answer.querySelector('.first-name').value;
		var lastName = answer.querySelector('.last-name').value;
		answers.push({ 'index': index, 'firstName': firstName, 'lastName': lastName });
	}

	return answers;
}

getExistingQuestion();