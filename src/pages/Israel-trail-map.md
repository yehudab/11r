---
title: שביל ישראל - ראשי
date: '2022-09-27T20:00:00+03:00'
lastUpdate: '2022-10-17T20:00:00+03:00'
status: publish
path: Israel-trail-map
author: יהודה
excerpt: 'מפת ההתקדמות לאורך כל שביל ישראל וקישור לתאורי הקטעים ע״פ עונות'
ogImage: 'img/2022/09/shvil-1-6.jpeg'
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
        "url": "public/topojson/israel.topojson",
        "format": {
          "type": "topojson",
          "feature": "israel"
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
        "url": "public/topojson/lakes.topojson",
        "format": {
          "type": "topojson",
          "feature": "lakes"
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
        "url": "public/topojson/trail-01.topojson",
        "format": {
          "type": "topojson",
          "feature": "trail-01"
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
    },
    {
      "data": {
        "url": "public/topojson/trail-02.topojson",
        "format": {
          "type": "topojson",
          "feature": "trail-02"
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
2. [אין דבר](/blog/2022/10/Israel-trail-2)

---

![שביל ישראל](/img/2022/09/shvil-1-6.jpeg "שביל ישראל")