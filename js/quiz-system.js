// =============================================================================
// VARIABLES GLOBALES
// =============================================================================

let exerciseData = null;
let currentQuestionIndex = 0;
let score = 0;
let selectedMatchingItems = [];
let matchedPairs = 0;
let totalPairs = 0;

// Referencias DOM
const elements = {
	container: document.getElementById("quiz"),
	nextButton: document.getElementById("next-button"),
	homeButton: document.getElementById("home-button"),
	scoreDisplay: document.getElementById("score-display"),
	progressContainer: document.getElementById("progress-container"),
	selector: document.getElementById("quiz-select"),
	loadButton: document.getElementById("load-quiz"),
	selectorDiv: document.querySelector(".quiz-selector"),
};

// =============================================================================
// INICIALIZACIÓN
// =============================================================================

/**
 * Inicializa el sistema
 */
function initializeSystem() {
	setupEventListeners();
	initializeFromURL();
	console.log("Sistema de ejercicios inicializado correctamente");
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
	// Botón cargar ejercicio
	if (elements.loadButton) {
		elements.loadButton.addEventListener("click", () => {
			const selectedExercise = elements.selector?.value;
			if (selectedExercise) {
				updateURL(selectedExercise);
				loadExercise(selectedExercise);
			}
		});
	}

	// Botón siguiente
	if (elements.nextButton) {
		elements.nextButton.addEventListener("click", () => {
			nextQuestion();
		});
	}

	// Botón home
	if (elements.homeButton) {
		elements.homeButton.addEventListener("click", () => {
			goHome();
		});
	}

	// Navegación del navegador
	window.addEventListener("popstate", () => {
		handleBrowserNavigation();
	});
}

// =============================================================================
// CARGA Y GESTIÓN DE EJERCICIOS
// =============================================================================

/**
 * Carga un ejercicio desde archivo JSON
 */
async function loadExercise(exerciseFile) {
	try {
		const response = await fetch(`./model/${exerciseFile}`);
		if (!response.ok) {
			throw new Error(`Error loading exercise: ${response.status}`);
		}

		exerciseData = await response.json();
		exerciseData.questions = shuffleArray(exerciseData.questions);

		resetExerciseState();
		showExerciseInterface();
		showQuestion(0);
	} catch (error) {
		console.error("Error loading exercise:", error);
		showError("Error al cargar el ejercicio. Por favor, intenta de nuevo.");
	}
}

/**
 * Muestra una pregunta específica
 */
function showQuestion(questionIndex) {
	if (!exerciseData?.questions) return;

	const questionData = exerciseData.questions[questionIndex];
	resetQuestionState();

	// Actualizar progreso
	updateProgressBar(elements.progressContainer, questionIndex + 1, exerciseData.questions.length);

	// Renderizar según el tipo de ejercicio
	const exerciseType = questionData.type || "multiple_choice";

	switch (exerciseType) {
		case "fill_in_the_blanks":
			renderFillInTheBlankExercise(questionData);
			break;
		case "matching":
			totalPairs = questionData.pairs.length;
			renderMatchingExercise(questionData);
			break;
		case "reading_comprehension":
			renderReadingComprehensionExercise(questionData);
			break;
		case "multiple_choice":
		default:
			renderMultipleChoiceExercise(questionData);
			break;
	}
}

/**
 * Renderiza ejercicio de opción múltiple
 */
function renderMultipleChoiceExercise(questionData) {
	renderMultipleChoice(elements.container, questionData, (isCorrect) => {
		if (isCorrect) score++;
		showNextButton();
	});
}

/**
 * Renderiza ejercicio de rellenar espacios
 */
function renderFillInTheBlankExercise(questionData) {
	renderFillInTheBlanks(elements.container, questionData, (answers) => {
		let isCorrect = true;

		answers.forEach(({ userAnswer, correctAnswer, input }) => {
			const isAnswerCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

			if (isAnswerCorrect) {
				input.classList.add("correct");
			} else {
				input.classList.add("incorrect");
				isCorrect = false;
				showCorrectAnswer(input, correctAnswer);
			}
			input.disabled = true;
		});

		if (isCorrect) {
			score++;
		}

		const feedbackMessage = createFillInFeedbackMessage(answers, questionData);
		showFeedback(elements.container.querySelector(".question-section"), isCorrect, feedbackMessage);

		hideCheckButton();
		showNextButton();
	});
}

/**
 * Renderiza ejercicio de matching
 */
function renderMatchingExercise(questionData) {
	renderMatching(elements.container, questionData, (isComplete, isCorrect) => {
		if (isComplete) {
			if (isCorrect) {
				score++;
			}
			showNextButton();
		}
	});
}

/**
 * Renderiza ejercicio de comprensión lectora
 */
function renderReadingComprehensionExercise(questionData) {
	renderReadingComprehension(elements.container, questionData, (isCorrect) => {
		if (isCorrect) score++;
		showNextButton();
	});
}

// =============================================================================
// UTILIDADES DE EJERCICIOS
// =============================================================================

/**
 * Muestra respuesta correcta para input incorrecto
 */
function showCorrectAnswer(input, correctAnswer) {
	const correctSpan = createElement("span", {
		className: "correct-answer",
		textContent: correctAnswer,
	});
	input.parentNode.insertBefore(correctSpan, input.nextSibling);
}

/**
 * Crea mensaje de feedback para fill-in-the-blanks
 */
function createFillInFeedbackMessage(answers, questionData) {
	const incorrectAnswers = answers.filter(({ userAnswer, correctAnswer }) => userAnswer.toLowerCase() !== correctAnswer.toLowerCase());

	if (incorrectAnswers.length === 0) {
		return questionData.hint || "";
	}

	const correctAnswersList = incorrectAnswers.map(({ correctAnswer }) => `"${correctAnswer}"`).join(", ");

	let message = incorrectAnswers.length === 1 ? `La respuesta correcta es: ${correctAnswersList}` : `Las respuestas correctas son: ${correctAnswersList}`;

	if (questionData.hint) {
		message += `\nPista: ${questionData.hint}`;
	}

	return message;
}

// =============================================================================
// NAVEGACIÓN Y FLUJO
// =============================================================================

/**
 * Pasa a la siguiente pregunta o muestra resultados
 */
function nextQuestion() {
	currentQuestionIndex++;
	if (currentQuestionIndex < exerciseData.questions.length) {
		showQuestion(currentQuestionIndex);
	} else {
		showResults();
	}
}

/**
 * Muestra los resultados finales
 */
function showResults() {
	// Ocultar elementos del ejercicio
	elements.container.style.display = "none";
	elements.nextButton.style.display = "none";
	hideProgressBar(elements.progressContainer);

	const totalQuestions = exerciseData.questions.length;
	const percentage = Math.round((score / totalQuestions) * 100);

	// Determinar nivel de rendimiento
	const { performanceLevel, performanceMessage } = getPerformanceData(percentage);

	// Datos para el componente de resultados
	const resultsData = {
		score,
		totalQuestions,
		percentage,
		performanceLevel,
		performanceMessage,
		onRetry: () => retryExercise(),
		onHome: () => goHome(),
		onShare: () => shareResults(percentage, score, totalQuestions),
	};

	renderResults(elements.scoreDisplay, resultsData);
}

/**
 * Obtiene datos de rendimiento basados en el porcentaje
 */
function getPerformanceData(percentage) {
	if (percentage >= 90) {
		return {
			performanceLevel: "¡Excelente!",
			performanceMessage: "¡Increíble trabajo! Dominas muy bien este tema.",
		};
	} else if (percentage >= 70) {
		return {
			performanceLevel: "¡Buen trabajo!",
			performanceMessage: "¡Muy bien! Tienes un buen conocimiento del tema.",
		};
	} else if (percentage >= 50) {
		return {
			performanceLevel: "Puede mejorar",
			performanceMessage: "Sigue practicando. ¡Estás en el camino correcto!",
		};
	} else {
		return {
			performanceLevel: "Necesita práctica",
			performanceMessage: "No te desanimes. Con más práctica mejorarás.",
		};
	}
}

/**
 * Reinicia el ejercicio actual
 */
function retryExercise() {
	currentQuestionIndex = 0;
	score = 0;
	resetQuestionState();

	// Mezclar preguntas de nuevo
	exerciseData.questions = shuffleArray(exerciseData.questions);

	// Ocultar resultados y mostrar primera pregunta
	elements.scoreDisplay.style.display = "none";
	elements.container.style.display = "block";
	showQuestion(0);
}

/**
 * Vuelve al estado inicial
 */
function goHome() {
	resetSystem();
	showHomeInterface();
	updateURL(null);
}

/**
 * Comparte los resultados
 */
function shareResults(percentage, score, total) {
	const shareText = `¡Acabo de completar el ejercicio "${exerciseData.title}" con un ${percentage}% de aciertos! (${score}/${total})`;

	if (navigator.share) {
		navigator
			.share({
				title: "Mi resultado en Ejercicios de Inglés",
				text: shareText,
				url: window.location.href,
			})
			.catch((err) => console.log("Error sharing:", err));
	} else if (navigator.clipboard) {
		navigator.clipboard
			.writeText(shareText + " - " + window.location.href)
			.then(() => {
				showTemporaryMessage("¡Resultado copiado al portapapeles!");
			})
			.catch((err) => console.log("Error copying to clipboard:", err));
	} else {
		alert(shareText + "\n\n" + window.location.href);
	}
}

// =============================================================================
// GESTIÓN DE ESTADO
// =============================================================================

/**
 * Resetea el estado del sistema completo
 */
function resetSystem() {
	exerciseData = null;
	currentQuestionIndex = 0;
	score = 0;
	resetQuestionState();
}

/**
 * Resetea el estado específico de la pregunta
 */
function resetQuestionState() {
	selectedMatchingItems = [];
	matchedPairs = 0;
	totalPairs = 0;
}

/**
 * Resetea el estado del ejercicio
 */
function resetExerciseState() {
	clearContainer(elements.container);
	elements.nextButton.style.display = "none";
	elements.scoreDisplay.style.display = "none";
	clearContainer(elements.scoreDisplay);
}

// =============================================================================
// INTERFAZ
// =============================================================================

/**
 * Muestra la interfaz del ejercicio
 */
function showExerciseInterface() {
	elements.container.style.display = "block";

	if (elements.homeButton) {
		elements.homeButton.style.display = "flex";
	}

	if (elements.selectorDiv) {
		elements.selectorDiv.style.display = "none";
	}

	updatePageContent();
}

/**
 * Muestra la interfaz inicial
 */
function showHomeInterface() {
	if (elements.homeButton) {
		elements.homeButton.style.display = "none";
	}

	if (elements.selectorDiv) {
		elements.selectorDiv.style.display = "flex";
	}

	if (elements.selector) {
		elements.selector.value = "";
	}

	restoreOriginalContent();

	elements.container.style.display = "none";
	elements.scoreDisplay.style.display = "none";
	hideProgressBar(elements.progressContainer);
}

/**
 * Actualiza el contenido de la página con datos del ejercicio
 */
function updatePageContent() {
	const titleElement = document.querySelector("h1");
	const descriptionElement = document.querySelector("#main-description");

	if (titleElement && exerciseData.title) {
		titleElement.textContent = exerciseData.title;
	}

	if (descriptionElement && exerciseData.description) {
		descriptionElement.textContent = exerciseData.description;
	}
}

/**
 * Restaura el contenido original de la página
 */
function restoreOriginalContent() {
	const titleElement = document.querySelector("h1");
	const descriptionElement = document.querySelector("#main-description");

	if (titleElement) {
		titleElement.textContent = "Ejercicios de Inglés";
	}

	if (descriptionElement) {
		descriptionElement.textContent = "Selecciona un ejercicio para comenzar.";
	}
}

// =============================================================================
// UTILIDADES DE UI
// =============================================================================

/**
 * Muestra el botón siguiente
 */
function showNextButton() {
	if (elements.nextButton) {
		elements.nextButton.style.display = "block";
	}
}

/**
 * Oculta el botón de check
 */
function hideCheckButton() {
	const checkButton = elements.container.querySelector(".check-button");
	if (checkButton) {
		checkButton.style.display = "none";
	}
}

/**
 * Muestra un error
 */
function showError(message) {
	clearContainer(elements.container);

	const errorElement = createElement("div", {
		className: "error-message",
		attributes: {
			role: "alert",
			"aria-live": "assertive",
		},
	});

	const errorText = createElement("p", {
		textContent: message,
	});

	errorElement.appendChild(errorText);
	elements.container.appendChild(errorElement);
	elements.container.style.display = "block";
}

/**
 * Muestra un mensaje temporal
 */
function showTemporaryMessage(message) {
	console.log(message); // Placeholder - se puede mejorar con un toast
}

// =============================================================================
// GESTIÓN DE URL
// =============================================================================

/**
 * Inicializa desde la URL si hay parámetros
 */
function initializeFromURL() {
	const exerciseFromURL = getExerciseFromURL();
	if (exerciseFromURL && elements.selector) {
		const exerciseFileName = exerciseNameToFile(exerciseFromURL);
		elements.selector.value = exerciseFileName;
		loadExercise(exerciseFileName);
	}
}

/**
 * Maneja la navegación del navegador
 */
function handleBrowserNavigation() {
	const exerciseFromURL = getExerciseFromURL();

	if (exerciseFromURL && elements.selector) {
		const exerciseFileName = exerciseNameToFile(exerciseFromURL);
		elements.selector.value = exerciseFileName;
		loadExercise(exerciseFileName);
	} else {
		goHome();
	}
}

/**
 * Obtiene el ejercicio desde la URL
 */
function getExerciseFromURL() {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get("exercise") || urlParams.get("quiz");
}

/**
 * Convierte nombre de ejercicio a nombre de archivo
 */
function exerciseNameToFile(exerciseName) {
	return exerciseName.includes(".json") ? exerciseName : `${exerciseName}.json`;
}

/**
 * Convierte nombre de archivo a nombre limpio
 */
function fileToExerciseName(fileName) {
	return fileName.replace(".json", "");
}

/**
 * Actualiza la URL con el ejercicio seleccionado
 */
function updateURL(exerciseFile) {
	const url = new URL(window.location);
	if (exerciseFile) {
		const cleanName = fileToExerciseName(exerciseFile);
		url.searchParams.set("exercise", cleanName);
	} else {
		url.searchParams.delete("exercise");
		url.searchParams.delete("quiz");
	}
	window.history.pushState({}, "", url);
}
