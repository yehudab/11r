const fs = require("fs").promises;
const glob = require("glob-promise");
const topojson = require("topojson-client");

module.exports = async function() {
    const allTrails = await glob('public/topojson/trail-*.topojson');
    return Promise.all(
        allTrails.map(parseMapFile)
    )
};

async function parseMapFile(file) {
    let objectName = file.replace(/.*(trail-[0-9a-z]+).*/, "$1");
    let number = objectName.replace("trail-", "");
    const data = await fs.readFile(file, 'utf-8');
    const topology = JSON.parse(data);
    let geojson = topojson.feature(topology, topology.objects[objectName]);
    let geojsonFeature = geojson.features[0];
    let name = `${number} - ${geojsonFeature.properties.name}`;
    geojsonFeature = JSON.stringify(geojsonFeature);

    return {number, name, geojsonFeature};
}

