/**
 * Exercise Renderer Manager - Sistema unificado de renderizado de ejercicios
 * Refactorización para eliminar funciones wrapper duplicadas
 */

/**
 * Configuración base para todos los tipos de ejercicios
 */
const EXERCISE_CONFIG = {
	multiple_choice: {
		renderFunction: "renderMultipleChoice",
		requiresManualCheck: false,
		callback: (isCorrect) => ({ isCorrect }),
	},
	fill_in_the_blanks: {
		renderFunction: "renderFillInTheBlanks",
		requiresManualCheck: true,
		callback: (answers) => ({ answers, isMultiAnswer: true }),
	},
	matching: {
		renderFunction: "renderMatching",
		requiresManualCheck: false,
		totalPairsProperty: "pairs",
		callback: (isComplete, isCorrect) => ({ isComplete, isCorrect }),
	},
	reading_comprehension: {
		renderFunction: "renderReadingComprehension",
		requiresManualCheck: false,
		callback: (result) => ({ result, isReadingComprehension: true }),
	},
	true_false: {
		renderFunction: "renderTrueFalse",
		requiresManualCheck: false,
		callback: (isCorrect) => ({ isCorrect }),
	},
	short_answer: {
		renderFunction: "renderShortAnswerStandalone",
		requiresManualCheck: true,
		callback: (isCorrect) => ({ isCorrect }),
	},
	ordering: {
		renderFunction: "renderOrdering",
		requiresManualCheck: true,
		callback: (isCorrect) => ({ isCorrect }),
	},
};

/**
 * Sistema unificado para renderizar ejercicios
 * Reemplaza todas las funciones wrapper individuales
 * @param {string} exerciseType - Tipo de ejercicio
 * @param {Object} questionData - Datos de la pregunta
 * @param {Object} context - Contexto adicional (container, elements, etc.)
 * @param {Function} onComplete - Callback cuando se completa el ejercicio
 */
function renderUnifiedExercise(exerciseType, questionData, context, onComplete) {
	const config = EXERCISE_CONFIG[exerciseType];

	if (!config) {
		console.warn(`Tipo de ejercicio no soportado: ${exerciseType}`);
		return;
	}

	const { container, elements = {} } = context;

	// Determinar si requiere verificación manual y deshabilitar botón siguiente
	if (config.requiresManualCheck) {
		disableNextButton(elements.nextButton);
	}

	// Configuración específica del ejercicio
	if (exerciseType === "matching" && config.totalPairsProperty) {
		// Para matching, configurar totalPairs si es necesario
		if (questionData[config.totalPairsProperty]) {
			context.totalPairs = questionData[config.totalPairsProperty].length;
		}
	}

	// Crear callback unificado que maneja todos los tipos de respuesta
	const unifiedCallback = (...args) => {
		console.log(`=== UNIFIED CALLBACK CALLED ===`);
		console.log(`Exercise type: ${exerciseType}`);
		console.log(`Args:`, args);

		const result = config.callback(...args);
		console.log(`Callback result:`, result);

		// Extraer información del resultado según el tipo de ejercicio
		let isCorrect = false;
		let questionIndex = context.currentQuestionIndex || 0;

		// Lógica simplificada para extraer isCorrect
		if (exerciseType === "reading_comprehension") {
			const readingResult = args[0] || result.result;
			if (readingResult && readingResult.correctAnswers !== undefined) {
				const correct = readingResult.correctAnswers || 0;
				const total = readingResult.totalQuestions || 1;
				isCorrect = correct / total >= 0.5;
			} else {
				isCorrect = readingResult && readingResult.isCorrect === true;
			}
		} else if (exerciseType === "matching") {
			const isComplete = args[0];
			const matchingIsCorrect = args[1];
			isCorrect = isComplete && matchingIsCorrect;
		} else if (exerciseType === "fill_in_the_blanks") {
			// Para fill_in_the_blanks, procesar con función existente
			const correctAnswers = handleFillInTheBlanksResult(result, context);
			isCorrect = correctAnswers > 0;

			// IMPORTANTE: Actualizar el score manualmente porque handleFillInTheBlanksResult no lo hace
			if (correctAnswers > 0 && context.updateScore) {
				context.updateScore();
				console.log(`Fill in the blanks: Updated score by ${correctAnswers}`);
			}
		} else {
			// Para todos los demás (multiple_choice, true_false, short_answer, ordering)
			// El resultado viene en args[0] o result.isCorrect
			if (args.length > 0 && typeof args[0] === "boolean") {
				isCorrect = args[0];
			} else if (result.isCorrect !== undefined) {
				isCorrect = result.isCorrect;
			}
		}

		// Manejo simple y directo
		if (exerciseType === "reading_comprehension") {
			handleReadingComprehensionResult(args[0], context);
			const readingResult = args[0];
			const scoreIncrement = readingResult?.correctAnswers || (isCorrect ? 1 : 0);

			if (typeof onComplete === "function") {
				onComplete({
					exerciseType,
					scoreIncrement,
					originalResult: result,
					isCorrect,
				});
			}
		} else {
			// Para todos los demás ejercicios (incluyendo short_answer, ordering, fill_in_the_blanks)
			if (exerciseType !== "fill_in_the_blanks") {
				handleExerciseResult(context, isCorrect, exerciseType, questionIndex);
			} else {
				// Para fill_in_the_blanks, solo mostrar botón (ya se procesó arriba)
				showNextButtonAfterAnswer(context);
			}

			if (typeof onComplete === "function") {
				onComplete({
					exerciseType,
					scoreIncrement: isCorrect ? 1 : 0,
					originalResult: result,
					isCorrect,
				});
			}
		}
	};

	// Obtener la función de renderizado y ejecutarla
	const renderFunction = window[config.renderFunction];

	if (typeof renderFunction !== "function") {
		console.error(`Función de renderizado no encontrada: ${config.renderFunction}`);
		return;
	}

	// Ejecutar función de renderizado con parámetros apropiados
	if (exerciseType === "reading_comprehension") {
		renderFunction(container, questionData, context.currentQuestionIndex, unifiedCallback);
	} else {
		renderFunction(container, questionData, unifiedCallback);
	}
}

/**
 * Maneja los resultados de los ejercicios de forma unificada
 * @param {string} exerciseType - Tipo de ejercicio
 * @param {Object} result - Resultado del ejercicio
 * @param {Object} context - Contexto (score, elements, etc.)
 * @param {Function} onComplete - Callback final
 */
/**
 * Función helper para mostrar botón siguiente después de responder
 */
function showNextButtonAfterAnswer(context) {
	if (context.elements && context.elements.nextButton) {
		context.elements.nextButton.style.display = "block";
		context.elements.nextButton.style.visibility = "visible";
		context.elements.nextButton.disabled = false;
		context.elements.nextButton.classList.remove("disabled");

		manageUIState([context.elements.nextButton], "button", "show");
		manageUIState([context.elements.nextButton], "button", "enable");
	}
}

function handleExerciseResult(context, isCorrect, exerciseType, questionIndex) {
	console.log(`=== HANDLE EXERCISE RESULT ===`);
	console.log(`Exercise type: ${exerciseType}`);
	console.log(`Is correct: ${isCorrect}`);
	console.log(`Context elements:`, context.elements);
	console.log(`Next button:`, context.elements?.nextButton);

	// Incrementar score si la respuesta es correcta
	if (isCorrect && context.updateScore) {
		context.updateScore();
	}

	// Determinar el contenedor para el feedback - usar container por defecto
	let feedbackContainer = context.container || context.feedbackContainer || document.getElementById("quiz") || document.body;

	// Usar el sistema unificado de feedback
	const feedbackOptions = {
		type: "general",
		isCorrect,
		message: isCorrect ? "¡Correcto!" : "Incorrecto. Intenta de nuevo.",
	};

	if (feedbackContainer && typeof feedbackContainer.querySelector === "function") {
		showUnifiedFeedback(feedbackContainer, feedbackOptions);
	} else {
		console.error("No valid feedback container available!", feedbackContainer);
	}

	// Mostrar botón "Siguiente" y ocultar botón "Comprobar"
	console.log(`=== TRYING TO SHOW NEXT BUTTON ===`);
	if (context.elements && context.elements.nextButton) {
		console.log(`Next button found, showing...`);
		// Método directo para mostrar el botón
		context.elements.nextButton.style.display = "block";
		context.elements.nextButton.style.visibility = "visible";

		// IMPORTANTE: Habilitar el botón (podría estar deshabilitado por requiresManualCheck)
		context.elements.nextButton.disabled = false;
		context.elements.nextButton.classList.remove("disabled");

		// También usar el sistema unificado
		manageUIState([context.elements.nextButton], "button", "show");
		manageUIState([context.elements.nextButton], "button", "enable");

		console.log(`Next button styles after showing:`, {
			display: context.elements.nextButton.style.display,
			visibility: context.elements.nextButton.style.visibility,
			disabled: context.elements.nextButton.disabled,
		});

		// Ocultar botones de comprobar si existen
		const checkButtons = feedbackContainer.querySelectorAll(".check-answer-btn");
		if (checkButtons.length > 0) {
			console.log(`Hiding check buttons:`, checkButtons);
			manageUIState(checkButtons, "button", "hide");
		}
	} else {
		console.error("No next button found in context!");
	}
}
/**
 * Maneja resultados específicos de fill in the blanks
 */
function handleFillInTheBlanksResult(result, context) {
	if (!result.isMultiAnswer) return result.isCorrect ? 1 : 0;

	const { answers } = result;
	let isCorrect = true;
	let hasRetryableAnswers = false;

	answers.forEach(({ userAnswer, correctAnswer, input }) => {
		// Obtener alternativas si existen (buscar en questionParts)
		const partIndex = parseInt(input.getAttribute("data-index"));
		const questionData = context.questionData;
		const questionPart = questionData.questionParts[partIndex];
		const alternatives = questionPart.alternatives || [];
		const allValidAnswers = [correctAnswer, ...alternatives];

		// Usar el algoritmo inteligente de análisis de respuestas
		const analysis = analyzeUserAnswer(userAnswer, allValidAnswers);

		if (analysis.isCorrect) {
			input.classList.add("correct");
			if (analysis.confidence === 100) {
				input.setAttribute("data-feedback", "¡Perfecto!");
			}
		} else {
			input.classList.add("incorrect");
			isCorrect = false;

			if (analysis.allowRetry) {
				hasRetryableAnswers = true;
				input.setAttribute("data-feedback", analysis.feedback);
				input.setAttribute("data-hint", analysis.hint || "");
			} else {
				showCorrectAnswer(input, correctAnswer);
				input.disabled = true;
			}
		}
	});

	// Manejar lógica de reintento
	if (hasRetryableAnswers && !isCorrect) {
		showRetryFeedback(context.container.querySelector(".question-section"), answers);
		context.shouldShowNext = false;
		return 0; // No puntaje hasta completar correctamente
	} else {
		// Completar el ejercicio
		answers.forEach(({ input }) => {
			input.disabled = true;
		});

		const feedbackMessage = createFillInFeedbackMessage(answers, context.questionData);
		showFeedback(context.container.querySelector(".question-section"), isCorrect, feedbackMessage);

		window.hideCheckButton(context.container);
		context.shouldShowNext = true;
		return isCorrect ? 1 : 0;
	}
}

/**
 * Maneja resultados específicos de reading comprehension
 */
function handleReadingComprehensionResult(result, context) {
	let correctAnswers = 0;
	let totalQuestions = 0;

	if (typeof result === "object" && result.isComplete) {
		// Comprensión lectora con múltiples preguntas
		correctAnswers = result.correctAnswers || 0;
		totalQuestions = result.totalQuestions || 0;
	} else if (typeof result === "object" && result.result) {
		// Comprensión lectora con estructura anidada
		if (result.result.isComplete) {
			correctAnswers = result.result.correctAnswers || 0;
			totalQuestions = result.result.totalQuestions || 0;
		} else {
			// Una sola respuesta
			correctAnswers = result.result ? 1 : 0;
			totalQuestions = 1;
		}
	} else {
		// Comprensión lectora tradicional (una sola pregunta)
		correctAnswers = result ? 1 : 0;
		totalQuestions = 1;
	}

	// Actualizar score por cada respuesta correcta
	if (context.updateScore && correctAnswers > 0) {
		for (let i = 0; i < correctAnswers; i++) {
			context.updateScore();
		}
	}

	// Mostrar feedback y botón siguiente
	const feedbackContainer = context.container || document.getElementById("quiz") || document.body;
	const isAllCorrect = correctAnswers === totalQuestions;
	const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

	const feedbackOptions = {
		type: "general",
		isCorrect: isAllCorrect,
		message: `Respuestas correctas: ${correctAnswers} de ${totalQuestions} (${percentage}%)`,
	};

	if (feedbackContainer && typeof feedbackContainer.querySelector === "function") {
		showUnifiedFeedback(feedbackContainer, feedbackOptions);
	}

	// Mostrar botón siguiente
	if (context.elements && context.elements.nextButton) {
		context.elements.nextButton.style.display = "block";
		context.elements.nextButton.style.visibility = "visible";
		context.elements.nextButton.disabled = false;
		context.elements.nextButton.classList.remove("disabled");

		manageUIState([context.elements.nextButton], "button", "show");
		manageUIState([context.elements.nextButton], "button", "enable");
	}
}

/**
 * Funciones de conveniencia para mantener la interfaz existente
 */
function renderMultipleChoiceExercise(questionData, context, onComplete) {
	return renderUnifiedExercise("multiple_choice", questionData, context, onComplete);
}

function renderFillInTheBlankExercise(questionData, context, onComplete) {
	return renderUnifiedExercise("fill_in_the_blanks", questionData, context, onComplete);
}

function renderMatchingExercise(questionData, context, onComplete) {
	return renderUnifiedExercise("matching", questionData, context, onComplete);
}

function renderReadingComprehensionExercise(questionData, context, onComplete) {
	return renderUnifiedExercise("reading_comprehension", questionData, context, onComplete);
}

function renderTrueFalseExercise(questionData, context, onComplete) {
	return renderUnifiedExercise("true_false", questionData, context, onComplete);
}

function renderShortAnswerExercise(questionData, context, onComplete) {
	return renderUnifiedExercise("short_answer", questionData, context, onComplete);
}

function renderOrderingExercise(questionData, context, onComplete) {
	return renderUnifiedExercise("ordering", questionData, context, onComplete);
}

// Hacer funciones disponibles globalmente
window.renderUnifiedExercise = renderUnifiedExercise;
window.renderMultipleChoiceExercise = renderMultipleChoiceExercise;
window.renderFillInTheBlankExercise = renderFillInTheBlankExercise;
window.renderMatchingExercise = renderMatchingExercise;
window.renderReadingComprehensionExercise = renderReadingComprehensionExercise;
window.renderTrueFalseExercise = renderTrueFalseExercise;
window.renderShortAnswerExercise = renderShortAnswerExercise;
window.renderOrderingExercise = renderOrderingExercise;
