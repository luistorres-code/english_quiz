document.addEventListener("DOMContentLoaded", function () {
	initializeSystem();

	window.exerciseSystem = {
		loadExercise,
		goHome,
		showQuestion,
		nextQuestion,
		updateReadingProgress,
	};
});
