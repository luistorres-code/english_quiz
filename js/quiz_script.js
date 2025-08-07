let quizData = null;
let currentQuestionIndex = 0;
let score = 0;
const quizElement = document.getElementById("quiz");
const nextButton = document.getElementById("next-button");
const scoreDisplay = document.getElementById("score-display");

// Función para cargar el quiz desde un archivo JSON
async function loadQuiz(quizFile) {
	try {
		const response = await fetch(`./model/${quizFile}`);
		if (!response.ok) {
			throw new Error(`Error loading quiz: ${response.status}`);
		}
		quizData = await response.json();

		// Actualizar el título y descripción
		document.querySelector("h1").textContent = quizData.title;
		document.querySelector(".quiz-container p").textContent = quizData.description;

		// Inicializar el quiz
		currentQuestionIndex = 0;
		score = 0;
		showQuestion(currentQuestionIndex);
	} catch (error) {
		console.error("Error loading quiz:", error);
		quizElement.innerHTML = "<p>Error al cargar el quiz. Por favor, intenta de nuevo.</p>";
	}
}

function showQuestion(questionIndex) {
	if (!quizData || !quizData.questions) return;

	const questionData = quizData.questions[questionIndex];
	quizElement.innerHTML = `
        <div class="question-section">
            <p class="question-text">${questionData.question}</p>
            <div class="answer-options">
                ${questionData.answerOptions
									.map(
										(option, index) => `
                    <button class="answer-button" data-index="${index}">${option.text}</button>
                `
									)
									.join("")}
            </div>
        </div>
    `;

	document.querySelectorAll(".answer-button").forEach((button) => {
		button.addEventListener("click", handleAnswerClick);
	});

	nextButton.style.display = "none";
}

function handleAnswerClick(event) {
	const selectedButton = event.target;
	const selectedIndex = parseInt(selectedButton.dataset.index);
	const currentQuestion = quizData.questions[currentQuestionIndex];
	const selectedOption = currentQuestion.answerOptions[selectedIndex];

	document.querySelectorAll(".answer-button").forEach((button) => {
		button.disabled = true;
	});

	const feedbackContainer = document.createElement("div");
	feedbackContainer.classList.add("feedback");
	const rationale = document.createElement("p");
	rationale.classList.add("rationale");
	const hint = document.createElement("p");
	hint.classList.add("hint");

	if (selectedOption.isCorrect) {
		selectedButton.classList.add("correct");
		score++;
		feedbackContainer.classList.add("correct");
		feedbackContainer.innerHTML = "¡Correcto!";
	} else {
		selectedButton.classList.add("incorrect");
		feedbackContainer.classList.add("incorrect");
		feedbackContainer.innerHTML = "Incorrecto.";
		const correctButton = document.querySelector(`.answer-button[data-index="${currentQuestion.answerOptions.findIndex((opt) => opt.isCorrect)}"]`);
		if (correctButton) {
			correctButton.classList.add("correct");
		}
	}

	rationale.innerHTML = `**Razón:** ${selectedOption.rationale}`;
	hint.style.display = "block";
	hint.innerHTML = `**Pista:** ${currentQuestion.hint}`;

	feedbackContainer.appendChild(rationale);
	quizElement.appendChild(feedbackContainer);
	quizElement.appendChild(hint);

	nextButton.style.display = "block";
}

function showScore() {
	quizElement.style.display = "none";
	nextButton.style.display = "none";
	scoreDisplay.style.display = "block";
	scoreDisplay.innerHTML = `¡Has completado el quiz!<br>Tu puntaje es: ${score} de ${quizData.questions.length}.`;
}

nextButton.addEventListener("click", () => {
	currentQuestionIndex++;
	if (currentQuestionIndex < quizData.questions.length) {
		showQuestion(currentQuestionIndex);
	} else {
		showScore();
	}
});

// Función para obtener el parámetro del quiz desde la URL
function getQuizFromURL() {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get("quiz");
}

// Inicializar la interfaz cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
	const quizSelector = document.getElementById("quiz-select");
	const loadQuizButton = document.getElementById("load-quiz");

	if (loadQuizButton) {
		loadQuizButton.addEventListener("click", () => {
			const selectedQuiz = quizSelector.value;
			if (selectedQuiz) {
				loadQuiz(selectedQuiz);
			}
		});
	}

	// Solo cargar quiz si viene especificado en la URL
	const quizFromURL = getQuizFromURL();
	if (quizFromURL) {
		loadQuiz(quizFromURL);
	}
});
