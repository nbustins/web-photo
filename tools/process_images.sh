#!/bin/bash

# Comprovar que s'ha passat un directori
if [ -z "$1" ]; then
  echo "Ús: ./process_images.sh /path/al/directori"
  exit 1
fi

INPUT_DIR="$1"
OUTPUT_DIR="$INPUT_DIR/processed"

# Crear directori de sortida
mkdir -p "$OUTPUT_DIR"

# Extensions suportades
shopt -s nocaseglob

for img in "$INPUT_DIR"/*.jpg "$INPUT_DIR"/*.jpeg "$INPUT_DIR"/*.png; do
  # Saltar si no hi ha coincidències
  [ -e "$img" ] || continue

  filename=$(basename "$img")

  echo "Processant: $filename"

  convert "$img" \
    -resize 1200x\> \
    -quality 85 \
    -strip \
    "$OUTPUT_DIR/$filename"
done

echo "✔ Processament completat. Resultats a: $OUTPUT_DIR"

