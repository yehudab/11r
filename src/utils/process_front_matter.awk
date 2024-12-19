BEGIN { inFrontMatter = 0 }

# Detect the start and end of front matter
/^---$/ {
  if (inFrontMatter == 0) {
    inFrontMatter = 1
    print
    next
  } else {
    inFrontMatter = 0
    print
    next
  }
}

# Process only front matter keys that start with "trail"
inFrontMatter == 1 && $0 ~ /^trail[a-zA-Z0-9_-]*:/ {
  # Match the key and value
  if (match($0, /^([a-zA-Z0-9_-]+):[ \t]*(.*)$/, matches)) {
    key = matches[1]
    value = matches[2]

    # Wrap scalar values in arrays and ensure strings are quoted
    if (value ~ /^[0-9.]+$/ || value ~ /^"(.*)"$/) {
      # Numeric or already quoted string
      print key ": [" value "]"
    } else if (value ~ /^[-a-zA-Z0-9א-ת ]+$/) {
      # Unquoted string
      print key ": [\"" value "\"]"
    } else {
      print $0
    }
  } else {
    print $0
  }
  next
}

# Print non-front-matter lines or unrelated keys as is
{
  print
}
