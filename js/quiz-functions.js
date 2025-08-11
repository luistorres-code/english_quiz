/**
 * Funciones simples para el sistema de ejercicios de inglés
 * Enfoque funcional directo sin clases
 */

// =============================================================================
// UTILIDADES DOM
// =============================================================================

/**
 * Crea un elemento DOM de manera segura
 */
function createElement(tag, options = {}) {
	const element = document.createElement(tag);

	if (options.className) {
		element.className = options.className;
	}

	if (options.textContent) {
		element.textContent = options.textContent;
	}

	if (options.attributes) {
		Object.entries(options.attributes).forEach(([key, value]) => {
			element.setAttribute(key, value);
		});
	}

	if (options.events) {
		Object.entries(options.events).forEach(([event, handler]) => {
			element.addEventListener(event, handler);
		});
	}

	return element;
}

/**
 * Limpia un contenedor
 */
function clearContainer(container) {
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
}

/**
 * Mezcla un array
 */
function shuffleArray(array) {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

// =============================================================================
// RENDERIZADO DE PREGUNTAS
// =============================================================================

/**
 * Renderiza pregunta de opción múltiple
 */
function renderMultipleChoice(container, questionData, onAnswerSelect) {
	clearContainer(container);

	const questionSection = createElement("section", {
		className: "question-section",
		attributes: {
			role: "main",
			"aria-labelledby": "question-title",
		},
	});

	const questionTitle = createElement("h2", {
		className: "question-text",
		textContent: questionData.question,
		attributes: { id: "question-title" },
	});

	const optionsFieldset = createElement("fieldset", {
		className: "answer-options",
		attributes: {
			role: "radiogroup",
			"aria-labelledby": "question-title",
		},
	});

	const legend = createElement("legend", {
		textContent: "Selecciona tu respuesta:",
		className: "visually-hidden",
	});
	optionsFieldset.appendChild(legend);

	questionData.answerOptions.forEach((option, index) => {
		const answerButton = createElement("button", {
			className: "answer-button",
			textContent: option.text,
			attributes: {
				type: "button",
				role: "radio",
				"aria-checked": "false",
				"data-index": index,
			},
			events: {
				click: (event) => handleAnswerClick(event, questionData, onAnswerSelect),
			},
		});
		optionsFieldset.appendChild(answerButton);
	});

	questionSection.appendChild(questionTitle);
	questionSection.appendChild(optionsFieldset);
	container.appendChild(questionSection);
}

/**
 * Maneja click en respuesta
 */
function handleAnswerClick(event, questionData, callback) {
	const selectedButton = event.target;
	const selectedIndex = parseInt(selectedButton.getAttribute("data-index"));
	const container = selectedButton.closest(".question-section");

	// Deshabilitar todos los botones
	const allButtons = container.querySelectorAll(".answer-button");
	allButtons.forEach((button) => {
		button.disabled = true;
		button.setAttribute("aria-checked", "false");
	});

	selectedButton.setAttribute("aria-checked", "true");

	const selectedOption = questionData.answerOptions[selectedIndex];
	const isCorrect = selectedOption.isCorrect;

	if (isCorrect) {
		selectedButton.classList.add("correct");
	} else {
		selectedButton.classList.add("incorrect");
		const correctIndex = questionData.answerOptions.findIndex((opt) => opt.isCorrect);
		if (correctIndex !== -1) {
			allButtons[correctIndex].classList.add("correct");
		}
	}

	showFeedback(container, isCorrect, selectedOption.rationale || questionData.hint);
	callback(isCorrect, selectedIndex);
}

/**
 * Renderiza ejercicios de rellenar espacios
 */
function renderFillInTheBlanks(container, questionData, onCheck) {
	clearContainer(container);

	const questionSection = createElement("section", {
		className: "question-section fill-in-the-blanks",
		attributes: {
			role: "main",
			"aria-labelledby": "question-title",
		},
	});

	const questionTitle = createElement("h2", {
		className: "question-text",
		textContent: questionData.question,
		attributes: { id: "question-title" },
	});

	const form = createElement("form", {
		attributes: { novalidate: true },
		events: {
			submit: (e) => {
				e.preventDefault();
				const answers = getFillInTheBlankAnswers(container);
				onCheck(answers);
			},
		},
	});

	const questionParagraph = createElement("p", {
		className: "question-with-blanks",
		attributes: {
			role: "group",
			"aria-labelledby": "question-title",
		},
	});

	questionData.questionParts.forEach((part, index) => {
		if (typeof part === "string") {
			questionParagraph.appendChild(document.createTextNode(part));
		} else {
			const input = createElement("input", {
				className: "fill-blank-input",
				attributes: {
					type: "text",
					"data-index": index,
					"data-answer": part.answer,
					placeholder: part.label,
					"aria-label": `Espacio en blanco ${index + 1}: ${part.label}`,
					autocomplete: "off",
				},
				events: {
					keypress: (event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							const answers = getFillInTheBlankAnswers(container);
							onCheck(answers);
						}
					},
				},
			});
			questionParagraph.appendChild(input);
		}
	});

	const checkButton = createElement("button", {
		className: "check-button",
		textContent: "Comprobar",
		attributes: {
			type: "submit",
			"aria-describedby": "question-title",
		},
	});

	form.appendChild(questionParagraph);
	form.appendChild(checkButton);
	questionSection.appendChild(questionTitle);
	questionSection.appendChild(form);
	container.appendChild(questionSection);
}

/**
 * Obtiene respuestas de espacios en blanco
 */
function getFillInTheBlankAnswers(container) {
	const inputs = container.querySelectorAll(".fill-blank-input");
	return Array.from(inputs).map((input) => ({
		userAnswer: input.value.trim(),
		correctAnswer: input.getAttribute("data-answer"),
		input: input,
	}));
}

/**
 * Renderiza ejercicios de matching
 */
function renderMatching(container, questionData, onComplete) {
	clearContainer(container);

	const questionSection = createElement("section", {
		className: "question-section matching-exercise",
		attributes: {
			role: "main",
			"aria-labelledby": "question-title",
		},
	});

	const questionTitle = createElement("h2", {
		className: "question-text",
		textContent: questionData.question,
		attributes: { id: "question-title" },
	});

	const instructions = createElement("p", {
		className: "matching-instructions",
		textContent: "Haz clic en los elementos para emparejarlos. Primero selecciona un elemento de la columna izquierda, luego uno de la derecha.",
	});

	const columnsContainer = createElement("div", {
		className: "matching-columns",
		attributes: {
			role: "application",
			"aria-labelledby": "question-title",
		},
	});

	// Columna izquierda - usar text1 o left dependiendo del formato
	const leftItems = questionData.pairs.map((pair) => pair.text1 || pair.left);
	const leftColumn = createMatchingColumn(leftItems, "left", "Columna izquierda");

	// Columna derecha (mezclada) - usar text2 o right dependiendo del formato
	const rightItems = shuffleArray(questionData.pairs.map((pair) => pair.text2 || pair.right));
	const rightColumn = createMatchingColumn(rightItems, "right", "Columna derecha");

	columnsContainer.appendChild(leftColumn);
	columnsContainer.appendChild(rightColumn);

	questionSection.appendChild(questionTitle);
	questionSection.appendChild(instructions);
	questionSection.appendChild(columnsContainer);
	container.appendChild(questionSection);

	// Inicializar lógica de matching
	initializeMatchingLogic(container, questionData, onComplete);
}

/**
 * Crea columna para matching
 */
function createMatchingColumn(items, side, label) {
	const column = createElement("div", {
		className: `matching-column matching-${side}`,
		attributes: {
			role: "listbox",
			"aria-label": label,
		},
	});

	items.forEach((item, index) => {
		const matchingItem = createElement("button", {
			className: "matching-item",
			textContent: item,
			attributes: {
				type: "button",
				"data-side": side,
				"data-value": item,
				"data-index": index,
				role: "option",
				"aria-selected": "false",
			},
		});
		column.appendChild(matchingItem);
	});

	return column;
}

/**
 * Inicializa lógica de matching
 */
function initializeMatchingLogic(container, questionData, onComplete) {
	let selectedLeft = null;
	let selectedRight = null;
	let matchedPairs = 0;
	const totalPairs = questionData.pairs.length;

	// Crear mapa de pares correctos - compatible con text1/text2 y left/right
	const correctPairs = new Map(questionData.pairs.map((pair) => [pair.text1 || pair.left, pair.text2 || pair.right]));

	container.addEventListener("click", (event) => {
		if (!event.target.classList.contains("matching-item")) return;
		if (event.target.disabled) return;

		const side = event.target.getAttribute("data-side");
		const value = event.target.getAttribute("data-value");

		if (side === "left") {
			if (selectedLeft) {
				selectedLeft.classList.remove("selected");
			}
			selectedLeft = event.target;
			selectedLeft.classList.add("selected");
			selectedLeft.setAttribute("aria-selected", "true");
		} else {
			if (selectedRight) {
				selectedRight.classList.remove("selected");
			}
			selectedRight = event.target;
			selectedRight.classList.add("selected");
			selectedRight.setAttribute("aria-selected", "true");
		}

		if (selectedLeft && selectedRight) {
			const leftValue = selectedLeft.getAttribute("data-value");
			const rightValue = selectedRight.getAttribute("data-value");
			const isCorrect = correctPairs.get(leftValue) === rightValue;

			if (isCorrect) {
				selectedLeft.classList.add("correct");
				selectedRight.classList.add("correct");
				selectedLeft.disabled = true;
				selectedRight.disabled = true;
				matchedPairs++;

				showMatchingFeedback(container, true, `¡Correcto! "${leftValue}" se empareja con "${rightValue}"`);
			} else {
				selectedLeft.classList.add("incorrect");
				selectedRight.classList.add("incorrect");

				showMatchingFeedback(container, false, `Incorrecto. "${leftValue}" no se empareja con "${rightValue}"`);

				setTimeout(() => {
					selectedLeft.classList.remove("incorrect", "selected");
					selectedRight.classList.remove("incorrect", "selected");
					selectedLeft.setAttribute("aria-selected", "false");
					selectedRight.setAttribute("aria-selected", "false");
				}, 1500);
			}

			selectedLeft = null;
			selectedRight = null;

			if (matchedPairs === totalPairs) {
				showMatchingFeedback(container, true, "¡Excelente! Has completado todos los emparejamientos.");
				onComplete(true, true);
			}
		}
	});
}

/**
 * Renderiza comprensión lectora
 */
function renderReadingComprehension(container, questionData, onAnswerSelect) {
	clearContainer(container);

	const questionSection = createElement("section", {
		className: "question-section reading-comprehension",
		attributes: {
			role: "main",
			"aria-labelledby": "reading-title",
		},
	});

	const readingTitle = createElement("h2", {
		className: "reading-title",
		textContent: questionData.passage_title || "Comprensión Lectora",
		attributes: { id: "reading-title" },
	});

	const passageContainer = createElement("article", {
		className: "reading-passage",
		attributes: {
			role: "article",
			"aria-labelledby": "reading-title",
		},
	});

	const passageText = createElement("div", {
		className: "passage-text",
		textContent: questionData.passage,
	});

	passageContainer.appendChild(passageText);

	const questionTitle = createElement("h3", {
		className: "comprehension-question",
		textContent: questionData.question,
		attributes: { id: "comprehension-question" },
	});

	const optionsContainer = createElement("fieldset", {
		className: "comprehension-options",
		attributes: {
			role: "radiogroup",
			"aria-labelledby": "comprehension-question",
		},
	});

	const legend = createElement("legend", {
		textContent: "Selecciona la respuesta correcta:",
		className: "visually-hidden",
	});
	optionsContainer.appendChild(legend);

	questionData.answerOptions.forEach((option, index) => {
		const optionButton = createElement("button", {
			className: "comprehension-answer-button",
			textContent: option.text,
			attributes: {
				type: "button",
				"data-index": index,
				role: "radio",
				"aria-checked": "false",
			},
			events: {
				click: (event) => handleReadingComprehensionAnswer(event, questionData, onAnswerSelect),
			},
		});
		optionsContainer.appendChild(optionButton);
	});

	questionSection.appendChild(readingTitle);
	questionSection.appendChild(passageContainer);
	questionSection.appendChild(questionTitle);
	questionSection.appendChild(optionsContainer);
	container.appendChild(questionSection);
}

/**
 * Maneja respuesta de comprensión lectora
 */
function handleReadingComprehensionAnswer(event, questionData, callback) {
	const selectedButton = event.target;
	const selectedIndex = parseInt(selectedButton.getAttribute("data-index"));
	const container = selectedButton.closest(".question-section");

	const allButtons = container.querySelectorAll(".comprehension-answer-button");
	allButtons.forEach((button) => {
		button.disabled = true;
		button.setAttribute("aria-checked", "false");
	});

	selectedButton.setAttribute("aria-checked", "true");

	const selectedOption = questionData.answerOptions[selectedIndex];
	const isCorrect = selectedOption.isCorrect;

	if (isCorrect) {
		selectedButton.classList.add("correct");
	} else {
		selectedButton.classList.add("incorrect");
		const correctIndex = questionData.answerOptions.findIndex((opt) => opt.isCorrect);
		if (correctIndex !== -1) {
			allButtons[correctIndex].classList.add("correct");
		}
	}

	showFeedback(container, isCorrect, selectedOption.rationale || questionData.hint);
	callback(isCorrect, selectedIndex);
}

// =============================================================================
// FEEDBACK Y UTILIDADES
// =============================================================================

/**
 * Muestra feedback
 */
function showFeedback(container, isCorrect, message = "") {
	const existingFeedback = container.querySelector(".feedback");
	if (existingFeedback) {
		existingFeedback.remove();
	}

	const feedbackContainer = createElement("div", {
		className: `feedback ${isCorrect ? "correct" : "incorrect"}`,
		attributes: {
			role: "alert",
			"aria-live": "polite",
		},
	});

	const feedbackTitle = createElement("strong", {
		textContent: isCorrect ? "¡Correcto!" : "Incorrecto.",
	});
	feedbackContainer.appendChild(feedbackTitle);

	if (message) {
		const feedbackMessage = createElement("div", {
			className: "feedback-details",
			textContent: message,
		});
		feedbackContainer.appendChild(feedbackMessage);
	}

	container.appendChild(feedbackContainer);

	requestAnimationFrame(() => {
		feedbackContainer.style.display = "block";
	});
}

/**
 * Muestra feedback para matching
 */
function showMatchingFeedback(container, isCorrect, message) {
	const existingFeedback = container.querySelector(".matching-feedback");
	if (existingFeedback) {
		existingFeedback.remove();
	}

	const feedback = createElement("div", {
		className: `matching-feedback ${isCorrect ? "correct" : "incorrect"}`,
		textContent: message,
		attributes: {
			role: "status",
			"aria-live": "polite",
		},
	});

	container.appendChild(feedback);

	setTimeout(() => {
		if (feedback && feedback.parentNode) {
			feedback.remove();
		}
	}, 3000);
}

// =============================================================================
// RENDERIZADO DE RESULTADOS
// =============================================================================

/**
 * Renderiza pantalla de resultados
 */
function renderResults(container, resultsData) {
	clearContainer(container);

	const { score, totalQuestions, percentage, performanceLevel, performanceMessage, onRetry, onHome, onShare } = resultsData;
	const performanceClass = getPerformanceClass(percentage);

	const resultsMain = createElement("main", {
		className: `results-container ${performanceClass}`,
		attributes: {
			role: "main",
			"aria-labelledby": "results-title",
		},
	});

	// Header
	const resultsHeader = createElement("header", {
		className: "results-header",
	});

	const title = createElement("h1", {
		className: "results-title",
		textContent: performanceLevel,
		attributes: { id: "results-title" },
	});

	const subtitle = createElement("p", {
		className: "results-subtitle",
		textContent: performanceMessage,
	});

	resultsHeader.appendChild(title);
	resultsHeader.appendChild(subtitle);

	// Score card
	const scoreCard = createElement("section", {
		className: "score-display-card",
		attributes: {
			role: "region",
			"aria-labelledby": "score-summary",
		},
	});

	const scoreCircle = createElement("div", {
		className: "score-circle",
		attributes: {
			role: "img",
			"aria-label": `Puntuación: ${percentage} por ciento`,
		},
	});

	const percentageDisplay = createElement("div", {
		textContent: `${percentage}%`,
		className: "score-percentage",
	});
	scoreCircle.appendChild(percentageDisplay);

	const scoreDetails = createElement("div", {
		className: "score-details",
		attributes: { id: "score-summary" },
	});

	const correctItem = createScoreDetailItem(score, "Correctas");
	const incorrectItem = createScoreDetailItem(totalQuestions - score, "Incorrectas");
	const totalItem = createScoreDetailItem(totalQuestions, "Total");

	scoreDetails.appendChild(correctItem);
	scoreDetails.appendChild(incorrectItem);
	scoreDetails.appendChild(totalItem);

	scoreCard.appendChild(scoreCircle);
	scoreCard.appendChild(scoreDetails);

	// Actions
	const actionsSection = createElement("section", {
		className: "results-actions",
		attributes: {
			role: "group",
			"aria-label": "Acciones disponibles",
		},
	});

	const retryButton = createElement("button", {
		className: "action-button action-button-primary",
		textContent: "🔄 Intentar de nuevo",
		attributes: { type: "button" },
		events: { click: onRetry },
	});

	const homeButton = createElement("button", {
		className: "action-button action-button-secondary",
		textContent: "🏠 Volver al inicio",
		attributes: { type: "button" },
		events: { click: onHome },
	});

	const shareButton = createElement("button", {
		className: "action-button action-button-secondary",
		textContent: "📊 Compartir resultado",
		attributes: { type: "button" },
		events: { click: onShare },
	});

	actionsSection.appendChild(retryButton);
	actionsSection.appendChild(homeButton);
	actionsSection.appendChild(shareButton);

	resultsMain.appendChild(resultsHeader);
	resultsMain.appendChild(scoreCard);
	resultsMain.appendChild(actionsSection);

	container.appendChild(resultsMain);
	container.style.display = "block";
}

/**
 * Crea item de detalle de puntuación
 */
function createScoreDetailItem(number, label) {
	const item = createElement("div", {
		className: "score-detail-item",
	});

	const numberSpan = createElement("span", {
		className: "score-detail-number",
		textContent: number.toString(),
	});

	const labelSpan = createElement("span", {
		className: "score-detail-label",
		textContent: label,
	});

	item.appendChild(numberSpan);
	item.appendChild(labelSpan);
	return item;
}

/**
 * Determina clase de rendimiento
 */
function getPerformanceClass(percentage) {
	if (percentage >= 90) return "performance-excellent score-excellent";
	if (percentage >= 70) return "performance-good score-good";
	return "performance-fair score-fair";
}

// =============================================================================
// PROGRESS BAR
// =============================================================================

/**
 * Actualiza barra de progreso
 */
function updateProgressBar(container, currentQuestion, totalQuestions) {
	if (!container) return;

	const percentage = Math.round((currentQuestion / totalQuestions) * 100);

	container.style.display = "block";
	container.setAttribute("aria-hidden", "false");

	const progressText = container.querySelector("#progress-text");
	if (progressText) {
		progressText.textContent = `Pregunta ${currentQuestion} de ${totalQuestions}`;
	}

	const progressPercentage = container.querySelector("#progress-percentage");
	if (progressPercentage) {
		progressPercentage.textContent = `${percentage}%`;
	}

	const progressFill = container.querySelector("#progress-fill");
	if (progressFill) {
		progressFill.style.width = `${percentage}%`;
		progressFill.setAttribute("aria-valuenow", percentage);
	}
}

/**
 * Oculta barra de progreso
 */
function hideProgressBar(container) {
	if (container) {
		container.style.display = "none";
		container.setAttribute("aria-hidden", "true");
	}
}
