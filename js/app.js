document.addEventListener("DOMContentLoaded", function () {
	initializeSystem();

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
