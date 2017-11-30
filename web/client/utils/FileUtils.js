/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const FileSaver = require('file-saver');
const toBlob = require('canvas-to-blob');
const shp = require('shpjs');
const tj = require('@mapbox/togeojson');
const JSZip = require('jszip');
const {Promise} = require('es6-promise');
const parser = new DOMParser();

const FileUtils = {
    MIME_LOOKUPS: {
        'gpx': 'application/gpx+xml',
        'kmz': 'application/vnd.google-earth.kmz',
        'kml': 'application/vnd.google-earth.kml+xml',
        'zip': ['application/x-zip-compressed', 'application/zip']
    },
    download: function(blob, name, mimetype) {
        let file = new Blob([blob], {type: mimetype});
        // a.href = URL.createObjectURL(file);
        FileSaver.saveAs(file, name);
    },
    downloadCanvasDataURL: function(dataURL, name = "snapshot.png", mimetype) {
        FileUtils.download(toBlob(dataURL), name, mimetype);
    },
    shpToGeoJSON: function(zipBuffer) {
        return [].concat(shp.parseZip(zipBuffer));
    },
    kmlToGeoJSON: function(xml) {
        let geoJSON = [].concat(tj.kml(xml));
        geoJSON.forEach(function(item) {
            item.fileName = xml.getElementsByTagName('name')[0].innerHTML;
        });
        return geoJSON;
    },
    gpxToGeoJSON: function(xml) {
        let geoJSON = [].concat(tj.gpx(xml));
        geoJSON.forEach(function(item) {
            item.fileName = xml.getElementsByTagName('name')[0].innerHTML;
        });
        return geoJSON;
    },
    readZip: function(file) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = function() { resolve(reader.result); };
            reader.onerror = function() { reject(reader.error.name); };
            reader.readAsArrayBuffer(file);
        });
    },
    readKml: function(file) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = function() {
                 resolve(parser.parseFromString(reader.result, "text/xml"));
             };
            reader.onerror = function() {
                reject(reader.error.name);
            };
            reader.readAsText(file);
        });
    },
    readKmz: function(file) {
        const zip = new JSZip();
        return new Promise((resolve, reject) => {
            zip.loadAsync(file).then(files => {
                files.filter(elem => {
                    return elem.indexOf('kml') !== -1;
                }).map(elem => {
                    return elem.async("string").then((response) => {
                        resolve(parser.parseFromString(response, "text/xml"));
                    }).catch((e) => {
                        reject(e.message);
                    });
                });
            });
        });
    }
};
module.exports = FileUtils;
