# 🧞‍♀️ EngliFish

Sistema interactivo de ejercicios para aprender inglés con análisis inteligente de respuestas, diseño moderno y mascota medusita.

> **EngliFish**: Un juego de palabras entre "English" y "jellyfish" (medusa) que representa la fluidez y adaptabilidad del aprendizaje de idiomas, como una medusa que se mueve elegantemente por el océano del conocimiento.

## ✨ Características

- **7 tipos de ejercicios**: Multiple choice, Matching, Reading comprehension, Fill in the blanks, True/False, Short Answer, Ordering
- **Sistema de ordenamiento tipo Duolingo**: Interfaz intuitiva de construcción de oraciones
- **Análisis inteligente**: Sistema tolerante que detecta typos y errores menores
- **Múltiples intentos**: Hasta 2 oportunidades con feedback progresivo
- **Diseño moderno**: Interfaz glassmorphism responsive con mascota medusita
- **Progreso granular**: Seguimiento preciso incluso en ejercicios complejos

## 🎨 Brand Identity - EngliFish

La aplicación cuenta con una mascota medusita que representa la fluidez y adaptabilidad del aprendizaje:

**El concepto "EngliFish"** fusiona ingeniosamente:

- 🐙 **"Jellyfish"** (medusa) - Representando fluidez, adaptabilidad y gracia
- 📚 **"English"** - El idioma que se aprende
- 🌊 **Metáfora del océano** - El conocimiento como un vasto mar por explorar

### Assets disponibles:

- **Logo principal**: `assets/logo-englifish-detailed.svg` - Medusita con elementos de letras flotantes
- **Logo horizontal**: `assets/logo-englifish-horizontal.svg` - Para headers con efectos de agua
- **Logo simple**: `assets/logo-medusa.svg` - Medusita básica sin texto
- **Favicon**: `assets/favicon.svg` - Versión simplificada para navegador
- **Generador de favicon**: `favicon-generator.html` - Tool para generar versiones PNG

## 🚀 Instalación y Uso

### Opción 1: Servidor Local

```bash
# Navegar al directorio del proyecto
cd english_quiz

# Iniciar servidor HTTP simple
python3 -m http.server 8000

# Abrir en navegador
open http://localhost:8000/index.html
```

### Opción 2: Archivo Local

Abrir directamente `index.html` en cualquier navegador moderno.

## �️ Creación de Ejercicios

### 📋 **Templates Disponibles**

- **`exercise-templates.json`** - Templates completos de todos los tipos de ejercicios
- **`EXERCISE-TEMPLATES-README.md`** - Guía detallada para crear ejercicios
- **`sample-quiz-example.json`** - Ejemplo práctico de quiz mixto
- **`json-validator.html`** - Validador web para verificar JSON de quiz

### 🎯 **Proceso de Creación**

1. Consultar templates en `exercise-templates.json`
2. Crear nuevo archivo en `/model/`
3. Validar con `json-validator.html`
4. Probar en la aplicación

## �📚 Tipos de Ejercicios Disponibles

### 🔤 **Voz Pasiva**

Ejercicios de transformación de voz activa a pasiva.

### 🔧 **Verbos y Formas Verbales**

Práctica de conjugaciones y tiempos verbales.

### 🔗 **Pronombres Relativos**

Uso correcto de who, which, that, where, etc.

### 📖 **Vocabulario General**

Definiciones y uso de palabras comunes.

### 💬 **Frases Comunes**

Comunicación práctica en inglés.

### ✅ **True/False**

Preguntas de verdadero/falso sobre gramática y vocabulario.

### ✏️ **Short Answer**

Respuestas cortas con análisis inteligente de similitud.

### 📋 **Ordering**

Ordenar palabras, frases o elementos con drag & drop.

Expresiones idiomáticas y comunicación cotidiana.

### 🎯 **Ejercicios Mixtos**

Combinación de diferentes tipos de preguntas.

### 📰 **Comprensión Lectora**

Textos con preguntas de comprensión múltiple.

## 🧠 Sistema Inteligente de Respuestas

### Para Respuestas Escritas:

- ✅ **Respuesta exacta**: Correcto inmediatamente
- 🟡 **Typo menor** (≥85% similar): "Muy cerca, inténtalo de nuevo"
- 🟡 **Algunos errores** (≥60% similar): Segunda oportunidad con pista
- 🟡 **Palabras clave correctas**: Guía hacia la respuesta correcta
- ❌ **Muy diferente**: Muestra respuesta correcta

### Ejemplos:

**Respuesta correcta**: _"They used carrier pigeons"_

- ✅ `"They used carrier pigeons"` → ¡Perfecto!
- 🟡 `"They used carier pigeons"` → Muy cerca (detecta typo)
- 🟡 `"Used pigeons"` → Contiene palabras clave
- ❌ `"They flew birds"` → Muy diferente

## 🎨 Interfaz de Usuario

### Diseño Glassmorphism

- Fondos translúcidos con blur
- Gradientes suaves (#667eea → #8b9ddc)
- Animaciones fluidas
- Efectos hover interactivos

### Estados Visuales

- **Verde**: Respuesta correcta
- **Naranja pulsante**: Cerca, permite reintento
- **Rojo**: Respuesta incorrecta
- **Feedback temporal**: Mensajes que aparecen/desaparecen automáticamente

## 📱 Responsive Design

- Funciona en desktop, tablet y móvil
- Layout adaptativo
- Controles optimizados para touch
- Texto legible en todas las resoluciones

## 🔧 Para Desarrolladores

### Estructura del Proyecto

```
english_quiz/
├── quiz_page.html       # Estructura principal
├── js/
│   ├── app.js          # Inicialización
│   ├── quiz-system.js  # Lógica principal
│   └── quiz-functions.js # Renderizado
├── styles/
│   └── quiz_styles.css # Estilos
└── model/              # Datos de ejercicios
    └── *.json
```

### Tecnologías

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Paradigma**: Programación funcional
- **Diseño**: Glassmorphism, CSS Grid/Flexbox
- **Algoritmos**: Levenshtein distance, string similarity

Ver [DOCUMENTATION.md](./DOCUMENTATION.md) para detalles técnicos completos.

## 🎯 Próximas Mejoras

- [ ] Sistema de puntuación avanzado
- [ ] Estadísticas de progreso del usuario
- [ ] Más tipos de ejercicios
- [ ] Modo offline
- [ ] Export de resultados

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea feature branch (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a branch (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

---

_Creado con ❤️ para el aprendizaje del inglés_
