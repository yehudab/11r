const trailNumbers = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22];

function loadJS(url, completion) {
    let scriptEle = document.createElement("script");

    scriptEle.setAttribute("src", url);
    scriptEle.setAttribute("type", "text/javascript");
    scriptEle.setAttribute("async", true);

    document.body.appendChild(scriptEle);

    // success event 
    scriptEle.addEventListener("load", () => {
        completion(true);
    });

    // error event
    scriptEle.addEventListener("error", (ev) => {
        console.log(`Error on loading file ${url}`, ev);
        completion(false);
    });
}

function loadScripts(completion) {
    let totalLoaded = 0;
    const toLoad = [
        "https://cdn.jsdelivr.net/npm/vega@5.25.0",
        "https://cdn.jsdelivr.net/npm/vega-lite@5.16.3",
        "https://cdn.jsdelivr.net/npm/vega-embed@6.22.2"
    ];

    const totalRequested = toLoad.length;
    const done = (success) => {
        if (success) {
            totalLoaded++;
            if (totalLoaded >= totalRequested) {
                completion();
            }
            else {
                loadJS(toLoad[totalLoaded], done);
            }
        }
    };

    loadJS(toLoad[0], done);
}

function showAdvanceTrailMap() {
    let vlSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": 300,
        "height": 600,
        "background": "transparent",
        "view": {
            "stroke": "transparent"
        },
        "config": {
            "geoshape": {
                "filled": false,
                "strokeWidth": 1,
                "color": "#B56045"
            }
        }
    };

    let mapLayers = [
        {
            "data": {
                "url": "/topojson/israel-legal.topojson",
                "format": {
                    "type": "topojson",
                    "feature": "Israel"
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
                "url": "/topojson/lakes.topojson",
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
        }
    ];

    const tails = trailNumbers.map(i => {
        const padded =i.toString().padStart(2, "0");
        return {
            "data": {
              "url": `/topojson/trail-${padded}.topojson`,
              "format": {
                "type": "topojson",
                "feature": `trail-${padded}`
              }
            },
            "mark": {
              "type": "geoshape",
              "href": `/maps/trail-${i}/#map`
            }
        };
      
    })

    vlSpec.layer = mapLayers.concat(tails);

    // Embed the visualization in the container with id `vis`
    loadScripts(() => {
        vegaEmbed('#vega-map', vlSpec, {renderer: "svg", actions: false});
    });
}

function fixMap() {
    const map = $('#vega-map');
    if (map.length) {
        showAdvanceTrailMap();
    }
}

export { fixMap };
