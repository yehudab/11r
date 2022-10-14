---
title: שביל ישראל - ראשי
date: '2022-09-27T20:00:00+03:00'
status: publish
path: about
author: יהודה
excerpt: ''
type: page
layout: post
disableNewComments: true
---

### מפת השביל

ההתקדמות עד כה
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
    },
    {
      "data": {
        "url": "public/json/trail-1.json",
        "format": {
          "type": "topojson",
          "feature": "trail-1"
        }
      },
      "mark": {
        "type": "geoshape",
        "filled": false,
        "strokeWidth": 1
      },
      "encoding": {
        "color": {
          "value": "#B56045"
        }
      }
    }
  ]
}
```


### תאור הקטעים
#### עונה 1 - 2022-2023
1. [ארץ ירדן וחרמונים](/blog/2022/09/Israel-trail-1)