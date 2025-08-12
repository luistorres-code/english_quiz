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

function calculateTotalQuestions(questions) {
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
		case "true_false":
			renderTrueFalseExercise(questionData);
			break;
		case "short_answer":
			renderShortAnswerExercise(questionData);
			break;
		case "ordering":
			renderOrderingExercise(questionData);
			break;
		case "multiple_choice":
		default:
			renderMultipleChoiceExercise(questionData);
			break;
	}
}
function renderMultipleChoiceExercise(questionData) {
	renderMultipleChoice(elements.container, questionData, (isCorrect) => {
		if (isCorrect) score++;
		showNextButton();
	});
}

function renderFillInTheBlankExercise(questionData) {
	renderFillInTheBlanks(elements.container, questionData, (answers) => {
		let isCorrect = true;
		let hasRetryableAnswers = false;

		answers.forEach(({ userAnswer, correctAnswer, input }) => {
			// Obtener alternativas si existen (buscar en questionParts)
			const partIndex = parseInt(input.getAttribute("data-index"));
			const questionPart = questionData.questionParts[partIndex];
			const alternatives = questionPart.alternatives || [];
			const allValidAnswers = [correctAnswer, ...alternatives];

			// Usar el algoritmo inteligente de análisis de respuestas
			const analysis = analyzeUserAnswer(userAnswer, allValidAnswers);

			if (analysis.isCorrect) {
				input.classList.add("correct");
				// Mostrar feedback positivo específico
				if (analysis.confidence === 100) {
					input.setAttribute("data-feedback", "¡Perfecto!");
				}
			} else {
				input.classList.add("incorrect");
				isCorrect = false;

				// Si permite reintento, dar una segunda oportunidad
				if (analysis.allowRetry) {
					hasRetryableAnswers = true;
					input.setAttribute("data-feedback", analysis.feedback);
					input.setAttribute("data-hint", analysis.hint || "");
					// No deshabilitar el input todavía para permitir corrección
				} else {
					// Mostrar la respuesta correcta si no permite reintento
					showCorrectAnswer(input, correctAnswer);
					input.disabled = true;
				}
			}
		});

		// Si hay respuestas que permiten reintento, mostrar feedback y permitir corrección
		if (hasRetryableAnswers && !isCorrect) {
			showRetryFeedback(elements.container.querySelector(".question-section"), answers);
			// No avanzar automáticamente, permitir corrección
		} else {
			// Completar el ejercicio
			answers.forEach(({ input }) => {
				input.disabled = true;
			});

			if (isCorrect) {
				score++;
			}

			const feedbackMessage = createFillInFeedbackMessage(answers, questionData);
			showFeedback(elements.container.querySelector(".question-section"), isCorrect, feedbackMessage);

			hideCheckButton();
			showNextButton();
		}
	});
}

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

function renderReadingComprehensionExercise(questionData) {
	renderReadingComprehension(elements.container, questionData, currentQuestionIndex, (result) => {
		if (typeof result === "object" && result.isComplete) {
			// Comprensión lectora con múltiples preguntas
			score += result.correctAnswers;
			// Ajustar el índice para reflejar las preguntas múltiples
			currentQuestionIndex += result.totalQuestions - 1;
		} else {
			// Comprensión lectora tradicional (una sola pregunta)
			if (result) score++;
		}
		showNextButton();
	});
}

function renderTrueFalseExercise(questionData) {
	renderTrueFalse(elements.container, questionData, (isCorrect) => {
		if (isCorrect) score++;
		showNextButton();
	});
}

function renderShortAnswerExercise(questionData) {
	renderShortAnswerStandalone(elements.container, questionData, (isCorrect) => {
		if (isCorrect) score++;
		showNextButton();
	});
}

function renderOrderingExercise(questionData) {
	renderOrdering(elements.container, questionData, (isCorrect) => {
		if (isCorrect) score++;
		showNextButton();
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

function calculateTotalQuestions(exerciseData) {
	if (!exerciseData?.questions) return 0;

	let total = 0;
	exerciseData.questions.forEach((question) => {
		if (question.type === "reading_comprehension" && question.questions && Array.isArray(question.questions)) {
			// Para comprensión lectora, contar las sub-preguntas
			total += question.questions.length;
		} else {
			// Para otros tipos, contar como 1
			total += 1;
		}
	});
	return total;
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
	// Ocultar elementos del ejercicio
	elements.container.style.display = "none";
	elements.nextButton.style.display = "none";
	hideProgressBar(elements.progressContainer);

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
}

function resetExerciseState() {
	clearContainer(elements.container);
	elements.nextButton.style.display = "none";
	elements.scoreDisplay.style.display = "none";
	clearContainer(elements.scoreDisplay);
}

// ---
// INTERFAZ
// ---

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
// UTILIDADES DE UI
// ---

function showNextButton() {
	if (elements.nextButton) {
		elements.nextButton.style.display = "block";
	}
}

function hideCheckButton() {
	const checkButton = elements.container.querySelector(".check-button");
	if (checkButton) {
		checkButton.style.display = "none";
	}
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
	elements.container.style.display = "block";
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

// ---
// FUNCIONES AUXILIARES PARA FILL IN THE BLANKS
// ---

function showRetryFeedback(questionSection, answers) {
	// Remover feedback anterior si existe
	const existingFeedback = questionSection.querySelector(".retry-feedback");
	if (existingFeedback) {
		existingFeedback.remove();
	}

	const retryFeedback = createElement("div", {
		className: "retry-feedback",
	});

	const retryMessage = createElement("p", {
		className: "retry-message",
		textContent: "Tienes una segunda oportunidad. Revisa tus respuestas:",
	});

	retryFeedback.appendChild(retryMessage);

	// Mostrar hints específicos para cada respuesta incorrecta
	answers.forEach(({ input }, index) => {
		const feedback = input.getAttribute("data-feedback");
		const hint = input.getAttribute("data-hint");

		if (feedback && input.classList.contains("incorrect")) {
			const itemFeedback = createElement("div", {
				className: "item-feedback",
			});

			const feedbackText = createElement("p", {
				className: "feedback-text",
				textContent: `Campo ${index + 1}: ${feedback}`,
			});

			itemFeedback.appendChild(feedbackText);

			if (hint) {
				const hintText = createElement("p", {
					className: "hint-text",
					textContent: hint,
				});
				itemFeedback.appendChild(hintText);
			}

			retryFeedback.appendChild(itemFeedback);
		}
	});

	questionSection.appendChild(retryFeedback);

	// Auto-remover el feedback después de unos segundos
	setTimeout(() => {
		if (retryFeedback.parentNode) {
			retryFeedback.remove();
		}
	}, 8000);
}
