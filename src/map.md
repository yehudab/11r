---
title: מפת השביל
date: '2022-09-27T20:00:00+03:00'
status: draft
path: about
author: יהודה
excerpt: ''
type: page
layout: post
disableNewComments: true
---


אז זה מה שעשינו עד עכשיו
```vegalite
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": 300,
  "height": 600,
  "background": null,
  "view": {
    "stroke": "transparent"
  },
  "layer": [
    {
      "data": {
        "url": "public/json/israel-topo.json",
        "format": {
          "type": "topojson",
          "feature": "boroughs"
        }
      },
      "mark": {
        "type": "geoshape",
        "stroke": "white",
        "strokeWidth": 0
      },
      "encoding": {
        "color": {
          "value": "#bbb"
        }
      }
    },
    {
      "data": {
        "url": "public/json/lakes-topo.json",
        "format": {
          "type": "topojson",
          "feature": "boroughs"
        }
      },
      "mark": {
        "type": "geoshape",
        "stroke": "white",
        "strokeWidth": 0
      },
      "encoding": {
        "color": {
          "value": "#63bfea"
        }
      }
    }
  ]
}
```

