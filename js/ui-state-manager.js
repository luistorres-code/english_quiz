/**
 * UI State Manager - Manejo unificado del estado de la interfaz
 * Refactorización para centralizar operaciones repetitivas de UI
 */

/**
 * Configuraciones para diferentes estados de elementos UI
 */
const UI_STATE_CONFIG = {
	button: {
		show: { display: "block" },
		hide: { display: "none" },
		enable: { disabled: false, className: { remove: "disabled" } },
		disable: { disabled: true, className: { add: "disabled" } },
	},
	container: {
		show: { display: "block", "aria-hidden": "false" },
		hide: { display: "none", "aria-hidden": "true" },
	},
	progressBar: {
		show: { display: "block", "aria-hidden": "false" },
		hide: { display: "none", "aria-hidden": "true" },
	},
};

/**
 * Gestiona el estado de elementos UI de forma unificada
 * @param {HTMLElement|NodeList|Array} elements - Elemento(s) a modificar
 * @param {string} elementType - Tipo de elemento ('button', 'container', 'progressBar')
 * @param {string} action - Acción a realizar ('show', 'hide', 'enable', 'disable')
 * @param {Object} customOptions - Opciones personalizadas adicionales
 */
function manageUIState(elements, elementType, action, customOptions = {}) {
	// Normalizar elements a array
	const elementArray = Array.isArray(elements) ? elements : elements instanceof NodeList ? Array.from(elements) : [elements].filter(Boolean);

	if (elementArray.length === 0) return;

	const config = UI_STATE_CONFIG[elementType];
	if (!config || !config[action]) {
		console.warn(`Configuración no encontrada para ${elementType}.${action}`);
		return;
	}

	const stateConfig = { ...config[action], ...customOptions };

	elementArray.forEach((element) => {
		applyStateToElement(element, stateConfig);
	});
}

/**
 * Aplica configuración de estado a un elemento individual
 * @param {HTMLElement} element - Elemento a modificar
 * @param {Object} stateConfig - Configuración de estado a aplicar
 */
function applyStateToElement(element, stateConfig) {
	if (!element) return;

	// Aplicar propiedades de estilo
	Object.entries(stateConfig).forEach(([key, value]) => {
		if (key === "className") {
			handleClassNameChanges(element, value);
		} else if (key === "disabled") {
			element.disabled = value;
		} else if (key === "aria-hidden") {
			element.setAttribute("aria-hidden", value);
		} else {
			// Propiedades de estilo
			element.style[key] = value;
		}
	});
}

/**
 * Maneja cambios de clases CSS
 * @param {HTMLElement} element - Elemento a modificar
 * @param {Object|string} classConfig - Configuración de clases
 */
function handleClassNameChanges(element, classConfig) {
	if (typeof classConfig === "string") {
		element.className = classConfig;
	} else if (typeof classConfig === "object") {
		if (classConfig.add) {
			const classes = Array.isArray(classConfig.add) ? classConfig.add : [classConfig.add];
			element.classList.add(...classes);
		}
		if (classConfig.remove) {
			const classes = Array.isArray(classConfig.remove) ? classConfig.remove : [classConfig.remove];
			element.classList.remove(...classes);
		}
		if (classConfig.toggle) {
			const classes = Array.isArray(classConfig.toggle) ? classConfig.toggle : [classConfig.toggle];
			classes.forEach((cls) => element.classList.toggle(cls));
		}
	}
}

/**
 * Funciones de conveniencia específicas para elementos comunes
 */

// Manejo de botones
function showButton(buttons) {
	manageUIState(buttons, "button", "show");
}

function hideButton(buttons) {
	manageUIState(buttons, "button", "hide");
}

function enableButton(buttons) {
	manageUIState(buttons, "button", "enable");
}

function disableButton(buttons) {
	manageUIState(buttons, "button", "disable");
}

// Manejo de contenedores
function showContainer(containers) {
	manageUIState(containers, "container", "show");
}

function hideContainer(containers) {
	manageUIState(containers, "container", "hide");
}

// Manejo de barras de progreso
function showProgressBar(progressBars) {
	manageUIState(progressBars, "progressBar", "show");
}

function hideProgressBar(progressBars) {
	manageUIState(progressBars, "progressBar", "hide");
}

/**
 * Funciones específicas para mantener compatibilidad con el código existente
 */
function showNextButton(nextButton) {
	if (nextButton) {
		showButton(nextButton);
		enableButton(nextButton);
	}
}

function hideNextButton(nextButton) {
	hideButton(nextButton);
}

function disableNextButton(nextButton) {
	disableButton(nextButton);
}

function hideCheckButton(container) {
	if (container) {
		const checkButton = container.querySelector(".check-button");
		hideButton(checkButton);
	}
}

/**
 * Gestor de estados de elementos de ejercicio
 */
const ExerciseElementsManager = {
	/**
	 * Configura interfaz para mostrar ejercicio
	 */
	showExerciseInterface(elements) {
		showContainer(elements.container);
		showButton(elements.homeButton);
		hideContainer(elements.selectorDiv);
	},

	/**
	 * Configura interfaz para mostrar el home
	 */
	showHomeInterface(elements) {
		hideButton(elements.homeButton);
		showContainer(elements.selectorDiv);
		hideContainer([elements.container, elements.scoreDisplay]);
		hideProgressBar(elements.progressContainer);

		// Restaurar estado inicial completo
		this.restoreInitialState(elements);
	},

	/**
	 * Configura interfaz para mostrar resultados
	 */
	showResultsInterface(elements) {
		hideContainer(elements.container);
		hideButton(elements.nextButton);
		hideProgressBar(elements.progressContainer);
		showContainer(elements.scoreDisplay);
	},

	/**
	 * Resetea estado de ejercicio
	 */
	resetExerciseState(elements) {
		clearContainer(elements.container);
		hideButton(elements.nextButton);
		hideContainer(elements.scoreDisplay);
		clearContainer(elements.scoreDisplay);

		// Restaurar estado inicial completo
		this.restoreInitialState(elements);
	},

	/**
	 * Restaura el estado inicial completo de la interfaz
	 */
	restoreInitialState(elements) {
		// Restaurar quiz-selector al estado inicial
		if (elements.selectorDiv) {
			// Eliminar cualquier estilo inline que pueda haber sido agregado
			elements.selectorDiv.removeAttribute("style");

			// Asegurar que tenga sus clases CSS correctas
			if (!elements.selectorDiv.classList.contains("quiz-selector")) {
				elements.selectorDiv.classList.add("quiz-selector");
			}
		}

		// Restaurar select y botón de carga
		if (elements.selector) {
			elements.selector.value = "";
			elements.selector.disabled = false;
		}

		if (elements.loadButton) {
			elements.loadButton.disabled = false;
			elements.loadButton.style.display = "";
		}

		// Restaurar contenedor principal
		const quizContainer = document.querySelector(".quiz-container");
		if (quizContainer) {
			quizContainer.removeAttribute("style");
		}

		// Limpiar cualquier mensaje de error
		if (elements.container) {
			const errorMessages = elements.container.querySelectorAll(".error-message");
			errorMessages.forEach((error) => error.remove());
		}
	},
};

/**
 * Gestor de estados visuales para elementos de respuesta
 */
const AnswerStateManager = {
	/**
	 * Marca elemento como correcto
	 */
	markAsCorrect(element) {
		if (element) {
			element.classList.add("correct");
			element.classList.remove("incorrect", "warning");
		}
	},

	/**
	 * Marca elemento como incorrecto
	 */
	markAsIncorrect(element) {
		if (element) {
			element.classList.add("incorrect");
			element.classList.remove("correct", "warning");
		}
	},

	/**
	 * Marca elemento con advertencia (para reintentos)
	 */
	markAsWarning(element) {
		if (element) {
			element.classList.add("warning");
			element.classList.remove("correct", "incorrect");
		}
	},

	/**
	 * Limpia estado visual del elemento
	 */
	clearState(element) {
		if (element) {
			element.classList.remove("correct", "incorrect", "warning", "selected");
			element.setAttribute("aria-selected", "false");
		}
	},

	/**
	 * Deshabilita elemento
	 */
	disable(element) {
		if (element) {
			element.disabled = true;
			element.classList.add("disabled");
		}
	},

	/**
	 * Habilita elemento
	 */
	enable(element) {
		if (element) {
			element.disabled = false;
			element.classList.remove("disabled");
		}
	},
};

/**
 * Funciones de conveniencia para mantener compatibilidad
 */

// Funciones originales refactorizadas
function clearContainer(container) {
	if (container) {
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
	}
}

function showError(message, container) {
	if (!container) return;

	clearContainer(container);

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
	container.appendChild(errorElement);
	showContainer(container);
}

function showTemporaryMessage(message, duration = 3000) {
	console.log(message); // Placeholder - se puede mejorar con un toast

	// TODO: Implementar sistema de toast unificado
	// const toast = createToast(message, duration);
	// document.body.appendChild(toast);
}

// Hacer funciones y objetos disponibles globalmente
window.manageUIState = manageUIState;
window.ExerciseElementsManager = ExerciseElementsManager;
window.AnswerStateManager = AnswerStateManager;
window.showButton = showButton;
window.hideButton = hideButton;
window.enableButton = enableButton;
window.disableButton = disableButton;
window.showContainer = showContainer;
window.hideContainer = hideContainer;
window.showProgressBar = showProgressBar;
window.hideProgressBar = hideProgressBar;
window.showNextButton = showNextButton;
window.hideNextButton = hideNextButton;
window.disableNextButton = disableNextButton;
window.hideCheckButton = hideCheckButton;
window.clearContainer = clearContainer;
window.showError = showError;
window.showTemporaryMessage = showTemporaryMessage;
