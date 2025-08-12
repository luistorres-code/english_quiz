// Global state
let exerciseData = null;
let currentQuestionIndex = 0;
let score = 0;
let selectedMatchingItems = [];
let matchedPairs = 0;
let totalPairs = 0;
let elements = {};

// System initialization

function initializeSystem() {
	// Inicializar referencias DOM cuando el sistema se inicializa
	elements = {
		container: document.getElementById("quiz"),
		nextButton: document.getElementById("next-button"),
		homeButton: document.getElementById("home-button"),
		scoreDisplay: document.getElementById("score-display"),
		progressContainer: document.getElementById("progress-container"),
		selector: document.getElementById("quiz-select"),
		loadButton: document.getElementById("load-quiz"),
		selectorDiv: document.querySelector(".quiz-selector"),
		feedbackContainer: document.getElementById("feedback-container"),
	};

	setupEventListeners();
	loadAvailableExercises();
	initializeFromURL();
}

// Auto-load available exercises
async function loadAvailableExercises() {
	try {
		// Cargar el índice de ejercicios disponibles
		const indexResponse = await fetch("./exercises/index.json");
		let knownExercises = ["first_steps.json"]; // Fallback

		if (indexResponse.ok) {
			const indexData = await indexResponse.json();
			knownExercises = indexData.exercises || knownExercises;
		} else {
			console.warn("Could not load exercises index, using fallback list");
		}

		const exerciseOptions = [];

		// Intentar cargar cada archivo para obtener su título
		for (const fileName of knownExercises) {
			try {
				const response = await fetch(`./exercises/${fileName}`);
				if (response.ok) {
					const data = await response.json();
					const cleanName = fileToExerciseName(fileName);
					exerciseOptions.push({
						value: cleanName,
						title: data.title || formatFileName(cleanName),
						description: data.description || "",
					});
				}
			} catch (error) {
				console.warn(`Could not load ${fileName}:`, error);
			}
		}

		// Ordenar alfabéticamente por título
		exerciseOptions.sort((a, b) => a.title.localeCompare(b.title));

		// Poblar el select
		populateExerciseSelect(exerciseOptions);
	} catch (error) {
		console.error("Error loading available exercises:", error);
		// Fallback con opciones básicas
		populateExerciseSelect([{ value: "first_steps", title: "Primeros Pasos", description: "" }]);
	}
}

// Populate select with exercise options
function populateExerciseSelect(exercises) {
	if (!elements.selector) return;

	// Limpiar opciones existentes (excepto la primera)
	const defaultOption = elements.selector.querySelector('option[value=""]');
	elements.selector.innerHTML = "";
	if (defaultOption) {
		elements.selector.appendChild(defaultOption);
	}

	// Agregar opciones de ejercicios
	exercises.forEach((exercise) => {
		const option = document.createElement("option");
		option.value = exercise.value;
		option.textContent = exercise.title;
		if (exercise.description) {
			option.title = exercise.description; // Tooltip con descripción
		}
		elements.selector.appendChild(option);
	});
}

// Format filename for display (fallback)
function formatFileName(fileName) {
	return fileName
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function setupEventListeners() {
	// Botón cargar ejercicio
	if (elements.loadButton) {
		elements.loadButton.addEventListener("click", () => {
			const selectedExercise = elements.selector?.value;
			if (selectedExercise) {
				updateURL(selectedExercise);
				const exerciseFileName = exerciseNameToFile(selectedExercise);
				loadExercise(exerciseFileName);
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

// ---
// CARGA Y GESTIÓN DE EJERCICIOS
// ---

async function loadExercise(exerciseFile) {
	try {
		const response = await fetch(`./exercises/${exerciseFile}`);
		if (!response.ok) {
			throw new Error(`Error loading exercise: ${response.status}`);
		}

		exerciseData = await response.json();
		exerciseData.questions = shuffleArray(exerciseData.questions);

		// Calcular el total real de preguntas (incluyendo sub-preguntas)
		exerciseData.totalRealQuestions = calculateTotalQuestions(exerciseData.questions);

		resetExerciseState();
		showExerciseInterface();
		showQuestion(0);
	} catch (error) {
		console.error("Error loading exercise:", error);
		showError("Error al cargar el ejercicio. Por favor, intenta de nuevo.");
	}
}

function calculateTotalQuestions(questionsOrExerciseData) {
	const questions = Array.isArray(questionsOrExerciseData) ? questionsOrExerciseData : questionsOrExerciseData?.questions;
	if (!questions) return 0;

	let total = 0;
	questions.forEach((question) => {
		if (question.type === "reading_comprehension" && question.questions && Array.isArray(question.questions)) {
			// Comprensión lectora con múltiples sub-preguntas
			total += question.questions.length;
		} else {
			// Pregunta normal
			total += 1;
		}
	});
	return total;
}

function showQuestion(questionIndex) {
	if (!exerciseData?.questions) return;

	const questionData = exerciseData.questions[questionIndex];
	resetQuestionState();

	// Calcular progreso considerando sub-preguntas de comprensión lectora
	const totalQuestions = calculateTotalQuestions(exerciseData);
	const currentQuestionNumber = calculateCurrentQuestionNumber(exerciseData, questionIndex);

	// Actualizar progreso
	updateProgressBar(currentQuestionNumber, totalQuestions);

	// Renderizar según el tipo de ejercicio
	const exerciseType = questionData.type || "multiple_choice";

	// Determinar si el ejercicio requiere verificación manual
	const requiresManualCheck = ["fill_in_the_blanks", "short_answer", "ordering"].includes(exerciseType);

	// Si requiere verificación manual, deshabilitar el botón siguiente
	if (requiresManualCheck) {
		disableNextButton();
	}

	// Renderizar usando el sistema unificado
	renderExerciseByType(exerciseType, questionData);
}
// Usar el sistema unificado de renderizado de ejercicios
function renderExerciseByType(exerciseType, questionData) {
	const context = {
		container: elements.container,
		feedbackContainer: elements.feedbackContainer,
		elements: elements,
		currentQuestionIndex: currentQuestionIndex,
		questionData: questionData,
		// Agregar función para actualizar score
		updateScore: (increment = 1) => {
			score += increment;
		},
	};

	renderUnifiedExercise(exerciseType, questionData, context, (result) => {
		// El manejo del puntaje ya se hace en renderUnifiedExercise
		// Solo necesitamos manejar lógica específica adicional si es necesario
		if (result.exerciseType === "reading_comprehension" && result.originalResult.isComplete) {
			// No ajustar currentQuestionIndex aquí, se manejará en nextQuestion()
		}

		console.log(`Exercise completed: ${result.exerciseType}, scoreIncrement: ${result.scoreIncrement}, total score: ${score}`);
	});
}

// ---
// UTILIDADES DE EJERCICIOS
// ---

function showCorrectAnswer(input, correctAnswer) {
	const correctSpan = createElement("span", {
		className: "correct-answer",
		textContent: correctAnswer,
	});
	input.parentNode.insertBefore(correctSpan, input.nextSibling);
}

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

// ---
// UTILIDADES DE CONTEO
// ---

function updateReadingProgress(subQuestionIndex, totalSubQuestions, mainQuestionIndex) {
	const totalQuestions = calculateTotalQuestions(exerciseData);
	const questionsBeforeCurrent = calculateCurrentQuestionNumber(exerciseData, mainQuestionIndex) - 1;
	const currentQuestionNumber = questionsBeforeCurrent + subQuestionIndex + 1;

	updateProgressBar(currentQuestionNumber, totalQuestions);
}

function calculateCurrentQuestionNumber(exerciseData, currentIndex) {
	if (!exerciseData?.questions) return 0;

	let currentNumber = 0;

	// Contar preguntas hasta el índice actual
	for (let i = 0; i < currentIndex && i < exerciseData.questions.length; i++) {
		const question = exerciseData.questions[i];
		if (question.type === "reading_comprehension" && question.questions && Array.isArray(question.questions)) {
			currentNumber += question.questions.length;
		} else {
			currentNumber += 1;
		}
	}

	// Agregar 1 para la pregunta actual (siempre mostramos "pregunta X de Y")
	return currentNumber + 1;
}

// ---
// NAVEGACIÓN Y FLUJO
// ---

function nextQuestion() {
	currentQuestionIndex++;
	if (currentQuestionIndex < exerciseData.questions.length) {
		showQuestion(currentQuestionIndex);
	} else {
		showResults();
	}
}

function showResults() {
	// Usar el manager de elementos para mostrar la interfaz de resultados
	ExerciseElementsManager.showResultsInterface(elements);

	// Usar el total real de preguntas (incluyendo sub-preguntas)
	const totalQuestions = exerciseData.totalRealQuestions || exerciseData.questions.length;
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

function goHome() {
	resetSystem();
	showHomeInterface();
	updateURL(null);
}

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

// ---
// GESTIÓN DE ESTADO
// ---

function resetSystem() {
	exerciseData = null;
	currentQuestionIndex = 0;
	score = 0;
	resetQuestionState();
}

function resetQuestionState() {
	selectedMatchingItems = [];
	matchedPairs = 0;
	totalPairs = 0;
	// Ocultar el botón siguiente al cambiar de pregunta
	hideNextButton();
}

function resetExerciseState() {
	ExerciseElementsManager.resetExerciseState(elements);
}

// ---
// INTERFAZ
// ---

function showExerciseInterface() {
	ExerciseElementsManager.showExerciseInterface(elements);
	updatePageContent();
}

function showHomeInterface() {
	ExerciseElementsManager.showHomeInterface(elements);
	restoreOriginalContent();
}

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

// ---
// UTILIDADES DE UI - Refactorizadas
// ---

function showNextButton() {
	showButton(elements.nextButton);
	enableButton(elements.nextButton);
}

function hideNextButton() {
	hideButton(elements.nextButton);
}

function disableNextButton() {
	disableButton(elements.nextButton);
}

function hideCheckButton() {
	const checkButton = elements.container.querySelector(".check-button");
	hideButton(checkButton);
}

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
	showContainer(elements.container);
}

function showTemporaryMessage(message) {
	console.log(message); // Placeholder - se puede mejorar con un toast
}

// ---
// GESTIÓN DE URL
// ---

function initializeFromURL() {
	const exerciseFromURL = getExerciseFromURL();
	if (exerciseFromURL && elements.selector) {
		const exerciseFileName = exerciseNameToFile(exerciseFromURL);
		elements.selector.value = exerciseFileName;
		loadExercise(exerciseFileName);
	}
}

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

function getExerciseFromURL() {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get("exercise") || urlParams.get("quiz");
}

function exerciseNameToFile(exerciseName) {
	return exerciseName.includes(".json") ? exerciseName : `${exerciseName}.json`;
}

function fileToExerciseName(fileName) {
	return fileName.replace(".json", "");
}

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

// Funciones auxiliares específicas remanentes (se moverán a sus módulos apropiados)

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

function showCorrectAnswer(input, correctAnswer) {
	const correctSpan = createElement("span", {
		className: "correct-answer",
		textContent: correctAnswer,
	});
	input.parentNode.insertBefore(correctSpan, input.nextSibling);
}
