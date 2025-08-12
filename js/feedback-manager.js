/**
 * Feedback Manager - Sistema unificado de feedback
 * Refactorización para centralizar todas las funciones de feedback
 */

// Configuraciones por defecto para diferentes tipos de feedback
const FEEDBACK_CONFIG = {
	general: {
		duration: 0, // Permanente hasta que se remueva manualmente
		className: "feedback",
		role: "alert",
		ariaLive: "polite",
	},
	matching: {
		duration: 3000,
		className: "matching-feedback",
		role: "status",
		ariaLive: "polite",
	},
	temporary: {
		duration: 3000,
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

	// Remover feedback anterior del mismo tipo
	const existingFeedback = container.querySelector(`.${config.className}`);
	if (existingFeedback) {
		existingFeedback.remove();
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

	// Agregar al contenedor
	container.appendChild(feedbackElement);

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

// Funciones de conveniencia para mantener compatibilidad hacia atrás
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

// Hacer funciones disponibles globalmente
window.showUnifiedFeedback = showUnifiedFeedback;
window.showFeedback = showFeedback;
window.showMatchingFeedback = showMatchingFeedback;
window.showTemporaryFeedback = showTemporaryFeedback;
window.showRetryFeedback = showRetryFeedback;
