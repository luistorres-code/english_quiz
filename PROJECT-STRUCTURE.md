# 📁 Estructura del Proyecto - EngliFish

## 🌟 **Arquitectura Post-Refactorización (v2.0.0)**

Esta estructura refleja la **nueva arquitectura modular** implementada en la refactorización completa.

```
english_quiz/
├── 📄 README.md # Documentación principal del proyecto
├── 📄 CHANGELOG.md # 🆕 Historial de cambios y versiones
├── 📄 package.json # Configuración del proyecto
├── 📄 index.html # Aplicación principal
├──
├── 📂 assets/ # Recursos gráficos y multimedia
│ ├── 📂 icons/ # Iconos y favicons
│ │ ├── favicon.svg
│ │ ├── favicon-16x16.png
│ │ ├── favicon-32x32.png
│ │ └── apple-touch-icon.png
│ ├── 📂 logos/ # Logos y branding
│ │ ├── logo-englifish-horizontal.svg
│ │ ├── logo-englifish-detailed.svg
│ │ ├── logo-medusa.svg
│ │ └── logo-horizontal.svg
│ └── 📄 README.md # Documentación de assets
├──
├── 📂 js/ # 🔧 Código JavaScript - NUEVA ARQUITECTURA MODULAR
│ ├── app.js # Inicialización de la aplicación
│ ├── quiz-system.js # Sistema principal (refactorizado)
│ ├── quiz-functions.js # Funciones de renderizado de ejercicios
│ ├── theme-manager.js # Manejo de temas claro/oscuro
│ ├── 🆕 feedback-manager.js # Sistema unificado de feedback
│ ├── 🆕 exercise-renderer.js # Renderizado unificado de ejercicios
│ └── 🆕 ui-state-manager.js # Manejo centralizado de estados UI
├──
├── 📂 styles/ # Estilos CSS con variables dinámicas para temas
│ └── quiz_styles.css # Estilos principales (refactorizados para temas)
├──
├── 📂 exercises/ # 📚 Ejercicios de aprendizaje (renombrado de model/)
│ ├── index.json # Índice de ejercicios disponibles
│ ├── first_steps.json # Ejercicio de fundamentos
│ ├── conversation_domination.json # Conversación avanzada
│ ├── new_ideas.json # Ideas y conceptos nuevos
│ ├── reading_a1_daily_routine.json # Comprensión lectora A1
│ ├── reading_a2_walking_benefits.json # Comprensión lectora A2
│ ├── reading_b1_remote_work.json # Comprensión lectora B1
│ └── 📄 README.md # Guía de ejercicios
├──
├── 📂 archived-exercises/ # Ejercicios legacy (respaldo)
│ ├── passive-voice-quiz.json
│ ├── verbs-and-verbs-forms.json
│ ├── relative-pronouns.json
│ ├── general-vocabulary.json
│ ├── comunications-common-phrases.json
│ ├── mixed-exercises-quiz.json
│ ├── reading-comprehension-example.json
│ ├── true-false-quiz.json
│ ├── short-answer-quiz.json
│ ├── ordering-quiz.json
│ ├── relative-pronouns-mixed.json
│ └── � README.md # Documentación de archivos legacy
├──
├── �📂 templates/ # Templates para crear ejercicios
│ ├── exercise-templates.json # Templates principales
│ ├── sample-quiz-example.json # Ejemplo práctico
│ └── 📄 README.md # Guía de templates
├──
├── 📂 tools/ # Herramientas de desarrollo
│ ├── json-validator.html # Validador de JSON
│ ├── favicon-data.txt # Datos de favicon
│ ├── update-exercises-index.sh # Script para actualizar índice
│ └── 📄 README.md # Documentación de herramientas
├──
├── 📂 docs/ # 📋 Documentación técnica
│ ├── EXERCISE-TEMPLATES-README.md # Guía de ejercicios
│ ├── CONTRIBUTING.md # Guía para contribuidores
│ ├── DOCUMENTATION.md # Documentación técnica
│ ├── 🆕 REFACTORING-SUMMARY.md # Detalles completos de refactorización
│ └── 📄 README.md # Índice de documentación
└──
└── � test-fixes.json # Configuración para testing y fixes
```

## 🎯 Descripción de Componentes

### 📱 **Aplicación Principal**

- `index.html` - Punto de entrada con nuevos scripts modulares
- `js/` - **Nueva arquitectura modular** con responsabilidades separadas
- `styles/` - Estilos CSS con **variables dinámicas** para soporte perfecto de temas

### 🆕 **Nuevos Módulos JavaScript (v2.0.0)**

#### **1. feedback-manager.js**

```javascript
// Sistema unificado que reemplaza 4 funciones similares
showUnifiedFeedback(container, {
	type: "general|matching|temporary|retry",
	isCorrect: boolean,
	message: string,
});
```

**Responsabilidades:** Feedback visual, mensajes temporales, notificaciones de estado

#### **2. exercise-renderer.js**

```javascript
// Una función que reemplaza 7 wrapper functions duplicadas
renderUnifiedExercise(exerciseType, questionData, context, onComplete);
```

**Responsabilidades:** Renderizado unificado, callbacks consistentes, manejo de parámetros

#### **3. ui-state-manager.js**

```javascript
// Manejo centralizado de estados de interfaz
ExerciseElementsManager.showExerciseInterface(elements);
AnswerStateManager.markAsCorrect(element);
manageUIState(elements, elementType, action);
```

**Responsabilidades:** Estados UI, transiciones, restauración de layouts

#### **4. theme-manager.js** (mejorado)

- Transiciones suaves entre temas
- Efectos ripple animados
- Persistencia de preferencias
- Detección automática de tema del sistema

### 🎨 **Recursos Visuales**

- `assets/icons/` - Favicons optimizados para todos los navegadores
- `assets/logos/` - Suite completa de logos EngliFish con la mascota medusita

### 📚 **Sistema de Contenido**

- `exercises/` - **Ejercicios activos** con índice dinámico (`index.json`)
- `archived-exercises/` - **Respaldo histórico** de ejercicios legacy
- `templates/` - **Plantillas estandarizadas** para crear contenido consistente

### 🛠️ **Herramientas de Desarrollo**

- `tools/json-validator.html` - Validador interactivo para archivos de ejercicios
- `tools/update-exercises-index.sh` - Script para mantener índice actualizado
- `docs/REFACTORING-SUMMARY.md` - **Documentación completa** del proceso de mejora

## 🚀 Flujos de Trabajo

### **Para usar la aplicación:**

1. Abrir `index.html` → Sistema modular se inicializa automáticamente
2. Seleccionar ejercicio → Renderizado unificado garantiza consistencia
3. Completar ejercicios → Feedback y puntaje 100% confiables

### **Para crear ejercicios:**

1. Consultar `templates/exercise-templates.json` → Templates actualizados
2. Crear nuevo archivo en `exercises/` → Sistema detecta automáticamente
3. Validar con `tools/json-validator.html` → Verificación completa
4. Ejecutar `tools/update-exercises-index.sh` → Índice actualizado automáticamente
5. Probar → Sistema robusto garantiza funcionamiento perfecto

### **Para desarrollo:**

1. **Módulos especializados** - Cambiar lógica en 1 lugar afecta todo el sistema
2. **CSS Variables** - Nuevos temas se implementan fácilmente
3. **Debugging centralizado** - Logs y errores localizados por módulo
4. **Testing simplificado** - Menos superficie de ataque para bugs

## 🔧 **Beneficios de la Nueva Arquitectura**

### **Mantenibilidad:**

- **Antes:** Cambiar feedback requería modificar 4 funciones
- **Después:** 1 función controla todo el sistema de feedback

### **Extensibilidad:**

- **Antes:** Nuevo tipo de ejercicio = 3 archivos modificados
- **Después:** Nuevo tipo = 1 línea en configuración

### **Debugging:**

- **Antes:** Bugs dispersos en múltiples funciones similares
- **Después:** Bugs localizados en módulos específicos

### **Performance:**

- **75% menos código duplicado** = menor overhead
- **Sistema unificado** = callbacks más eficientes
- **CSS variables** = menos recálculos de estilos

## 📋 Convenciones Actualizadas

- **Naming:** kebab-case para archivos, camelCase para variables JS
- **Módulos:** Un módulo = una responsabilidad específica
- **CSS:** Variables dinámicas en lugar de valores hardcodeados
- **Documentación:** README.md en cada carpeta + changelog detallado
- **Versionado:** Semantic versioning con breaking changes documentados
- **Testing:** Validación funcional completa antes de release
