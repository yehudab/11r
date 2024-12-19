#!/bin/bash

# Check if a directory was provided
if [ -z "$1" ]; then
  echo "Usage: $0 <year-directory>"
  exit 1
fi

# Directory containing year subfolders
YEAR_DIR=$1

# Path to the awk script
AWK_SCRIPT="../utils/process_front_matter.awk"

# Verify the awk script exists
if [ ! -f "$AWK_SCRIPT" ]; then
  echo "Error: AWK script '$AWK_SCRIPT' not found."
  exit 1
fi

# Find all .md files in the year directory and its subdirectories
find "$YEAR_DIR" -type f -name "*.md" | while read -r FILE; do
  echo "Processing $FILE..."
  
  # Use awk to update the front-matter
  gawk -f "$AWK_SCRIPT" "$FILE" > "${FILE}.tmp" && mv "${FILE}.tmp" "$FILE"
done

echo "Conversion complete."
