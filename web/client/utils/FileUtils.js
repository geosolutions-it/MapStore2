/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FileSaver from 'file-saver';

import { DxfParser } from 'dxf-parser';
import toBlob from 'canvas-to-blob';
import shp from 'shpjs';
import tj from '@mapbox/togeojson';
import JSZip from 'jszip';
import { Promise } from 'es6-promise';
const parser = new DOMParser();
import assign from 'object-assign';
import { hint as geojsonhint } from '@mapbox/geojsonhint/lib/object';
import { toMapConfig } from './ogc/WMC';

const cleanStyleFromKml = (xml) => {

    [].slice.call(xml.documentElement.getElementsByTagName("StyleMap")).map(el => el.parentNode.removeChild(el));
    [].slice.call(xml.documentElement.getElementsByTagName("Style")).map(el => el.parentNode.removeChild(el));
    [].slice.call(xml.documentElement.getElementsByTagName("LineStyle")).map(el => el.parentNode.removeChild(el));
    [].slice.call(xml.documentElement.getElementsByTagName("PointStyle")).map(el => el.parentNode.removeChild(el));
    [].slice.call(xml.documentElement.getElementsByTagName("PolyStyle")).map(el => el.parentNode.removeChild(el));
    [].slice.call(xml.documentElement.getElementsByTagName("IconStyle")).map(el => el.parentNode.removeChild(el));
    [].slice.call(xml.documentElement.getElementsByTagName("LabelStyle")).map(el => el.parentNode.removeChild(el));
    [].slice.call(xml.documentElement.getElementsByTagName("ListStyle")).map(el => el.parentNode.removeChild(el));
    [].slice.call(xml.documentElement.getElementsByTagName("BallonStyle")).map(el => el.parentNode.removeChild(el));
    [].slice.call(xml.documentElement.getElementsByTagName("styleUrl")).map(el => el.parentNode.removeChild(el));
    return xml;
};
export const MIME_LOOKUPS = {
    'avi': 'video/avi',
    'gpx': 'application/gpx+xml',
    'kmz': 'application/vnd.google-earth.kmz',
    'kml': 'application/vnd.google-earth.kml+xml',
    'dxf': 'image/vnd.dxf',
    'zip': 'application/zip',
    'json': 'application/json',
    'geojson': 'application/json',
    'wmc': 'application/vnd.wmc'
};
export const recognizeExt = function(fileName) {
    return fileName.split('.').slice(-1)[0];
};
export const download = function(blob, name, mimetype) {
    let file = new Blob([blob], {type: mimetype});
    // a.href = URL.createObjectURL(file);
    FileSaver.saveAs(file, name);
};
export const downloadCanvasDataURL = function(dataURL, name = "snapshot.png", mimetype) {
    download(toBlob(dataURL), name, mimetype);
};
export const shpToGeoJSON = function(zipBuffer) {
    return [].concat(shp.parseZip(zipBuffer));
};
export const kmlToGeoJSON = function(xml) {
    const pureKml = cleanStyleFromKml(xml);
    const geoJSON = [].concat(tj.kml(pureKml)).map(item => assign({}, item, {fileName: pureKml.getElementsByTagName('name')[0].innerHTML}));
    return geoJSON;
};
export const gpxToGeoJSON = function(xml, fileName) {
    const geoJSON = [].concat(tj.gpx(xml)).map(item => assign({}, item, {
        fileName: xml.getElementsByTagName('name')[0] && xml.getElementsByTagName('name')[0].innerHTML || fileName }));
    return geoJSON;
};
export const readZip = function(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = function() { reject(reader.error.name); };
        reader.readAsArrayBuffer(file);
    });
};
export const readKml = function(file) {
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
};
export const readJson = function(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = function() {
            try {
                resolve(JSON.parse(reader.result));
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = function() {
            reject(reader.error.name);
        };
        reader.readAsText(file);
    });
};
export const readKmz = function(file) {
    const zip = new JSZip();
    return new Promise((resolve, reject) => {
        zip.loadAsync(file).then(files => {
            files.filter(elem => {
                return elem.indexOf('kml') !== -1;
            }).forEach(elem => {
                return elem.async("string").then((response) => {
                    resolve(parser.parseFromString(response, "text/xml"));
                }).catch((e) => {
                    reject(e.message);
                });
            });
        });
    });
};
export const readGeoJson = function(file, warnings = false) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = function() {
            try {
                const geoJsonObj = JSON.parse(reader.result);
                resolve({geoJSON: geoJsonObj, errors: geojsonhint(geoJsonObj).filter((e) => warnings || e.level !== 'message')});
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = function() {
            reject(reader.error.name);
        };
        reader.readAsText(file);
    });
};
export const readDxf = function(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = function() {
            try {
                const parserDXF = new DxfParser();
                const dxf = parserDXF.parseSync(reader.result);
                resolve(dxf);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = function() {
            reject(reader.error.name);
        };
        reader.readAsText(file);
    });
};
export const readWMC = function(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = function() {
            toMapConfig(reader.result, true).then(config => resolve(config)).catch(e => reject(e));
        };
        reader.onerror = function() {
            reject(reader.error.name);
        };
        reader.readAsText(file);
    });
};
/* Checks if the zip contains .prj file */
export const checkShapePrj = function(buffer) {
    const zip = new JSZip();
    return new Promise((resolve) => {
        zip.loadAsync(buffer).then(({files = {}}) => {
            const shapeNames = Object.keys(files).filter(k => !files[k].dir && k.indexOf("__MACOSX") !== 0 && k.indexOf(".shp") === k.length - 4).map( n => n.slice(0, -4));
            const warnings = shapeNames.reduce((p, c) => {
                return p.concat(!files[`${c}.prj`] && c || []);
            }, []);
            resolve(warnings);
        });
    });
};

/**
 * Checks if the file size exceeds the size limit or not. Returns true if exceeding the limit and false if not.
 */
export const isFileSizeExceedMaxLimit = (file, fileSizeLimitInMb) => {
    const fileSizeLimitInByte = fileSizeLimitInMb * 1024 * 1024;
    const fileSizeInBype = file.size;
    if (fileSizeInBype <= fileSizeLimitInByte) {
        return false;
    }
    return true;
};
/**
 * the max file size limit for import vector files
 */
export const DEFAULT_VECTOR_FILE_MAX_SIZE_IN_MB = 3;
