# 📋 EngliFish Exercise Templates

Este directorio contiene templates y ejemplos para crear nuevos ejercicios en EngliFish.

## 🎯 Archivo Principal

**`exercise-templates.json`** - Contiene templates completos de todos los tipos de ejercicios disponibles.

## 📚 Tipos de Ejercicios Soportados

### 1. **Multiple Choice** (`multiple_choice`)

- ✅ Pregunta con múltiples opciones
- ✅ Una respuesta correcta
- ✅ Explicaciones para cada opción
- ✅ Sistema de hints opcional

### 2. **Fill in the Blanks** (`fill_in_the_blanks`)

- ✅ Completar espacios en oraciones
- ✅ Etiquetas en español para ayuda
- ✅ Análisis inteligente de respuestas
- ✅ Tolerancia a errores tipográficos

### 3. **Matching** (`matching`)

- ✅ Emparejar elementos de dos columnas
- ✅ Interfaz drag-and-drop intuitiva
- ✅ Validación automática
- ✅ Feedback visual inmediato

### 4. **True/False** (`true_false`)

- ✅ Preguntas de verdadero o falso
- ✅ Explicaciones detalladas
- ✅ Interfaz tipo botones
- ✅ Feedback educativo

### 5. **Short Answer** (`short_answer`)

- ✅ Respuestas cortas escritas
- ✅ Múltiples alternativas aceptadas (`alternatives`)
- ✅ Control de sensibilidad de mayúsculas (`caseSensitive`)
- ✅ Análisis de similitud inteligente con reintentos
- ✅ Sistema de doble oportunidad para errores menores

### 6. **Ordering** (`ordering`)

- ✅ Ordenar palabras para formar oraciones
- ✅ Sistema tipo Duolingo
- ✅ Construcción visual de oraciones
- ✅ Reordenamiento con botones

### 7. **Reading Comprehension** (`reading_comprehension`)

- ✅ Textos de lectura con múltiples preguntas
- ✅ Combina diferentes tipos de preguntas
- ✅ Textos divididos en párrafos
- ✅ Comprensión progresiva

## 🛠️ Cómo Crear Nuevos Ejercicios

### Paso 1: Seleccionar Template

1. Abrir `exercise-templates.json`
2. Copiar el template del tipo de ejercicio deseado
3. Personalizar el contenido

### Paso 2: Estructura del Archivo

```json
{
	"title": "Título del Quiz",
	"description": "Descripción breve del contenido",
	"questions": [
		// Array de ejercicios usando los templates
	]
}
```

### Paso 3: Campos Requeridos

- **Todos los ejercicios**: `type`, `question`
- **Multiple Choice**: `answerOptions` con `isCorrect`
- **Fill in the Blanks**: `questionParts` con objetos `answer`
- **Matching**: `pairs` array
- **True/False**: `answer` (boolean), `explanation`
- **Short Answer**: `correctAnswer`, `alternatives` (opcional), `caseSensitive` (opcional), `explanation` (recomendado)
- **Ordering**: `items` array, `correctOrder` array
- **Reading Comprehension**: `readingText` array, `questions` array

### Paso 4: Campos Opcionales

- `hint` - **Obsoleto** para `short_answer`, usar `explanation`
- `explanation` - Explicación mostrada al completar el ejercicio
- `rationale` - Específico para opciones de respuesta
- `alternatives` - Array de respuestas alternativas válidas (para `short_answer`)
- `caseSensitive` - Para respuestas cortas (default: false)

## ✅ Mejores Prácticas

### Contenido

- ✅ Preguntas claras y concisas
- ✅ Explicaciones educativas útiles
- ✅ Pistas que guíen sin revelar respuestas
- ✅ Sensibilidad cultural e inclusividad
- ✅ Dificultad apropiada para el nivel objetivo

### Estructura

- ✅ Mezclar diferentes tipos de ejercicios
- ✅ Progresión lógica de dificultad
- ✅ Validar JSON antes de usar
- ✅ Probar en la aplicación antes de implementar

### Técnico

- ✅ Usar UTF-8 para caracteres especiales
- ✅ Escapar comillas dentro de strings
- ✅ Mantener consistencia en naming
- ✅ Incluir metadatos útiles

## 🔍 Validación

Antes de crear nuevos ejercicios:

1. **Validar JSON**: Usar un validador JSON online
2. **Probar localmente**: Cargar en la aplicación EngliFish
3. **Revisar feedback**: Verificar que las explicaciones aparezcan
4. **Verificar hints**: Comprobar que las pistas funcionen correctamente

## 📁 Ubicación de Archivos

- **Templates**: `exercise-templates.json` (este archivo)
- **Ejercicios**: `/model/*.json`
- **Testing**: `/test-new-exercices.html`

## 🆕 Ejemplo Rápido

```json
{
	"title": "Mi Nuevo Quiz",
	"description": "Ejercicios sobre [tema]",
	"questions": [
		{
			"type": "multiple_choice",
			"question": "¿Cuál es la respuesta correcta?",
			"answerOptions": [
				{
					"text": "Respuesta correcta",
					"isCorrect": true,
					"rationale": "Esta es correcta porque..."
				},
				{
					"text": "Respuesta incorrecta",
					"isCorrect": false,
					"rationale": "Esta es incorrecta porque..."
				}
			],
			"hint": "Piensa en..."
		},
		{
			"type": "short_answer",
			"question": "¿Cómo se dice 'hola' en inglés?",
			"correctAnswer": "hello",
			"alternatives": ["Hello", "hi", "Hi"],
			"caseSensitive": false,
			"explanation": "La forma más común de decir 'hola' en inglés es 'hello' o 'hi'."
		}
	]
}
```

## 🔄 Actualizaciones

Este template se actualiza cuando se agregan nuevos tipos de ejercicios al sistema EngliFish.

**Última actualización**: 11 de agosto, 2025  
**Versión**: 1.0
