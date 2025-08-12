# 🔧 Guía de Uso Post-Refactorización

## 📚 Cómo Usar el Código Refactorizado

### 🎯 Sistema Unificado de Feedback

**Para mostrar cualquier tipo de feedback:**

```javascript
// Feedback general (reemplaza showFeedback)
showUnifiedFeedback(container, {
	type: "general",
	isCorrect: true,
	message: "¡Excelente trabajo!",
	duration: 0, // Permanente
});

// Feedback temporal (reemplaza showTemporaryFeedback)
showUnifiedFeedback(container, {
	type: "temporary",
	isCorrect: false,
	message: "Inténtalo de nuevo",
	duration: 3000, // 3 segundos
});

// Feedback de matching (reemplaza showMatchingFeedback)
showUnifiedFeedback(container, {
	type: "matching",
	isCorrect: true,
	message: "¡Emparejamiento correcto!",
});

// Feedback de reintento (reemplaza showRetryFeedback)
showUnifiedFeedback(container, {
	type: "retry",
	additionalData: { answers: answersArray },
});
```

**Funciones de compatibilidad (siguen funcionando igual):**

```javascript
showFeedback(container, true, "Correcto!");
showMatchingFeedback(container, false, "Incorrecto");
showTemporaryFeedback(container, "Mensaje temporal", true);
showRetryFeedback(container, answers);
```

### 🎨 Sistema Unificado de Renderizado

**Para renderizar cualquier tipo de ejercicio:**

```javascript
// Renderizado unificado (reemplaza todas las funciones wrapper)
const context = {
	container: elements.container,
	elements: elements,
	currentQuestionIndex: currentQuestionIndex,
	questionData: questionData,
};

renderUnifiedExercise("multiple_choice", questionData, context, (result) => {
	// Callback automático - el puntaje ya se maneja internamente
	console.log("Ejercicio completado:", result);
});
```

**Para agregar un nuevo tipo de ejercicio:**

```javascript
// 1. Agregar configuración en js/exercise-renderer.js
EXERCISE_CONFIG.my_new_exercise = {
	renderFunction: "renderMyNewExercise", // Función en quiz-functions.js
	requiresManualCheck: false,
	callback: (isCorrect) => ({ isCorrect }),
};

// 2. ¡Eso es todo! El sistema unificado se encarga del resto
```

### 🖥️ Sistema Unificado de UI

**Para manejar estados de interfaz:**

```javascript
// Mostrar/ocultar elementos
showButton(elements.nextButton);
hideButton(elements.homeButton);
showContainer(elements.container);
hideContainer(elements.scoreDisplay);

// Estados complejos con el manager
ExerciseElementsManager.showExerciseInterface(elements);
ExerciseElementsManager.showHomeInterface(elements);
ExerciseElementsManager.showResultsInterface(elements);

// Estados de respuestas
AnswerStateManager.markAsCorrect(inputElement);
AnswerStateManager.markAsIncorrect(inputElement);
AnswerStateManager.clearState(inputElement);
```

**Configuración avanzada:**

```javascript
// Sistema universal para cualquier elemento
manageUIState([button1, button2], "button", "disable", {
	className: { add: "custom-disabled-class" },
});
```

## 🔄 Migración Paso a Paso

### Si estás agregando nueva funcionalidad:

1. **Usa los sistemas unificados** directamente
2. **Evita** crear funciones wrapper nuevas
3. **Configura** en lugar de duplicar código

### Si estás manteniendo código existente:

1. **No cambies nada** - todo sigue funcionando
2. **Opcional:** Migra gradualmente usando `showUnifiedFeedback`
3. **Beneficio:** Menos código para mantener

## 🎯 Patrones Recomendados

### ✅ Hacer esto:

```javascript
// Usar sistemas unificados para nueva funcionalidad
showUnifiedFeedback(container, { type: "general", isCorrect: true });
renderUnifiedExercise("matching", data, context, callback);
ExerciseElementsManager.showExerciseInterface(elements);
```

### ❌ Evitar esto:

```javascript
// No crear nuevas funciones wrapper
function renderMyExercise(data) {
	renderMyExerciseType(container, data, (result) => {
		if (result) score++;
		showNextButton();
	});
}

// No duplicar lógica de feedback
function showMyCustomFeedback(container, message) {
	const feedback = createElement("div", {
		/*...*/
	});
	// ... lógica duplicada
}
```

## 📋 Checklist para Desarrolladores

### Antes de agregar nueva funcionalidad:

- [ ] ¿Existe ya una función unificada para esto?
- [ ] ¿Puedo usar configuración en lugar de código nuevo?
- [ ] ¿Mi cambio beneficiará otras partes del código?

### Al usar el código refactorizado:

- [ ] Importo los scripts en el orden correcto
- [ ] Uso los sistemas unificados para nueva funcionalidad
- [ ] Mantengo compatibilidad hacia atrás cuando sea necesario
- [ ] Documento cualquier configuración personalizada

## 🔍 Debugging

### Problemas comunes y soluciones:

**"showUnifiedFeedback is not defined"**

- ✅ Verifica que `feedback-manager.js` se carga antes que tu código

**"ExerciseElementsManager is not defined"**

- ✅ Verifica que `ui-state-manager.js` se carga antes que tu código

**"Función original no funciona"**

- ✅ Todas las funciones originales mantienen compatibilidad 100%
- ✅ Verifica orden de carga de scripts en HTML

### Logs útiles para debugging:

```javascript
// Ver configuración de ejercicio
console.log(EXERCISE_CONFIG["multiple_choice"]);

// Ver estado de elementos
console.log(elements);

// Debug feedback
showUnifiedFeedback(container, {
	type: "general",
	isCorrect: true,
	message: "Test message",
});
```

## 📈 Medición de Beneficios

### Métricas a seguir:

- **Tiempo de desarrollo:** ¿Cuánto menos tardas en implementar funcionalidad similar?
- **Bugs reducidos:** ¿Cuántos menos bugs por lógica duplicada?
- **Mantenimiento:** ¿Cuántos archivos necesitas cambiar para updates?

### Antes vs Después:

```javascript
// ANTES: Agregar nuevo feedback requería ~20 líneas
function showMyFeedback(container, isCorrect, message) {
	const existingFeedback = container.querySelector(".my-feedback");
	if (existingFeedback) existingFeedback.remove();

	const feedback = createElement("div", {
		className: `my-feedback ${isCorrect ? "correct" : "incorrect"}`,
		attributes: { role: "alert", "aria-live": "polite" },
	});

	const title = createElement("strong", {
		textContent: isCorrect ? "¡Correcto!" : "Incorrecto.",
	});

	if (message) {
		const msg = createElement("div", {
			className: "feedback-details",
			textContent: message,
		});
		feedback.appendChild(msg);
	}

	feedback.appendChild(title);
	container.appendChild(feedback);
}

// DESPUÉS: Agregar nuevo feedback requiere ~3 líneas
showUnifiedFeedback(container, {
	type: "general",
	isCorrect: true,
	message: "Mi mensaje personalizado",
});
```

---

**¡Disfruta del código más limpio y mantenible! 🚀**
