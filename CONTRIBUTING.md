# Guía de Contribución

## 📋 Estructura del Proyecto

```
english_quiz/
├── README.md                    # Guía de usuario
├── DOCUMENTATION.md             # Documentación técnica completa
├── CONTRIBUTING.md             # Esta guía
├── quiz_page.html              # Página principal
├── js/
│   ├── app.js                 # Inicialización (mínimo)
│   ├── quiz-system.js         # Lógica y estado global
│   └── quiz-functions.js      # Renderizado y utilidades
├── styles/
│   └── quiz_styles.css        # Estilos glassmorphism
└── model/
    └── *.json                # Datos de ejercicios
```

## 🎯 Filosofía de Código

### Paradigma Funcional

- **Sin clases ni constructores** - Solo funciones puras cuando es posible
- **Estado global mínimo** - Variables globales controladas en `quiz-system.js`
- **Funciones pequeñas** - Una responsabilidad por función
- **Composición sobre herencia** - Combinar funciones simples

### Estilo de Código

- **Nombres descriptivos**: `calculateTotalQuestions()` no `calcTQ()`
- **Comentarios mínimos**: Solo para lógica compleja no obvia
- **Separadores simples**: `// ---` no líneas largas de `=`
- **Documentación externa**: Detalles técnicos en `.md` files

## 🔧 Agregar Nuevo Tipo de Ejercicio

### 1. Crear función de renderizado

```javascript
// En quiz-functions.js
function renderMyNewExercise(container, questionData, callback) {
	clearContainer(container);

	// Tu lógica de renderizado aquí

	// Llamar callback cuando esté completo
	callback(isCorrect);
}
```

### 2. Agregar al switch principal

```javascript
// En quiz-system.js, función showQuestion()
case "my_new_exercise":
    renderMyNewExerciseWrapper(questionData);
    break;
```

### 3. Crear wrapper function

```javascript
// En quiz-system.js
function renderMyNewExerciseWrapper(questionData) {
	renderMyNewExercise(elements.container, questionData, (isCorrect) => {
		if (isCorrect) score++;
		showNextButton();
	});
}
```

### 4. Definir estructura JSON

```json
{
	"questions": [
		{
			"type": "my_new_exercise",
			"question": "Pregunta aquí",
			"customData": "Lo que necesites"
		}
	]
}
```

### 5. Agregar estilos CSS

```css
/* En quiz_styles.css */
.my-new-exercise {
	/* Mantener consistencia con glassmorphism */
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(10px);
	border-radius: 12px;
}
```

## 🎨 Convenciones de Diseño

### Glassmorphism Pattern

```css
.component {
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 12px;
}
```

### Gradiente Principal

```css
background: linear-gradient(135deg, #667eea 0%, #8b9ddc 100%);
```

### Estados de Respuesta

- **Correcto**: `#4caf50` (verde)
- **Warning/Cerca**: `#ff9800` (naranja)
- **Incorrecto**: `#f44336` (rojo)

## 📝 Convenciones de Naming

### JavaScript

- **Funciones**: `camelCase` descriptivo (`showQuestion`, `renderMultipleChoice`)
- **Variables**: `camelCase` con contexto (`currentQuestionIndex`, `selectedMatchingItems`)
- **Constantes**: `UPPER_CASE` para valores inmutables
- **Event handlers**: `handle` prefix (`handleAnswerClick`)

### CSS

- **Classes**: `kebab-case` semántico (`.question-section`, `.answer-button`)
- **States**: `.correct`, `.incorrect`, `.warning`
- **Containers**: `.quiz-container`, `.matching-columns`

### Files

- **JavaScript**: `kebab-case.js` (`quiz-functions.js`)
- **CSS**: `kebab-case.css` (`quiz_styles.css`)
- **JSON**: `kebab-case.json` (`passive-voice-quiz.json`)

## 🧪 Testing

### Debug Functions

```javascript
// Disponible en window.exerciseSystem
window.exerciseSystem.loadExercise("test-file.json");
window.exerciseSystem.showQuestion(2);
```

### Estructura de Testing

```javascript
// Crear test-data.json para probar
{
  "title": "Test Exercise",
  "questions": [
    {
      "type": "your_exercise_type",
      // ... datos de prueba
    }
  ]
}
```

## 🔍 Análisis de Respuestas

### Para Respuestas de Texto

Si tu ejercicio usa texto libre, aprovecha el sistema inteligente:

```javascript
const analysis = analyzeUserAnswer(userInput, correctAnswer);

if (analysis.isCorrect) {
	// Correcto
} else if (analysis.allowRetry) {
	// Permitir segundo intento
	showTemporaryFeedback(container, analysis.feedback);
} else {
	// Incorrecto final
	showFeedback(container, false, analysis.hint);
}
```

### Umbrales Personalizables

Puedes crear tu propia función de análisis basada en `analyzeUserAnswer()` si necesitas lógica específica.

## 📦 Pull Request Guidelines

### Antes de Enviar

1. ✅ Código funciona sin errores de consola
2. ✅ Responsive design mantiene funcionalidad
3. ✅ Estilos consistentes con glassmorphism
4. ✅ Comentarios mínimos, solo los necesarios
5. ✅ Documentación actualizada si es necesario

### Estructura de Commit

```
tipo: descripción breve

Descripción más detallada si es necesario.

- Cambio específico 1
- Cambio específico 2
```

**Tipos de commit:**

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `style:` Cambios de diseño/CSS
- `refactor:` Mejora de código sin nuevas features
- `docs:` Actualización de documentación
- `test:` Agregar tests

### Ejemplo

```
feat: agregar ejercicios de pronunciación

Implementa nuevo tipo de ejercicio para practicar pronunciación
con grabación de audio y análisis de precisión.

- Renderizado de interfaz de grabación
- Análisis básico de audio
- Feedback visual de precisión
- Estilos consistentes con diseño actual
```

## 🚀 Deployment

### Testing Local

```bash
cd english_quiz
python3 -m http.server 8000
open http://localhost:8000/quiz_page.html
```

### Validación Final

1. Probar todos los tipos de ejercicios
2. Verificar responsive design
3. Comprobar accesibilidad básica
4. Testing en diferentes navegadores

## 🤝 Comunidad

### Preguntas o Ideas

- Crear issue en GitHub con tag apropiado
- Discutir cambios grandes antes de implementar
- Proponer mejoras de UX/UI

### Code Review

- Revisar por legibilidad y mantenibilidad
- Verificar consistencia con patrones existentes
- Comprobar que no rompe funcionalidad existente

---

¡Gracias por contribuir a mejorar la experiencia de aprendizaje de inglés! 🎓
