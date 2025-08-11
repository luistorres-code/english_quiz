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

## 📖 Plantillas Disponibles

Consulta `/templates/exercise-templates.json` para ver ejemplos de:

- Multiple choice
- Fill in the blanks
- True/False
- Short answer
- Matching
- Ordering
- Reading comprehension

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
