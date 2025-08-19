document.addEventListener("DOMContentLoaded", function () {
	initializeSystem();

	// Inicializar navegación entre pestañas
	initializeNavigation();

	// Verificar si hay parámetros de URL para cambiar de pestaña automáticamente
	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get("topic") || urlParams.get("grammar")) {
		switchToTab("grammar");
	}

	window.exerciseSystem = {
		loadExercise,
		goHome,
		showQuestion,
		nextQuestion,
		updateReadingProgress,
	};

	// Exponer funciones para debugging (solo en desarrollo)
	window.debugQuizSystem = {
		calculateTotalQuestions,
		calculateCurrentQuestionNumber,
	};
});

/**
 * Inicializa el sistema de navegación entre pestañas
 */
function initializeNavigation() {
	const exercisesTab = document.getElementById("exercises-tab");
	const grammarTab = document.getElementById("grammar-tab");
	const exercisesSection = document.getElementById("exercises-section");
	const grammarSection = document.getElementById("grammar-section");

	if (!exercisesTab || !grammarTab || !exercisesSection || !grammarSection) {
		console.error("Elementos de navegación no encontrados");
		return;
	}

	// Event listener para pestaña de ejercicios
	exercisesTab.addEventListener("click", () => {
		switchToTab("exercises");
	});

	// Event listener para pestaña de gramática
	grammarTab.addEventListener("click", () => {
		switchToTab("grammar");
	});
}

/**
 * Cambia entre pestañas
 */
function switchToTab(tabName) {
	const exercisesTab = document.getElementById("exercises-tab");
	const grammarTab = document.getElementById("grammar-tab");
	const exercisesSection = document.getElementById("exercises-section");
	const grammarSection = document.getElementById("grammar-section");

	// Resetear estados
	exercisesTab.classList.remove("active");
	grammarTab.classList.remove("active");
	exercisesSection.classList.remove("active");
	grammarSection.classList.remove("active");

	exercisesTab.setAttribute("aria-pressed", "false");
	grammarTab.setAttribute("aria-pressed", "false");

	if (tabName === "exercises") {
		exercisesTab.classList.add("active");
		exercisesSection.classList.add("active");
		exercisesTab.setAttribute("aria-pressed", "true");

		// Limpiar parámetros de gramática de la URL
		const url = new URL(window.location);
		url.searchParams.delete("topic");
		url.searchParams.delete("grammar");
		window.history.pushState({}, "", url);
	} else if (tabName === "grammar") {
		grammarTab.classList.add("active");
		grammarSection.classList.add("active");
		grammarTab.setAttribute("aria-pressed", "true");

		// Limpiar parámetros de ejercicios de la URL
		const url = new URL(window.location);
		url.searchParams.delete("exercise");
		url.searchParams.delete("quiz");
		window.history.pushState({}, "", url);

		// Inicializar gramática si no se ha hecho
		if (typeof initializeGrammarSystem === "function") {
			initializeGrammarSystem();
		}
	}
}
