// Análisis de respuestas

function levenshteinDistance(str1, str2) {
	const matrix = [];

	for (let i = 0; i <= str2.length; i++) {
		matrix[i] = [i];
	}

	for (let j = 0; j <= str1.length; j++) {
		matrix[0][j] = j;
	}

	for (let i = 1; i <= str2.length; i++) {
		for (let j = 1; j <= str1.length; j++) {
			if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
			}
		}
	}

	return matrix[str2.length][str1.length];
}

function calculateSimilarity(str1, str2) {
	const maxLength = Math.max(str1.length, str2.length);
	if (maxLength === 0) return 100;

	const distance = levenshteinDistance(str1, str2);
	return ((maxLength - distance) / maxLength) * 100;
}

function normalizeString(str) {
	// Verificar que str sea un string
	if (typeof str !== "string") {
		return "";
	}

	return str
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^\w\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function analyzeUserAnswer(userAnswer, correctAnswers) {
	const normalizedUser = normalizeString(userAnswer);

	// Si correctAnswers es un array, verificamos cada respuesta posible
	const answersArray = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];

	// Buscar coincidencia exacta primero
	for (const correctAnswer of answersArray) {
		const normalizedCorrect = normalizeString(correctAnswer);
		if (normalizedUser === normalizedCorrect) {
			return {
				isCorrect: true,
				confidence: 100,
				feedback: "¡Perfecto!",
				allowRetry: false,
			};
		}
	}

	// Si no hay coincidencia exacta, buscar la mejor similitud
	let bestSimilarity = 0;
	let bestMatch = answersArray[0];

	for (const correctAnswer of answersArray) {
		const normalizedCorrect = normalizeString(correctAnswer);
		const similarity = calculateSimilarity(normalizedUser, normalizedCorrect);
		if (similarity > bestSimilarity) {
			bestSimilarity = similarity;
			bestMatch = correctAnswer;
		}
	}

	if (bestSimilarity >= 85) {
		return {
			isCorrect: false,
			confidence: bestSimilarity,
			feedback: `Muy cerca! Hay un pequeño error. Inténtalo de nuevo.`,
			allowRetry: true,
			hint: `La respuesta esperada es similar a lo que escribiste.`,
		};
	}

	// Moderadamente similar (algunos errores)
	if (bestSimilarity >= 60) {
		return {
			isCorrect: false,
			confidence: bestSimilarity,
			feedback: `Tu respuesta tiene algunos errores. Te damos una segunda oportunidad.`,
			allowRetry: true,
			hint: `Pista: Las respuestas aceptables son: "${answersArray.join('", "')}"`,
		};
	}

	// Contiene palabras clave importantes (usar la mejor coincidencia)
	const normalizedBestMatch = normalizeString(bestMatch);
	const userWords = normalizedUser.split(" ").filter((w) => w.length > 2);
	const correctWords = normalizedBestMatch.split(" ").filter((w) => w.length > 2);
	const matchingWords = userWords.filter((word) => correctWords.includes(word));

	if (matchingWords.length > 0 && matchingWords.length >= correctWords.length * 0.5) {
		return {
			isCorrect: false,
			confidence: 50,
			feedback: `Tu respuesta contiene algunas palabras clave correctas, pero necesita mejoras.`,
			allowRetry: true,
			hint: `La respuesta correcta es: "${bestMatch}"`,
		};
	}

	// Respuesta muy diferente
	return {
		isCorrect: false,
		confidence: bestSimilarity,
		feedback: `Tu respuesta no es correcta.`,
		allowRetry: false,
		hint: `La respuesta correcta es: "${bestMatch}"`,
	};
}

// DOM utilities

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

function clearContainer(container) {
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
}

function shuffleArray(array) {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

// ---
// RENDERIZADO DE PREGUNTAS
// ---

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

function getFillInTheBlankAnswers(container) {
	const inputs = container.querySelectorAll(".fill-blank-input");
	return Array.from(inputs).map((input) => ({
		userAnswer: input.value.trim(),
		correctAnswer: input.getAttribute("data-answer"),
		input: input,
	}));
}

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

// Función auxiliar para limpiar completamente el estado de un elemento matching
function clearMatchingItemState(element) {
	AnswerStateManager.clearState(element);
}

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
				// Limpiar estado anterior
				clearMatchingItemState(selectedLeft);
			}
			selectedLeft = event.target;
			// Limpiar cualquier clase anterior del nuevo elemento seleccionado
			clearMatchingItemState(selectedLeft);
			selectedLeft.classList.add("selected");
			selectedLeft.setAttribute("aria-selected", "true");
		} else {
			if (selectedRight) {
				// Limpiar estado anterior
				clearMatchingItemState(selectedRight);
			}
			selectedRight = event.target;
			// Limpiar cualquier clase anterior del nuevo elemento seleccionado
			clearMatchingItemState(selectedRight);
			selectedRight.classList.add("selected");
			selectedRight.setAttribute("aria-selected", "true");
		}

		if (selectedLeft && selectedRight) {
			const leftValue = selectedLeft.getAttribute("data-value");
			const rightValue = selectedRight.getAttribute("data-value");
			const isCorrect = correctPairs.get(leftValue) === rightValue;

			// Limpiar todas las clases de estado anteriores
			clearMatchingItemState(selectedLeft);
			clearMatchingItemState(selectedRight);

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

				// Guardar referencias antes de limpiarlas
				const leftElement = selectedLeft;
				const rightElement = selectedRight;

				// Después de mostrar el error, limpiar las clases incorrectas
				setTimeout(() => {
					if (leftElement && !leftElement.disabled) {
						clearMatchingItemState(leftElement);
					}
					if (rightElement && !rightElement.disabled) {
						clearMatchingItemState(rightElement);
					}
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

function renderReadingComprehension(container, questionData, mainQuestionIndex, onAnswerSelect) {
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

	// Crear contenedor para el texto de lectura
	const passageContainer = createElement("article", {
		className: "reading-passage",
		attributes: {
			role: "article",
			"aria-labelledby": "reading-title",
		},
	});

	// Procesar el texto de lectura (puede ser array de párrafos o texto único)
	const passageText = createElement("div", {
		className: "passage-text",
	});

	if (questionData.readingText && Array.isArray(questionData.readingText)) {
		// Si es un array de párrafos
		questionData.readingText.forEach((paragraph) => {
			const paragraphElement = createElement("p", {
				textContent: paragraph,
			});
			passageText.appendChild(paragraphElement);
		});
	} else if (questionData.passage) {
		// Si es texto único
		passageText.textContent = questionData.passage;
	}

	passageContainer.appendChild(passageText);

	// Agregar título y pasaje al contenedor principal
	questionSection.appendChild(readingTitle);
	questionSection.appendChild(passageContainer);

	// Procesar las preguntas (puede haber múltiples)
	if (questionData.questions && Array.isArray(questionData.questions)) {
		// Múltiples preguntas dentro del ejercicio
		renderMultipleReadingQuestions(questionSection, questionData.questions, mainQuestionIndex, onAnswerSelect);
	} else if (questionData.answerOptions) {
		// Pregunta única con opciones múltiples
		renderSingleReadingQuestion(questionSection, questionData, onAnswerSelect);
	}

	container.appendChild(questionSection);
}

function renderMultipleReadingQuestions(container, questions, mainQuestionIndex, onAnswerSelect) {
	let currentQuestionIndex = 0;
	let answers = [];

	function showNextReadingQuestion() {
		if (currentQuestionIndex < questions.length) {
			const question = questions[currentQuestionIndex];

			// Actualizar progreso para esta sub-pregunta
			if (window.exerciseSystem && window.exerciseSystem.updateReadingProgress) {
				window.exerciseSystem.updateReadingProgress(currentQuestionIndex, questions.length, mainQuestionIndex);
			}

			// Limpiar pregunta anterior (pero mantener el pasaje)
			const existingQuestion = container.querySelector(".current-reading-question");
			if (existingQuestion) {
				existingQuestion.remove();
			}

			const questionContainer = createElement("div", {
				className: "current-reading-question",
			});

			// Agregar título numerado para la pregunta
			const questionTitle = createElement("h3", {
				className: "comprehension-question-number",
				textContent: `${currentQuestionIndex + 1}. ${question.questionText || question.question}`,
				attributes: { id: `comprehension-question-${currentQuestionIndex}` },
			});
			questionContainer.appendChild(questionTitle);

			// Crear un contenedor para la pregunta individual
			const individualQuestionContainer = createElement("div", {
				className: "individual-question-container",
			});
			questionContainer.appendChild(individualQuestionContainer);

			// Función callback universal para manejar respuestas
			const handleQuestionAnswer = (isCorrect, additionalData = {}) => {
				answers.push({
					questionIndex: currentQuestionIndex,
					isCorrect,
					...additionalData,
				});
				currentQuestionIndex++;

				setTimeout(() => {
					if (currentQuestionIndex < questions.length) {
						showNextReadingQuestion();
					} else {
						// Todas las preguntas respondidas - pasar información detallada
						const correctAnswers = answers.filter((a) => a.isCorrect).length;
						const totalQuestions = questions.length;
						onAnswerSelect({
							isComplete: true,
							correctAnswers,
							totalQuestions,
							allCorrect: correctAnswers === totalQuestions,
						});
					}
				}, 2000);
			};

			// Modificar la pregunta para adaptarla al formato individual
			const adaptedQuestion = {
				...question,
				question: question.questionText || question.question,
			};

			// Reutilizar las funciones existentes según el tipo de pregunta
			switch (question.type) {
				case "multiple_choice":
					renderMultipleChoice(individualQuestionContainer, adaptedQuestion, (isCorrect, selectedIndex) => {
						handleQuestionAnswer(isCorrect, { selectedIndex });
					});
					break;

				case "short_answer":
					renderShortAnswerStandalone(individualQuestionContainer, adaptedQuestion, (isCorrect) => {
						handleQuestionAnswer(isCorrect);
					});
					break;

				case "true_false":
					renderTrueFalse(individualQuestionContainer, adaptedQuestion, (isCorrect) => {
						handleQuestionAnswer(isCorrect);
					});
					break;

				default:
					console.warn(`Tipo de pregunta no soportado en reading comprehension: ${question.type}`);
					// Saltar a la siguiente pregunta si no se reconoce el tipo
					handleQuestionAnswer(false);
					break;
			}

			container.appendChild(questionContainer);
		}
	}

	// Mostrar la primera pregunta
	showNextReadingQuestion();
}

function renderSingleReadingQuestion(container, questionData, onAnswerSelect) {
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
				click: (event) => handleAnswerClick(event, questionData, onAnswerSelect),
			},
		});
		optionsContainer.appendChild(optionButton);
	});

	container.appendChild(questionTitle);
	container.appendChild(optionsContainer);
}

// ---
// FEEDBACK Y UTILIDADES - Refactorizadas para usar sistema unificado
// ---

// Las funciones de feedback ahora usan el sistema unificado
// pero mantenemos compatibilidad hacia atrás

function showFeedback(container, isCorrect, message = "") {
	return showUnifiedFeedback(container, {
		type: "general",
		isCorrect,
		message,
	});
}

function showMatchingFeedback(container, isCorrect, message) {
	return showUnifiedFeedback(container, {
		type: "matching",
		isCorrect,
		message,
	});
}

function showTemporaryFeedback(container, message, isPositive = false) {
	return showUnifiedFeedback(container, {
		type: "temporary",
		isCorrect: isPositive,
		message,
	});
}

function showRetryFeedback(container, answers) {
	return showUnifiedFeedback(container, {
		type: "retry",
		additionalData: { answers },
	});
}

// ---
// RENDERIZADO DE RESULTADOS
// ---

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

function getPerformanceClass(percentage) {
	if (percentage >= 90) return "performance-excellent score-excellent";
	if (percentage >= 70) return "performance-good score-good";
	return "performance-fair score-fair";
}

// ---
// FEEDBACK Y PROGRESS BAR
// ---

function renderTrueFalse(container, questionData, onAnswer) {
	clearContainer(container);

	const questionSection = createElement("section", {
		className: "question-section true-false",
		attributes: { role: "main" },
	});

	const questionTitle = createElement("h2", {
		className: "question-title",
		textContent: questionData.question,
	});

	const optionsContainer = createElement("div", {
		className: "true-false-buttons",
	});

	const trueButton = createElement("button", {
		className: "true-false-button",
		textContent: "Verdadero",
		attributes: { "data-answer": "true" },
		events: {
			click: () => handleTrueFalseAnswer(true, questionData.answer, onAnswer),
		},
	});

	const falseButton = createElement("button", {
		className: "true-false-button",
		textContent: "Falso",
		attributes: { "data-answer": "false" },
		events: {
			click: () => handleTrueFalseAnswer(false, questionData.answer, onAnswer),
		},
	});

	optionsContainer.appendChild(trueButton);
	optionsContainer.appendChild(falseButton);

	questionSection.appendChild(questionTitle);
	questionSection.appendChild(optionsContainer);

	container.appendChild(questionSection);

	function handleTrueFalseAnswer(userAnswer, correctAnswer, callback) {
		// Convertir ambas respuestas a strings para comparación consistente
		const userAnswerStr = String(userAnswer);
		const correctAnswerStr = String(correctAnswer);
		const isCorrect = userAnswerStr === correctAnswerStr;

		trueButton.disabled = true;
		falseButton.disabled = true;

		if (isCorrect) {
			(userAnswer ? trueButton : falseButton).classList.add("correct");
			showFeedback(questionSection, true, questionData.explanation || "¡Correcto!");
		} else {
			(userAnswer ? trueButton : falseButton).classList.add("incorrect");
			(correctAnswerStr === "true" ? trueButton : falseButton).classList.add("correct");
			showFeedback(questionSection, false, questionData.explanation || "Respuesta incorrecta");
		}

		callback(isCorrect);
	}
}

function renderShortAnswerStandalone(container, questionData, onAnswer) {
	clearContainer(container);

	const questionSection = createElement("section", {
		className: "question-section short-answer-standalone",
		attributes: { role: "main" },
	});

	const questionTitle = createElement("h2", {
		className: "question-title",
		textContent: questionData.question,
	});

	const inputContainer = createElement("div", {
		className: "short-answer-container",
	});

	const input = createElement("input", {
		className: "short-answer-input",
		attributes: {
			type: "text",
			placeholder: "Escribe tu respuesta aquí...",
		},
	});

	let attemptCount = 0;
	const maxAttempts = 2;

	const submitButton = createElement("button", {
		className: "short-answer-submit",
		textContent: "Responder",
		events: {
			click: () => handleShortAnswerSubmit(),
		},
	});

	input.addEventListener("keypress", (e) => {
		if (e.key === "Enter" && !input.disabled) {
			handleShortAnswerSubmit();
		}
	});

	function handleShortAnswerSubmit() {
		const userAnswer = input.value.trim();

		if (!userAnswer) {
			showTemporaryFeedback(inputContainer, "Por favor, escribe una respuesta.", false);
			return;
		}

		attemptCount++;

		// Preparar todas las respuestas posibles (correctAnswer + alternatives)
		const allAnswers = [questionData.correctAnswer];
		if (questionData.alternatives && Array.isArray(questionData.alternatives)) {
			allAnswers.push(...questionData.alternatives);
		}

		const analysis = analyzeUserAnswer(userAnswer, allAnswers);

		if (analysis.isCorrect) {
			input.disabled = true;
			submitButton.disabled = true;
			input.classList.add("correct");
			showFeedback(questionSection, true, questionData.explanation || analysis.feedback);
			onAnswer(true);
			return;
		}

		if (analysis.allowRetry && attemptCount < maxAttempts) {
			input.classList.add("warning");
			submitButton.textContent = `Reintenta (${maxAttempts - attemptCount} ${maxAttempts - attemptCount === 1 ? "intento" : "intentos"} restante${maxAttempts - attemptCount === 1 ? "" : "s"})`;
			showTemporaryFeedback(inputContainer, analysis.feedback + " " + (questionData.hints && questionData.hints[0] ? questionData.hints[0] : ""), false);

			setTimeout(() => {
				input.value = "";
				input.classList.remove("warning");
				input.focus();
			}, 2000);
		} else {
			input.disabled = true;
			submitButton.disabled = true;
			input.classList.add("incorrect");

			const finalFeedback = attemptCount >= maxAttempts ? `Se agotaron los intentos. ${questionData.explanation || analysis.hint}` : questionData.explanation || analysis.hint;

			showFeedback(questionSection, false, finalFeedback);
			onAnswer(false);
		}
	}

	inputContainer.appendChild(input);
	inputContainer.appendChild(submitButton);

	questionSection.appendChild(questionTitle);
	questionSection.appendChild(inputContainer);

	container.appendChild(questionSection);

	setTimeout(() => input.focus(), 100);
}

function renderOrdering(container, questionData, onAnswer) {
	clearContainer(container);

	const questionSection = createElement("section", {
		className: "question-section ordering",
		attributes: { role: "main" },
	});

	const questionTitle = createElement("h2", {
		className: "question-title",
		textContent: questionData.question,
	});

	const instructionsText = createElement("p", {
		className: "ordering-instructions",
		textContent: "Haz clic en las palabras para formar la oración en el orden correcto:",
	});

	// Área donde se construye la oración
	const sentenceBuilder = createElement("div", {
		className: "sentence-builder",
	});

	const sentenceBuilderLabel = createElement("p", {
		className: "sentence-builder-label",
		textContent: "Tu oración:",
	});

	const sentenceContainer = createElement("div", {
		className: "sentence-container",
	});

	const sentencePlaceholder = createElement("p", {
		className: "sentence-placeholder",
		textContent: "Haz clic en las palabras de abajo para construir tu oración...",
	});

	sentenceContainer.appendChild(sentencePlaceholder);

	// Contenedor de palabras disponibles
	const wordsContainer = createElement("div", {
		className: "words-container",
	});

	const wordsLabel = createElement("p", {
		className: "words-label",
		textContent: "Palabras disponibles:",
	});

	const wordsGrid = createElement("div", {
		className: "words-grid",
	});

	// Estado del ejercicio
	let selectedWords = [];
	let availableWords = shuffleArray([...questionData.items]);

	// Crear botones de palabras
	function createWordButtons() {
		wordsGrid.innerHTML = "";

		availableWords.forEach((word, index) => {
			const wordButton = createElement("button", {
				className: "word-button",
				textContent: word,
				attributes: {
					"data-word": word,
					"data-index": index,
				},
				events: {
					click: () => selectWord(word, index),
				},
			});
			wordsGrid.appendChild(wordButton);
		});
	}

	// Actualizar la visualización de la oración construida
	function updateSentenceDisplay() {
		sentenceContainer.innerHTML = "";

		if (selectedWords.length === 0) {
			sentenceContainer.appendChild(sentencePlaceholder);
			return;
		}

		selectedWords.forEach((word, index) => {
			const wordChip = createElement("span", {
				className: "sentence-word-chip",
				textContent: word,
				attributes: {
					"data-word": word,
					"data-position": index,
				},
				events: {
					click: () => removeWord(index),
				},
			});

			// Agregar botones de reordenamiento si hay más de una palabra
			if (selectedWords.length > 1) {
				if (index > 0) {
					const moveLeftBtn = createElement("button", {
						className: "move-button move-left",
						textContent: "←",
						attributes: {
							title: "Mover a la izquierda",
						},
						events: {
							click: (e) => {
								e.stopPropagation();
								moveWord(index, index - 1);
							},
						},
					});
					wordChip.appendChild(moveLeftBtn);
				}

				if (index < selectedWords.length - 1) {
					const moveRightBtn = createElement("button", {
						className: "move-button move-right",
						textContent: "→",
						attributes: {
							title: "Mover a la derecha",
						},
						events: {
							click: (e) => {
								e.stopPropagation();
								moveWord(index, index + 1);
							},
						},
					});
					wordChip.appendChild(moveRightBtn);
				}
			}

			sentenceContainer.appendChild(wordChip);
		});
	}

	// Seleccionar una palabra
	function selectWord(word, buttonIndex) {
		selectedWords.push(word);
		availableWords.splice(buttonIndex, 1);
		updateSentenceDisplay();
		createWordButtons();
		updateCheckButton();
	}

	// Remover una palabra de la oración
	function removeWord(wordIndex) {
		const word = selectedWords[wordIndex];
		selectedWords.splice(wordIndex, 1);
		availableWords.push(word);
		availableWords = shuffleArray(availableWords); // Mezclar nuevamente
		updateSentenceDisplay();
		createWordButtons();
		updateCheckButton();
	}

	// Mover una palabra en la oración
	function moveWord(fromIndex, toIndex) {
		const word = selectedWords[fromIndex];
		selectedWords.splice(fromIndex, 1);
		selectedWords.splice(toIndex, 0, word);
		updateSentenceDisplay();
	}

	const checkButton = createElement("button", {
		className: "ordering-check-button",
		textContent: "Comprobar Orden",
		attributes: {
			disabled: "true",
		},
		events: {
			click: () => checkOrderingAnswer(),
		},
	});

	// Actualizar estado del botón de verificación
	function updateCheckButton() {
		if (selectedWords.length === questionData.items.length) {
			checkButton.disabled = false;
			checkButton.classList.remove("disabled");
		} else {
			checkButton.disabled = true;
			checkButton.classList.add("disabled");
		}
	}

	// Inicializar
	createWordButtons();
	updateCheckButton();

	// Ensamblar la interfaz
	sentenceBuilder.appendChild(sentenceBuilderLabel);
	sentenceBuilder.appendChild(sentenceContainer);

	wordsContainer.appendChild(wordsLabel);
	wordsContainer.appendChild(wordsGrid);

	questionSection.appendChild(questionTitle);
	questionSection.appendChild(instructionsText);
	questionSection.appendChild(sentenceBuilder);
	questionSection.appendChild(wordsContainer);
	questionSection.appendChild(checkButton);

	container.appendChild(questionSection);

	container.appendChild(questionSection);

	function checkOrderingAnswer() {
		const userOrder = selectedWords;
		const correctOrder = questionData.correctOrder;

		// Verificar si correctOrder son índices (formato viejo) o palabras directas (formato template)
		const correctSequence =
			Array.isArray(correctOrder) && typeof correctOrder[0] === "number"
				? correctOrder.map((index) => questionData.items[index]) // Formato viejo con índices
				: correctOrder; // Formato template con palabras directas

		// Comparar la secuencia de palabras del usuario con la correcta
		const isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctSequence);

		// Mostrar resultado en las palabras seleccionadas
		const wordChips = sentenceContainer.querySelectorAll(".sentence-word-chip");

		wordChips.forEach((chip, index) => {
			// Deshabilitar botones de movimiento
			const moveButtons = chip.querySelectorAll(".move-button");
			moveButtons.forEach((btn) => btn.remove());

			// Agregar clases de estado comparando con la secuencia correcta
			if (userOrder[index] === correctSequence[index]) {
				chip.classList.add("correct");
			} else {
				chip.classList.add("incorrect");
			}

			// Deshabilitar click para remover
			chip.style.cursor = "default";
			chip.onclick = null;
		});

		// Deshabilitar botones de palabras
		const wordButtons = wordsGrid.querySelectorAll(".word-button");
		wordButtons.forEach((button) => {
			button.disabled = true;
			button.classList.add("disabled");
		});

		checkButton.disabled = true;
		checkButton.classList.add("disabled");
		showFeedback(questionSection, isCorrect, questionData.explanation || (isCorrect ? "¡Orden correcto!" : "El orden no es correcto"));
		onAnswer(isCorrect);
	}
}

function shuffleArray(array) {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

function updateProgressBar(currentQuestion, totalQuestions) {
	const container = document.getElementById("progress-container");

	if (!container) {
		return;
	}

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
