# 📋 Templates - EngliFish

Templates y ejemplos para crear ejercicios de EngliFish.

## 📄 Archivos de Templates

### `exercise-templates.json` 📚

**Template principal con todos los tipos de ejercicios**

- Estructura completa de los 7 tipos de ejercicios soportados
- Campos requeridos y opcionales documentados
- Ejemplos funcionales listos para personalizar
- Guías y mejores prácticas integradas
- Metadatos de versión y documentación

### `sample-quiz-example.json` 🧪

**Quiz de ejemplo práctico**

- Ejemplo completo que demuestra todos los tipos de ejercicios
- Contenido educativo real y funcional
- Casos de uso reales con explicaciones detalladas
- Marcado como "no cargar" en la aplicación (solo referencia)

## 🎯 Tipos de Ejercicios Incluidos

1. **`multiple_choice`** - Opciones múltiples con explicaciones
2. **`fill_in_the_blanks`** - Completar espacios con ayudas
3. **`matching`** - Emparejar elementos
4. **`true_false`** - Verdadero/falso con explicaciones
5. **`short_answer`** - Respuestas cortas con alternativas
6. **`ordering`** - Ordenar palabras (tipo Duolingo)
7. **`reading_comprehension`** - Comprensión lectora con sub-preguntas

## 🚀 Cómo Usar

### Proceso Recomendado:

1. **Seleccionar tipo**: Revisar `exercise-templates.json`
2. **Copiar template**: Del tipo de ejercicio deseado
3. **Personalizar**: Modificar contenido según necesidades
4. **Validar**: Usar `../tools/json-validator.html`
5. **Guardar**: En `../model/nombre-del-quiz.json`
6. **Probar**: Cargar en EngliFish para verificar funcionamiento

### Estructura Base:

```json
{
	"title": "Título del Quiz",
	"description": "Descripción breve",
	"questions": [
		// Array de ejercicios usando templates
	]
}
```

## ✅ Validación

Antes de usar un nuevo ejercicio:

- ✅ Validar JSON con la herramienta
- ✅ Verificar campos requeridos
- ✅ Probar en la aplicación
- ✅ Revisar explicaciones y feedback

## 📖 Documentación

Ver `../docs/EXERCISE-TEMPLATES-README.md` para guía completa de uso.
