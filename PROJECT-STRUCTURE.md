# 📁 Estructura del Proyec├── 📂 styles/ # Estilos CSS

│ └── quiz_styles.css # Estilos principales
├──
├── 📂 exercises/ # Ejercicios de aprendizaje
│ ├── first_steps.json # Ejercicio de fundamentos
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
│ └── 📄 README.md # Documentación de archivos legacy
├──```
english_quiz/
├── 📄 README.md # Documentación principal del proyecto
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
├── 📂 js/ # Código JavaScript
│ ├── app.js # Aplicación principal
│ ├── quiz-functions.js # Funciones de ejercicios
│ └── quiz-system.js # Sistema de quiz
├──
├── 📂 styles/ # Estilos CSS
│ └── quiz_styles.css # Estilos principales
├──
├── 📂 templates/ # Templates para crear ejercicios
│ ├── exercise-templates.json # Templates principales
│ ├── sample-quiz-example.json # Ejemplo práctico
│ └── 📄 README.md # Guía de templates
├──
├── 📂 tools/ # Herramientas de desarrollo
│ ├── json-validator.html # Validador de JSON
│ ├── favicon-data.txt # Datos de favicon
│ └── 📄 README.md # Documentación de herramientas
├──
├── 📂 docs/ # Documentación técnica
│ ├── EXERCISE-TEMPLATES-README.md # Guía de ejercicios
│ ├── CONTRIBUTING.md # Guía para contribuidores
│ ├── DOCUMENTATION.md # Documentación técnica
│ └── 📄 README.md # Índice de documentación
└──
└── 📂 .vscode/ # Configuración del editor (opcional)

```

## 🎯 Descripción de Carpetas

### 📱 **Aplicación Principal**

- `index.html` - Punto de entrada de la aplicación
- `js/` - Lógica de la aplicación y sistema de ejercicios
- `styles/` - Estilos CSS con diseño glassmorphism

### 🎨 **Recursos**

- `assets/icons/` - Favicons para navegadores y dispositivos
- `assets/logos/` - Logos de EngliFish en diferentes formatos

### 📚 **Contenido**

- `exercises/` - Ejercicios activos de aprendizaje (JSON)
- `archived-exercises/` - Ejercicios legacy y respaldo histórico
- `templates/` - Plantillas para crear nuevos ejercicios

### 🛠️ **Desarrollo**

- `tools/` - Herramientas para validar y crear contenido
- `docs/` - Documentación técnica y guías

## 🚀 Flujo de Trabajo

### Para usar la aplicación:

1. Abrir `index.html` en navegador
2. Seleccionar ejercicio del menú
3. Completar ejercicios interactivos

### Para crear ejercicios:

1. Consultar `templates/exercise-templates.json`
2. Crear nuevo archivo en `exercises/`
3. Validar con `tools/json-validator.html`
4. Agregar a lista en `js/quiz-system.js`
5. Probar en la aplicación

### Para desarrollo:

1. Leer `docs/CONTRIBUTING.md`
2. Modificar archivos en `js/` o `styles/`
3. Actualizar documentación si es necesario

## 📋 Convenciones

- **Naming**: kebab-case para archivos, camelCase para variables
- **Estructura**: Un README.md en cada carpeta principal
- **Documentación**: Mantener actualizada con cambios
- **Validación**: Usar herramientas antes de implementar
```
