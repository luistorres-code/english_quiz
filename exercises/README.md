# 📚 Exercises Directory

Esta carpeta contiene todos los ejercicios y actividades de aprendizaje de inglés para la aplicación EngliFish.

## 📋 Estructura de Archivos

Cada ejercicio es un archivo JSON que contiene:

- **Metadatos**: título, descripción, nivel
- **Preguntas**: contenido de cada ejercicio
- **Configuración**: tipos de pregunta, validaciones, hints

## 🎯 Ejercicios Disponibles

### `first_steps.json`

- **Título**: A1: Primeros Pasos en Inglés
- **Nivel**: Principiante (A1)
- **Contenido**: Fundamentos básicos del idioma
- **Tipos**: Multiple choice, fill blanks, short answer, true/false, matching, ordering

## 🔧 Cómo Agregar Nuevos Ejercicios

1. **Crear archivo JSON** en esta carpeta siguiendo las plantillas en `/templates/`
2. **Validar contenido** usando `/tools/json-validator.html`
3. **Agregar a la lista** en `js/quiz-system.js` función `loadAvailableExercises()`
4. **Probar** en la aplicación

# � Ejercicios - EngliFish

Este directorio contiene todos los ejercicios disponibles en EngliFish.

## 📁 Archivos

- **`index.json`** - Índice automático de ejercicios disponibles
- **`first_steps.json`** - Ejercicios básicos de introducción al inglés
- **`new_ideas.json`** - Ejercicios intermedios con diferentes temas

## 🔄 Agregar Nuevos Ejercicios

1. **Crear el archivo JSON** siguiendo la estructura de templates
2. **Actualizar el índice** ejecutando:
   ```bash
   ./tools/update-exercises-index.sh
   ```
3. **Validar** el JSON con `../tools/json-validator.html`
4. **Probar** en la aplicación

## 📋 Estructura Requerida

Cada archivo de ejercicio debe tener:

```json
{
	"title": "Título del ejercicio",
	"description": "Descripción breve",
	"questions": [
		// Array de preguntas siguiendo los templates
	]
}
```

## ⚡ Carga Automática

Los ejercicios se cargan automáticamente en el selector de la aplicación desde el archivo `index.json`.

**No edites `index.json` manualmente** - usa el script de actualización.

## 🎯 Tipos Soportados

- `multiple_choice` - Opción múltiple
- `fill_in_the_blanks` - Completar espacios
- `matching` - Emparejar elementos
- `true_false` - Verdadero/Falso
- `short_answer` - Respuesta corta
- `ordering` - Ordenar palabras
- `reading_comprehension` - Comprensión lectora

## 🎨 Convenciones de Nomenclatura

- **Formato**: `nombre-descriptivo.json`
- **Estilo**: kebab-case
- **Ejemplos**:
  - `verb-tenses-practice.json`
  - `daily-conversations.json`
  - `reading-intermediate.json`

## 🚀 Carga Automática

Los ejercicios se cargan automáticamente en la aplicación cuando:

- Están listados en la función `loadAvailableExercises()`
- Tienen estructura JSON válida
- Contienen al menos `title` y `questions`

¡La aplicación los detectará y mostrará en el menú principal!
