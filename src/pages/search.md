---
title: חיפוש
status: publish
path: about
author: יהודה
excerpt: ''
type: page
layout: post
---
<link href="/pagefind/pagefind-ui.css" rel="stylesheet">
<style>
    :root {
      --pagefind-ui-primary: var(--color-accent);
      --pagefind-ui-text: var(--color-body);
      --pagefind-ui-background: var(--color-ink);
      --pagefind-ui-border: var(--color-line);
      --pagefind-ui-tag: var(--color-surface);
      --pagefind-ui-font: inherit;
    }
</style>
<div id="search" class="search"></div>

<script src="/pagefind/pagefind-ui.js" onload="new PagefindUI({ element: '#search' });"></script>