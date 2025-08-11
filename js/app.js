/**
 * Inicialización simple de la aplicación
 */
document.addEventListener("DOMContentLoaded", function () {
	// Inicializar el sistema
	initializeSystem();

	// Hacer algunas funciones globalmente accesibles para depuración
	window.exerciseSystem = {
		loadExercise,
		goHome,
		showQuestion,
		nextQuestion,
	};
});
