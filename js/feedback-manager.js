/**
 * Feedback Manager - Sistema unificado de feedback
 * Refactorización para centralizar todas las funciones de feedback
 */

// Función auxiliar para limpiar contenedores (si no está disponible globalmente)
function clearContainer(container) {
	if (container && typeof container.replaceChildren === "function") {
		container.replaceChildren();
	} else if (container) {
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
	}
}

// Función auxiliar createElement (si no está disponible globalmente)
function createElement(tag, options = {}) {
	const element = document.createElement(tag);

	// Agregar clases
	if (options.className) {
		element.className = options.className;
	}

	// Agregar contenido de texto
	if (options.textContent) {
		element.textContent = options.textContent;
	}

	// Agregar HTML interno
	if (options.innerHTML) {
		element.innerHTML = options.innerHTML;
	}

	// Agregar atributos
	if (options.attributes) {
		Object.entries(options.attributes).forEach(([key, value]) => {
			element.setAttribute(key, value);
		});
	}

	// Agregar event listeners
	if (options.events) {
		Object.entries(options.events).forEach(([event, handler]) => {
			element.addEventListener(event, handler);
		});
	}

	return element;
}

// Configuraciones por defecto para diferentes tipos de feedback
const FEEDBACK_CONFIG = {
	general: {
		duration: 0, // Permanente hasta que se remueva manualmente
		className: "feedback",
		role: "alert",
		ariaLive: "polite",
	},
	matching: {
		duration: 5000,
		className: "matching-feedback",
		role: "status",
		ariaLive: "polite",
	},
	temporary: {
		duration: 5000,
		className: "temporary-feedback",
		role: "status",
		ariaLive: "polite",
	},
	retry: {
		duration: 8000,
		className: "retry-feedback",
		role: "alert",
		ariaLive: "assertive",
	},
};

/**
 * Sistema unificado de feedback
 * @param {HTMLElement} container - Contenedor donde mostrar el feedback
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.isCorrect - Si la respuesta es correcta
 * @param {string} options.message - Mensaje a mostrar
 * @param {string} options.type - Tipo de feedback ('general', 'matching', 'temporary', 'retry')
 * @param {number} options.duration - Duración en ms (opcional)
 * @param {Object} options.additionalData - Datos adicionales específicos del tipo
 */
function showUnifiedFeedback(container, options = {}) {
	const { isCorrect = false, message = "", type = "general", duration, additionalData = {} } = options;

	const config = FEEDBACK_CONFIG[type] || FEEDBACK_CONFIG.general;
	const finalDuration = duration !== undefined ? duration : config.duration;

	// Usar el área de feedback prominente si está disponible y es un quiz activo
	const feedbackArea = document.getElementById("feedback-area");
	const progressContainer = document.getElementById("progress-container");
	const isQuizActive = progressContainer && progressContainer.style.display !== "none";

	const targetContainer = feedbackArea && isQuizActive ? feedbackArea : container;

	// Mostrar el área de feedback si se va a usar
	if (targetContainer === feedbackArea) {
		feedbackArea.style.display = "block";
		// Limpiar contenido anterior
		clearContainer(feedbackArea);
	} else {
		// Remover feedback anterior del mismo tipo en el contenedor original
		const existingFeedback = container.querySelector(`.${config.className}`);
		if (existingFeedback) {
			existingFeedback.remove();
		}
	}

	// Crear elemento de feedback según el tipo
	let feedbackElement;

	switch (type) {
		case "retry":
			feedbackElement = createRetryFeedback(message, additionalData, config);
			break;
		case "matching":
			feedbackElement = createMatchingFeedback(isCorrect, message, config);
			break;
		case "temporary":
			feedbackElement = createTemporaryFeedback(message, isCorrect, config);
			break;
		case "general":
		default:
			feedbackElement = createGeneralFeedback(isCorrect, message, config);
			break;
	}

	// Agregar al contenedor target
	targetContainer.appendChild(feedbackElement);

	// Mostrar con animación si es necesario
	if (type === "general") {
		requestAnimationFrame(() => {
			feedbackElement.style.display = "block";
		});
	}

	// Auto-remover después del tiempo especificado
	if (finalDuration > 0) {
		setTimeout(() => {
			if (feedbackElement && feedbackElement.parentNode) {
				feedbackElement.remove();
				// Ocultar el área de feedback si está vacía
				if (targetContainer === feedbackArea && !feedbackArea.hasChildNodes()) {
					feedbackArea.style.display = "none";
				}
			}
		}, finalDuration);
	}

	return feedbackElement;
}

/**
 * Crea feedback general (reemplaza showFeedback)
 */
function createGeneralFeedback(isCorrect, message, config) {
	const feedbackContainer = createElement("div", {
		className: `${config.className} ${isCorrect ? "correct" : "incorrect"}`,
		attributes: {
			role: config.role,
			"aria-live": config.ariaLive,
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

	return feedbackContainer;
}

/**
 * Crea feedback para matching (reemplaza showMatchingFeedback)
 */
function createMatchingFeedback(isCorrect, message, config) {
	return createElement("div", {
		className: `${config.className} ${isCorrect ? "correct" : "incorrect"}`,
		textContent: message,
		attributes: {
			role: config.role,
			"aria-live": config.ariaLive,
		},
	});
}

/**
 * Crea feedback temporal (reemplaza showTemporaryFeedback)
 */
function createTemporaryFeedback(message, isPositive, config) {
	return createElement("div", {
		className: `${config.className} ${isPositive ? "positive" : "negative"}`,
		textContent: message,
	});
}

/**
 * Crea feedback de reintento (reemplaza showRetryFeedback)
 */
function createRetryFeedback(message, additionalData, config) {
	const { answers = [] } = additionalData;

	const retryFeedback = createElement("div", {
		className: config.className,
	});

	const retryMessage = createElement("p", {
		className: "retry-message",
		textContent: message || "Tienes una segunda oportunidad. Revisa tus respuestas:",
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

	return retryFeedback;
}

/**
 * Limpia el área de feedback prominente
 */
function clearFeedbackArea() {
	const feedbackArea = document.getElementById("feedback-area");
	if (feedbackArea) {
		feedbackArea.style.display = "none";
		clearContainer(feedbackArea);
	}
}

/**
 * Oculta cualquier feedback activo en un contenedor específico
 */
function hideFeedback(container) {
	if (!container) return;

	const feedbackElements = container.querySelectorAll(".feedback, .matching-feedback, .temporary-feedback, .retry-feedback");
	feedbackElements.forEach((element) => {
		element.remove();
	});

	// Si es el área de feedback prominente, ocultarla
	const feedbackArea = document.getElementById("feedback-area");
	if (container === feedbackArea) {
		feedbackArea.style.display = "none";
	}
}

// Hacer funciones disponibles globalmente
window.showUnifiedFeedback = showUnifiedFeedback;
window.clearFeedbackArea = clearFeedbackArea;
window.hideFeedback = hideFeedback;
