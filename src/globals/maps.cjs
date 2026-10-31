const fs = require("fs").promises;
const glob = require("glob-promise");
const topojson = require("topojson-client");

module.exports = async function() {
    const allTrails = await glob('public/topojson/trail-*.topojson');
    const maps = await Promise.all(
        allTrails.map(parseMapFile)
    );
    const { collectPhotos } = await import("../../tools/trail/photos.js");
    const photos = await collectPhotos(".", Object.fromEntries(maps.map((map) => [map.number, map.geometry])));
    return maps.map(({ number, name, geojsonFeature }) => ({
        number,
        name,
        geojsonFeature,
        // Escaped since it's embedded in a script tag
        photos: JSON.stringify(photos[number]).replace(/</g, "\\u003c"),
    }));
};

async function parseMapFile(file) {
    let objectName = file.replace(/.*(trail-[0-9a-z]+).*/, "$1");
    let number = objectName.replace("trail-", "");
    const data = await fs.readFile(file, 'utf-8');
    const topology = JSON.parse(data);
    let geojson = topojson.feature(topology, topology.objects[objectName]);
    let geojsonFeature = geojson.features[0];
    let name = `${number} - ${geojsonFeature.properties.name}`;
    let geometry = geojsonFeature.geometry;
    geojsonFeature = JSON.stringify(geojsonFeature);

    return {number, name, geojsonFeature, geometry};
}

