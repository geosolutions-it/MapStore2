import {getSheetName, getLayoutName, getMapfishLayersSpecification, getOpacity, normalizeUrl } from "../PrintUtils";
import { generateEnvString } from '../LayerLocalizationUtils';
import { optionsToVendorParams } from '../VendorParamsUtils';
import { normalizeSRS } from '../CoordinatesUtils';
import { addAuthenticationParameter } from "../SecurityUtils";
import assign from "object-assign";
import reverse from "lodash/reverse";
import axios from "../../libs/ajax";
import url from 'url';

function getClientInfo(layout) {
    return layout.attributes.find(a => a.type === "MapAttributeValues")?.clientInfo;
}

function getMap(clientInfo) {
    return {
        width: clientInfo?.width ?? 10,
        height: clientInfo?.height ?? 10
    };
}

function getScales(clientInfo) {
    return clientInfo?.scales?.map(scale => ({
        name: `1:${scale}`,
        value: scale
    })) ?? [];
}

function getDpis(clientInfo) {
    return clientInfo?.dpiSuggestions?.map(dpi => ({
        name: `${dpi}`,
        value: dpi
    })) ?? [];
}

function getFirst(arr, defValue) {
    return (arr && arr.length) ? arr[0] : defValue;
}

export function parseCapabilities(capabilities, defaultSpec) {
    const outputFormats = capabilities?.formats.map(format => ({
        name: format
    })) ?? [];

    const layouts = capabilities?.layouts.map(layout => ({
        name: layout.name,
        map: getMap(getClientInfo(layout)),
        rotation: true
    })) ?? [{name: 'A4'}];

    const scales = getFirst(capabilities?.layouts.map(layout => getScales(getClientInfo(layout))), []);
    const dpis = getFirst(capabilities?.layouts.map(layout => getDpis(getClientInfo(layout))), []);

    const sheetName = layouts.filter(l => getSheetName(l.name) === defaultSpec.sheet).length ?
        defaultSpec.sheet : getSheetName(layouts[0].name);
    return {
        capabilities: {
            outputFormats,
            layouts,
            printURL: "",
            createURL: `pdf/${capabilities.app}/report.pdf`,
            dpis,
            scales
        },
        spec: {
            ...defaultSpec,
            type: "mapfish3",
            sheet: sheetName,
            resolution: getFirst(dpis, {}).value
        }
    };
}

export function getPrintSpecification(spec, state, center, scale, params) {
    const withLegend = spec.includeLegend ? {
        legend: getMapfishLayersSpecification(spec.layers, spec, state, 'legend')[0]
    } : {};
    return {
        layout: getLayoutName(spec),
        attributes: {
            map: {
                center: [
                    center.x,
                    center.y
                ],
                scale,
                rotation: 0,
                dpi: parseInt(spec.resolution, 10),
                projection: normalizeSRS(spec.projection || 'EPSG:3857'),
                layers: reverse(getMapfishLayersSpecification(spec.layers, spec, state, 'map'))
            },
            ...withLegend,
            title: spec.name || '',
            // "comment": spec.description || '',
            ...params
        }
    };
}

export const specCreators = {
    osm: {
        map: (layer = {}) => ({
            "baseURL": "https://tile.openstreetmap.org/${z}/${x}/${y}.png",
            "opacity": getOpacity(layer),
            "type": "OSM",
            "maxExtent": [
                -20037508.3392,
                -20037508.3392,
                20037508.3392,
                20037508.3392
            ],
            "tileSize": [
                256,
                256
            ],
            "imageExtension": "png",
            "resolutions": [
                156543.03390625,
                78271.516953125,
                39135.7584765625,
                19567.87923828125,
                9783.939619140625,
                4891.9698095703125,
                2445.9849047851562,
                1222.9924523925781,
                611.4962261962891,
                305.74811309814453,
                152.87405654907226,
                76.43702827453613,
                38.218514137268066,
                19.109257068634033,
                9.554628534317017,
                4.777314267158508,
                2.388657133579254,
                1.194328566789627,
                0.5971642833948135
            ]
        })
    },
    wms: {
        map: (layer, spec) => ({
            "baseURL": normalizeUrl(layer.url) + '?',
            "opacity": getOpacity(layer),
            "type": "WMS",
            "layers": [
                layer.name
            ],
            "imageFormat": layer.format || "image/png",
            "styles": [
                layer.style || ''
            ],
            "customParams": addAuthenticationParameter(normalizeUrl(layer.url), assign({
                "TRANSPARENT": true,
                "TILED": true,
                "EXCEPTIONS": "application/vnd.ogc.se_inimage",
                "scaleMethod": "accurate",
                "ENV": generateEnvString(spec.env)
            }, layer.baseParams || {}, layer.params || {}, {
                ...optionsToVendorParams({
                    layerFilter: layer.layerFilter,
                    filterObj: layer.filterObj
                })
            }
            ))}),
        legend: (layer, spec) => ({
            "name": layer.title || layer.name,
            "classes": [
                {
                    "name": "",
                    "icons": [
                        normalizeUrl(layer.url) + url.format({
                            query: addAuthenticationParameter(normalizeUrl(layer.url), {
                                TRANSPARENT: true,
                                EXCEPTIONS: "application/vnd.ogc.se_xml",
                                VERSION: "1.1.1",
                                SERVICE: "WMS",
                                REQUEST: "GetLegendGraphic",
                                LAYER: layer.name,
                                LANGUAGE: spec.language || '',
                                STYLE: layer.style || '',
                                SCALE: spec.scale,
                                height: spec.iconSize,
                                width: spec.iconSize,
                                minSymbolSize: spec.iconSize,
                                LEGEND_OPTIONS: "forceLabels:" + (spec.forceLabels ? "on" : "") + ";fontAntialiasing:" + spec.antiAliasing + ";dpi:" + spec.legendDpi + ";fontStyle:" + (spec.bold && "bold" || (spec.italic && "italic") || '') + ";fontName:" + spec.fontFamily + ";fontSize:" + spec.fontSize,
                                format: "image/png",
                                ...assign({}, layer.params)
                            })
                        })
                    ]
                }
            ]
        })
    }
};

export function getPrintUrl(response) {
    return response?.downloadURL;
}

export function getStatusUrl(response) {
    return response?.statusURL;
}

export function waitForDone(statusUrl) {
    return axios(statusUrl).then(resp => {
        if (!resp.data.done) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    waitForDone(statusUrl).then(resolve);
                }, 1000);
            });
        }
        if (resp.data.status === "error") {
            throw new Error(resp.data.error);
        }
        return resp.data;
    });
}

export default {
    parseCapabilities,
    getPrintSpecification,
    specCreators,
    getPrintUrl,
    getStatusUrl,
    waitForDone
};
