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
  "config": {
    "geoshape": {
        "filled": false,
        "strokeWidth": 1,
        "color": "#B56045"
    }
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
        "filled": true,
        "strokeWidth": 0,
        "color": "#bbb"
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
        "filled": true,
        "strokeWidth": 0,
        "color": "#63bfea"
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
        "href": "/maps/trail-1/#map"
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
        "href": "/maps/trail-2/#map"
      }
    },
    {
      "data": {
        "url": "public/topojson/trail-03.topojson",
        "format": {
          "type": "topojson",
          "feature": "trail-03"
        }
      },
      "mark": {
        "type": "geoshape",
        "href": "/maps/trail-3/#map"
      }
    },
    {
      "data": {
        "url": "public/topojson/trail-04.topojson",
        "format": {
          "type": "topojson",
          "feature": "trail-04"
        }
      },
      "mark": {
        "type": "geoshape",
        "href": "/maps/trail-4/#map"
      }
    },
    {
      "data": {
        "url": "public/topojson/trail-06.topojson",
        "format": {
          "type": "topojson",
          "feature": "trail-06"
        }
      },
      "mark": {
        "type": "geoshape",
        "href": "/maps/trail-6/#map"
      }
    },
    {
      "data": {
        "url": "public/topojson/trail-07.topojson",
        "format": {
          "type": "topojson",
          "feature": "trail-07"
        }
      },
      "mark": {
        "type": "geoshape",
        "href": "/maps/trail-7/#map"
      }
    }
  ]
}
```


### תאור הקטעים
#### עונה 1 - 2022-2023
1. [ארץ ירדן וחרמונים](/blog/2022/09/Israel-trail-1)
2. [אין דבר](/blog/2022/10/Israel-trail-2)
2. [בקעה, לא עמק](/blog/2022/11/Israel-trail-3)
2. [שלום רב שובך](/blog/2022/12/Israel-trail-4)
2. קטע חסר
2. [יב״א בה בה בה בה בה בה בם](/blog/2023/02/Israel-trail-6)
2. [ארבעים נכנסו לפרד״ס](/blog/2023/03/Israel-trail-7)

---

![שביל ישראל](/img/2022/09/shvil-1-6.jpeg "שביל ישראל")
