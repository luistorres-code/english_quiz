#!/bin/bash
# Script para actualizar automáticamente el índice de ejercicios

echo "Actualizando índice de ejercicios..."

# Directorio de ejercicios
EXERCISES_DIR="exercises"

# Crear array con archivos JSON (excluyendo index.json y README.md)
EXERCISES=$(find "$EXERCISES_DIR" -name "*.json" ! -name "index.json" | sort | sed 's|exercises/||' | jq -R -s 'split("\n") | map(select(length > 0))')

# Crear el archivo index.json
cat > "$EXERCISES_DIR/index.json" << EOF
{
	"exercises": $EXERCISES,
	"lastUpdated": "$(date +%Y-%m-%d)",
	"version": "1.0"
}
EOF

echo "Índice actualizado en $EXERCISES_DIR/index.json"
echo "Ejercicios encontrados:"
find "$EXERCISES_DIR" -name "*.json" ! -name "index.json" | sort
