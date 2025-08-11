# English Quiz App - Documentación Técnica

## 📋 Descripción General

Sistema interactivo de ejercicios para aprender inglés con enfoque funcional, diseño glassmorphism y análisis inteligente de respuestas, todo esto hecho para mi Medusín.

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos

```
english_quiz/
├── quiz_page.html              # Estructura principal HTML
├── js/
│   ├── app.js                 # Inicialización de la aplicación
│   ├── quiz-system.js         # Lógica principal y manejo de estado
│   └── quiz-functions.js      # Funciones de renderizado y utilidades
├── styles/
│   └── quiz_styles.css        # Estilos con diseño glassmorphism
└── model/
    ├── passive-voice-quiz.json
    ├── verbs-and-verbs-forms.json
    ├── relative-pronouns.json
    ├── general-vocabulary.json
    ├── comunications-common-phrases.json
    ├── mixed-exercises-quiz.json
    └── reading-comprehension-example.json
```

### Paradigma de Programación

**Funcional**: Todo el código usa funciones puras, evita clases y constructores, y maneja estado a través de variables globales controladas.

## 🎯 Tipos de Ejercicios Soportados

### 1. Multiple Choice

- Preguntas con opciones múltiples
- Una respuesta correcta por pregunta
- Feedback visual inmediato

### 2. Matching

- Emparejar elementos de dos columnas
- Soporte para estructuras de datos `text1/text2` y `left/right`
- Drag and drop o click para emparejar

### 3. Reading Comprehension

- Texto de lectura + múltiples sub-preguntas
- Soporte para preguntas de respuesta corta y múltiple opción
- Progreso granular por sub-pregunta

### 4. Fill in the Blanks

- Completar espacios en blanco
- Múltiples respuestas posibles por pregunta
- Validación tolerante a errores menores

### 5. True/False

- Preguntas de verdadero/falso
- Botones interactivos con feedback visual
- Explicaciones detalladas para cada respuesta

### 6. Short Answer (Standalone)

- Respuestas cortas independientes
- Análisis inteligente de similitud integrado
- Soporte para múltiples respuestas válidas
- Sistema de retry con hints

### 7. Ordering

- Ordenar elementos mediante drag & drop
- Validación de secuencia correcta
- Feedback visual durante el arrastre
- Soporte para palabras, frases o cualquier elemento

## 🧠 Sistema de Análisis Inteligente de Respuestas

### Algoritmo de Levenshtein

Calcula la distancia de edición entre strings para detectar typos y errores menores.

**Fórmula de Similitud:**

```
Similitud = ((Longitud_máxima - Distancia) / Longitud_máxima) × 100
```

### Umbrales de Tolerancia

- **≥85%**: Typo menor → Permite reintento con encouragement
- **≥60%**: Algunos errores → Reintento con pista específica
- **≥50% palabras clave**: Concepto correcto → Reintento con respuesta
- **<50%**: Muy diferente → Sin reintento, respuesta completa

### Normalización de Texto

1. Conversión a minúsculas
2. Eliminación de acentos (NFD normalization)
3. Remoción de puntuación
4. Normalización de espacios

### Sistema de Reintentos

- Máximo 2 intentos por pregunta
- Feedback progresivo más específico
- Estado visual diferenciado (correcto/warning/incorrecto)

## 🎨 Sistema de Diseño

### Glassmorphism

- Fondos con `backdrop-filter: blur()`
- Bordes semi-transparentes
- Gradientes sutiles
- Efectos de hover y focus

### Colores Principales

```css
/* Gradiente principal */
background: linear-gradient(135deg, #667eea 0%, #8b9ddc 100%);

/* Estados de respuesta */
--correct: #4caf50
--warning: #ff9800
--incorrect: #f44336
```

### Tipografía

- Fuente principal: Inter (400, 500, 600)
- Importada desde Google Fonts

## ⚡ Flujo de Datos

### Inicialización

1. `DOMContentLoaded` → `initializeSystem()`
2. Configuración de event listeners
3. Inicialización de referencias DOM
4. Parsing de URL parameters

### Carga de Ejercicios

1. Selección desde dropdown
2. Fetch del archivo JSON correspondiente
3. Validación de estructura de datos
4. Inicialización de variables de estado

### Renderizado

1. `showQuestion()` determina tipo de ejercicio
2. Función de renderizado específica
3. Creación de DOM elements con `createElement()`
4. Configuración de event listeners

### Evaluación de Respuestas

1. Captura de input del usuario
2. Análisis inteligente vs respuesta correcta
3. Determinación de feedback apropiado
4. Actualización de UI y estado

## 🔧 API Principal

### Funciones de Sistema (`quiz-system.js`)

```javascript
initializeSystem(); // Inicializa la aplicación
loadExercise(filename); // Carga ejercicio desde JSON
showQuestion(index); // Renderiza pregunta actual
nextQuestion(); // Avanza a siguiente pregunta
showResults(); // Muestra resultados finales
```

### Funciones de Renderizado (`quiz-functions.js`)

```javascript
renderMultipleChoice(container, data, callback);
renderMatching(container, data, callback);
renderReadingComprehension(container, data, index, callback);
renderFillInTheBlanks(container, data, callback);
```

### Funciones de Análisis

```javascript
analyzeUserAnswer(userAnswer, correctAnswer); // Análisis inteligente
levenshteinDistance(str1, str2); // Distancia de edición
calculateSimilarity(str1, str2); // Porcentaje de similitud
normalizeString(str); // Normalización de texto
```

### Utilidades DOM

```javascript
createElement(tag, options); // Creación segura de elementos
clearContainer(container); // Limpieza de contenedores
showFeedback(container, isCorrect, message);
```

## 🎚️ Variables de Estado Global

```javascript
let exerciseData = null; // Datos del ejercicio actual
let currentQuestionIndex = 0; // Índice de pregunta actual
let score = 0; // Puntuación acumulada
let selectedMatchingItems = []; // Items seleccionados en matching
let elements = {}; // Referencias DOM
```

## 📊 Manejo de Progreso

### Cálculo Inteligente

El sistema calcula correctamente el progreso considerando sub-preguntas en ejercicios de comprensión lectora:

```javascript
calculateTotalQuestions(exerciseData); // Total real de preguntas
calculateCurrentQuestionNumber(data, index); // Número actual considerando sub-preguntas
updateReadingProgress(subIndex, total, mainIndex); // Progreso específico para reading
```

## 🔍 Estructura de Datos JSON

### Ejercicio Básico

```json
{
	"title": "Título del ejercicio",
	"description": "Descripción",
	"questions": [
		{
			"type": "multiple_choice",
			"question": "¿Pregunta?",
			"answerOptions": [
				{ "text": "Opción 1", "isCorrect": true },
				{ "text": "Opción 2", "isCorrect": false }
			]
		}
	]
}
```

### Comprensión Lectora

```json
{
	"questions": [
		{
			"type": "reading_comprehension",
			"readingText": ["Párrafo 1", "Párrafo 2"],
			"questions": [
				{
					"type": "short_answer",
					"questionText": "¿Pregunta?",
					"correctAnswer": "Respuesta esperada"
				}
			]
		}
	]
}
```

## 🚀 Optimizaciones Implementadas

### Performance

- Event delegation donde es apropiado
- Lazy loading de ejercicios
- Reutilización de elementos DOM
- Throttling en animaciones

### UX/UI

- Feedback visual inmediato
- Animaciones suaves con CSS
- Accesibilidad con ARIA attributes
- Responsive design

### Código

- Funciones puras sin side effects
- Separación de responsabilidades
- Manejo de errores robusto
- Nomenclatura consistente

## 🧪 Testing y Debug

### Funciones Globales de Debug

```javascript
window.exerciseSystem = {
	loadExercise,
	goHome,
	showQuestion,
	nextQuestion,
	updateReadingProgress,
};
```

### Validaciones Implementadas

- Verificación de estructura JSON
- Validación de tipos de ejercicios
- Manejo de casos edge en análisis de texto
- Fallbacks para elementos DOM faltantes

## 🔮 Extensibilidad

### Agregar Nuevo Tipo de Ejercicio

1. Crear función de renderizado en `quiz-functions.js`
2. Agregar case en switch de `showQuestion()`
3. Definir estructura JSON correspondiente
4. Implementar estilos CSS específicos

### Personalizar Análisis de Respuestas

- Modificar umbrales en `analyzeUserAnswer()`
- Agregar nuevos tipos de normalización
- Implementar algoritmos alternativos de similitud

## 📝 Convenciones de Código

### Naming

- **Funciones**: camelCase descriptivo
- **Variables**: camelCase con contexto claro
- **Constantes**: UPPER_CASE para valores inmutables
- **CSS classes**: kebab-case con prefijos semánticos

### Estructura

- Un return por función cuando es posible
- Funciones pequeñas con responsabilidad única
- Comentarios solo para lógica compleja no obvia
- Preferencia por composición sobre herencia

---

_Última actualización: 11 de agosto de 2025_
