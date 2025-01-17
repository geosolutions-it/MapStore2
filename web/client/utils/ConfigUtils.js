/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Proj4js from 'proj4';
import PropTypes from 'prop-types';
import url from 'url';
import axios from 'axios';
import { castArray, isArray, isObject, endsWith, isNil, get, mergeWith } from 'lodash';
import assign from 'object-assign';
import { Promise } from 'es6-promise';
import isMobile from 'ismobilejs';
import {mergeConfigsPatch} from "@mapstore/patcher";

const epsg4326 = Proj4js ? new Proj4js.Proj('EPSG:4326') : null;
const centerPropType = PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    crs: PropTypes.string
});

const urlQuery = url.parse(window.location.href, true).query;

let localConfigFile = 'configs/localConfig.json';

let defaultConfig = {
    // TODO: these should be changed tp relative paths, without /mapstore/ or / (to avoid the needing of overriding in default cases)
    proxyUrl: "/mapstore/proxy/?url=",
    geoStoreUrl: "/rest/geostore/",
    printUrl: "/mapstore/print/info.json",
    translationsPath: "translations",
    extensionsRegistry: "extensions/extensions.json",
    extensionsFolder: "extensions/",
    configurationFolder: "configs/",
    contextPluginsConfiguration: "configs/pluginsConfig.json",
    projectionDefs: [],
    themePrefix: "ms2",
    bingApiKey: null,
    mapquestApiKey: null,
    mapboxAccessToken: '',
    defaultSourceType: "gxp_wmssource",
    backgroundGroup: "background",
    userSessions: {
        enabled: false
    }
};

export const getConfigurationOptions = function(query, defaultName, extension, geoStoreBase) {
    const mapId = query.mapId;
    let configUrl;
    if (mapId) {
        configUrl = ( geoStoreBase || defaultConfig.geoStoreUrl ) + "data/" + mapId;
    } else {
        configUrl = defaultConfig.configurationFolder + (query.config || defaultName || 'config') + '.' + (extension || 'json');
    }
    return {
        configUrl: configUrl,
        legacy: !!mapId
    };
};
/**
 * WORKAROUND: it removes the extra ? when the authkey param is present
 * the url was like         http......?authkey=....?service=....&otherparam
 * that should become like  http......?authkey=....&service=....&otherparam
 *
 * The problem happens when you have this in the Record.properties
 * file of the csw folder in GeoServer, with csw plugin installed:
 * references.scheme='OGC:WMS'
 * references.value=strConcat('${url.wms}?service=WMS&request=GetMap&layers=', prefixedName)
 * That is ok when you are not using an authkey, but If you have the authkey
 * module installed and you get record with a proper authkey parameter the
 * ${url.wms} URL will have also ?authkey=... and so the final URL is something like:
 * http://domain.org/geoserver/?autkey=abcdefghijklmnopqrstuvz1234567890?service=WMS&request=GetMap&layers=LAYER_NAME
 * ${url.wms} is replaced with the wms URL after the execution of strConcat,
 * so the url can not be parsed in any way to solve the problem via configuration,
 * because you can not know if ${url.wms} contains ? or not.
*/
export const cleanDuplicatedQuestionMarks = (urlToNormalize) => {
    const urlParts = urlToNormalize.split("?");
    if (urlParts.length > 2) {
        let newUrlParts = urlParts.slice(1);
        return urlParts[0] + "?" + newUrlParts.join("&");
    }
    return urlToNormalize;
};
/**
 * it removes some params from the query string
 * return the shrinked url
*/
export const getUrlWithoutParameters = (urlToFilter, skip) => {
    const urlparts = cleanDuplicatedQuestionMarks(urlToFilter).split('?');
    let paramsFiltered = "";
    if (urlparts.length >= 2 && urlparts[1]) {
        const pars = urlparts[1].split(/[&;]/g).filter( p => !!p);
        pars.forEach((par, i) => {
            const param = par.split('=');
            if (skip.indexOf(param[0].toLowerCase()) === -1) {
                let addAnd = i === (pars.length - 1) ? "" : "&";
                paramsFiltered += param.join("=") + addAnd;
            }
        });
    }
    return !!paramsFiltered ? urlparts[0] + "?" + paramsFiltered : urlparts[0];
};

export const filterUrlParams = (urlToFilter, params = []) => {
    if (isNil(urlToFilter) || urlToFilter === "") {
        return null;
    }
    return getUrlWithoutParameters(cleanDuplicatedQuestionMarks(urlToFilter), params);
};

export const getParsedUrl = (urlToParse, options, params = []) => {
    if (urlToParse) {
        const parsed = url.parse(filterUrlParams(urlToParse, params), true);
        let newPathname = null;
        if (endsWith(parsed.pathname, "wfs") || endsWith(parsed.pathname, "wms") || endsWith(parsed.pathname, "ows")) {
            newPathname = parsed.pathname.replace(/(wms|ows|wfs|wps)$/, "wps");
            return url.format(assign({}, parsed, {search: null, pathname: newPathname }, {
                query: assign({
                    service: "WPS",
                    ...options
                }, parsed.query)
            }));
        }
    }
    return null;
};
export const getDefaults = function() {
    return {...defaultConfig};
};
export const setLocalConfigurationFile = function(file) {
    localConfigFile = file;
};

export const loadConfiguration = function() {
    if (localConfigFile) {
        const configFiles = castArray(localConfigFile);
        return axios.all(configFiles.map(config =>
            axios.get(config)
                .then(response => response.data)
                .catch(() => null)
        )).then(configs => {
            const [main, ...patches] = configs;
            if (!main) throw new Error("local configuration file is broken");
            const merged = mergeConfigsPatch(main, patches.filter(c => c && typeof c === "object"));
            defaultConfig = merged ? {...defaultConfig, ...merged} : defaultConfig;
            return {...defaultConfig};
        });
    }
    return new Promise((resolve) => {
        resolve({...defaultConfig});
    });
};

export const getCenter = function(center, projection) {
    const point = isArray(center) ? {x: center[0], y: center[1]} : center;
    const crs = center.crs || projection || 'EPSG:4326';
    const transformed = crs !== 'EPSG:4326' ? Proj4js.transform(new Proj4js.Proj(crs), epsg4326, point) : point;
    return assign({}, transformed, {crs: "EPSG:4326"});
};

export const setApiKeys = function(layer) {
    if (layer.type === 'bing') {
        layer.apiKey = defaultConfig.bingApiKey;
    }
    if (layer.type === 'mapquest') {
        layer.apiKey = defaultConfig.mapquestApiKey;
    }
    if (layer.type === 'tileprovider' && ['MapBoxStyle', 'MapBox'].includes(layer.provider)) {
        // include an empty string if missing to avoid errors in the layer url template
        layer.accessToken = defaultConfig.mapboxAccessToken;
    }
    return layer;
};

export const setLayerId = function(layer, i) {
    if (!layer.id) {
        layer.id = layer.name + "__" + i;
    }
    return layer;
};

export const replacePlaceholders = function(inputUrl) {
    let currentUrl = inputUrl;
    (currentUrl.match(/\{.*?\}/g) || []).forEach((placeholder) => {
        const replacement = defaultConfig[placeholder.substring(1, placeholder.length - 1)];
        // replacement must exist, or the URL is intended as a real template for the URL (e.g REST URLs of WMTS)
        if (replacement !== undefined) {
            currentUrl = currentUrl.replace(placeholder, replacement || '');
        }
    });
    return currentUrl;
};

export const setUrlPlaceholders = function(layer) {
    if (layer.url) {
        if (isArray(layer.url)) {
            layer.url = layer.url.map((currentUrl) => {
                return replacePlaceholders(currentUrl);
            });
        } else {
            layer.url = replacePlaceholders(layer.url);
        }
    }
    return layer;
};

export const normalizeConfig = function(config) {
    const {layers, groups, plugins, ...other} = config;
    other.center = getCenter(other.center);
    return {
        map: other,
        layers: layers.map(setApiKeys, config).map(setLayerId).map(setUrlPlaceholders),
        groups: groups,
        plugins: plugins
    };
};

export const getUserConfiguration = function(defaultName, extension, geoStoreBase) {
    return getConfigurationOptions(urlQuery, defaultName, extension, geoStoreBase);
};

export const getConfigUrl = ({mapId, config}) => {
    let id = mapId;
    let configUrl = config;
    // if mapId is a string, is the name of the config to load
    try {
        let mapIdNumber = parseInt(id, 10);
        if (isNaN(mapIdNumber)) {
            configUrl = mapId;
            id = null;
        }
    } catch (e) {
        configUrl = mapId;
        id = null;
    }
    return getConfigurationOptions({mapId: id, config: configUrl});
};

/**
 * set default wms source
 */
export const setupSources = function(sources, defaultSourceType) {
    var defType = defaultSourceType;
    var source;
    if (!defaultSourceType) {
        defType = defaultConfig.defaultSourceType;
    }
    for (source in sources) {
        if (sources.hasOwnProperty(source)) {
            if (!sources[source].ptype) {
                sources[source].ptype = defType;
            }
        }
    }
};

export const normalizeSourceUrl = function(sourceUrl) {
    if (sourceUrl && sourceUrl.indexOf('?') !== -1) {
        return sourceUrl.split('?')[0];
    }
    return sourceUrl;
};

/**
 * Copy important source options to layer options.
 */
export const copySourceOptions = function(layer, source) {
    layer.baseParams = source.baseParams;
    if (source.url) {
        let sourceParts = url.parse(source.url, true);
        for (let k in sourceParts.query) {
            if (k.toUpperCase() === "REQUEST" ) {
                delete sourceParts.query[k];
            }
        }
        layer.baseParams = assign({}, layer.baseParams, sourceParts.query);
    }
    layer.url = normalizeSourceUrl(source.url);
};

/**
 * Setup the layer visibility for the background group.
 * if background layers are not visible, sets the last one
 */
export const setupLayers = function(layers, sources, supportedSourceTypes) {
    // setup background visibility
    var candidateVisible;
    var i; var layer; var source;
    for (i = 0; i < layers.length; i++) {
        layer = layers[i];
        source = sources[layer.source];
        if (source) {
            copySourceOptions(layer, source);
        }

        let type = source.ptype;
        if (type) {
            layer.type = type.replace(/^gxp_(.*)source$/i, "$1");
        } else {
            layer.type = 'unknown';
        }
        if (layer) {
            if (supportedSourceTypes.indexOf(source && source.ptype) >= 0) {
                if (layer.group === defaultConfig.backgroundGroup) {
                    // force to false if undefined
                    layer.visibility = layer.visibility || false;
                    if (candidateVisible && candidateVisible.visibility) {
                        /* if more than one layer is visible in the background group
                            shows only the last one hiding the previous.
                        */
                        if (layer.visibility) {
                            candidateVisible.visibility = false;
                            candidateVisible = layer;
                        }
                    } else {
                        candidateVisible = layer;
                    }
                }
            } else {
                layer.visibility = false;
            }
        }
    }
    // set the candidate visible
    if (candidateVisible) {
        candidateVisible.visibility = true;
    }
};

export const convertFromLegacy = function(config) {
    var mapConfig = config.map;
    var sources = config.gsSources || config.sources;
    var layers = mapConfig.layers.filter(layer => sources[layer.source]);
    var latLng = getCenter(mapConfig.center, mapConfig.projection);
    var zoom = mapConfig.zoom;
    var maxExtent = mapConfig.maxExtent || mapConfig.extent;

    // setup layers and sources with defaults
    setupSources(sources, config.defaultSourceType);
    setupLayers(layers, sources, ["gxp_osmsource", "gxp_wmssource", "gxp_googlesource", "gxp_bingsource", "gxp_mapquestsource", "gxp_olsource"]);
    return normalizeConfig({
        center: latLng,
        zoom: zoom,
        maxExtent: maxExtent, // TODO convert maxExtent
        layers: layers,
        projection: mapConfig.projection || 'EPSG:3857'
    });
};

/**
 * Utility to merge different configs
 */
export const mergeConfigs = function(baseConfig, mapConfig) {
    baseConfig.map = mapConfig.map;
    baseConfig.gsSources = mapConfig.gsSources || mapConfig.sources;
    return baseConfig;
};
export const getProxyUrl = function(config) {
    return config?.proxyUrl ? config.proxyUrl : defaultConfig.proxyUrl;
};

export const getProxiedUrl = function(uri, config = {}) {
    let sameOrigin = !(uri.indexOf("http") === 0);
    let urlParts = !sameOrigin && uri.match(/([^:]*:)\/\/([^:]*:?[^@]*@)?([^:\/\?]*):?([^\/\?]*)/);
    // ajax.addAuthenticationToAxios(config);
    if (urlParts) {
        let location = window.location;
        sameOrigin =
            urlParts[1] === location.protocol &&
            urlParts[3] === location.hostname;
        let uPort = urlParts[4];
        let lPort = location.port;
        let defaultPort = location.protocol.indexOf("https") === 0 ? 443 : 80;
        uPort = uPort === "" ? defaultPort + "" : uPort + "";
        lPort = lPort === "" ? defaultPort + "" : lPort + "";
        sameOrigin = sameOrigin && uPort === lPort;
    }
    if (!sameOrigin) {
        let proxyUrl = getProxyUrl(config);
        if (proxyUrl) {
            let useCORS = [];
            if (isObject(proxyUrl)) {
                useCORS = proxyUrl.useCORS || [];
                proxyUrl = proxyUrl.url;
            }
            const isCORS = useCORS.reduce((found, current) => found || uri.indexOf(current) === 0, false);
            if (!isCORS) {
                return proxyUrl + encodeURIComponent(uri);
            }
        }
    }
    return uri;
};
/**
* Utility to detect browser properties.
* Code from leaflet-src.js
*/
export const getBrowserProperties = function() {

    let ie = 'ActiveXObject' in window;
    let ielt9 = ie && !document.addEventListener;
    let ie11 = ie && (window.location.hash === !!window.MSInputMethodContext && !!document.documentMode);

    // terrible browser detection to work around Safari / iOS / Android browser bugs
    let ua = navigator.userAgent.toLowerCase();
    let webkit = ua.indexOf('webkit') !== -1;
    let chrome = ua.indexOf('chrome') !== -1;
    let safari = ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
    let phantomjs = ua.indexOf('phantom') !== -1;
    let android = ua.indexOf('android') !== -1;
    let android23 = ua.search('android [23]') !== -1;
    let gecko = ua.indexOf('gecko') !== -1;

    let mobile = isMobile.any; // typeof window.orientation !== undefined + '';
    let msPointer = !window.PointerEvent && window.MSPointerEvent;
    let pointer = window.PointerEvent && window.navigator.pointerEnabled && window.navigator.maxTouchPoints ||
                msPointer;
    let retina = 'devicePixelRatio' in window && window.devicePixelRatio > 1 ||
                'matchMedia' in window && window.matchMedia('(min-resolution:144dpi)') &&
                window.matchMedia('(min-resolution:144dpi)').matches;

    let doc = document.documentElement;
    let ie3d = ie && 'transition' in doc.style;
    let webkit3d = 'WebKitCSSMatrix' in window && 'm11' in new window.WebKitCSSMatrix() && !android23;
    let gecko3d = 'MozPerspective' in doc.style;
    let opera3d = 'OTransition' in doc.style;
    let any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d || opera3d) && !phantomjs;

    let touch = !window.L_NO_TOUCH && !phantomjs && (pointer || 'ontouchstart' in window ||
    window.DocumentTouch && document instanceof window.DocumentTouch);

    return {
        ie: ie,
        ie11: ie11,
        ielt9: ielt9,
        webkit: webkit,
        gecko: gecko && !webkit && !window.opera && !ie,

        android: android,
        android23: android23,

        chrome: chrome,

        safari,

        ie3d: ie3d,
        webkit3d: webkit3d,
        gecko3d: gecko3d,
        opera3d: opera3d,
        any3d: any3d,

        mobile: mobile,
        mobileWebkit: mobile && webkit,
        mobileWebkit3d: mobile && webkit3d,
        mobileOpera: mobile && window.opera,

        touch: touch,
        msPointer: msPointer,
        pointer: pointer,

        retina: retina
    };
};

export const getConfigProp = function(prop) {
    return defaultConfig[prop];
};
export const setConfigProp = function(prop, value) {
    defaultConfig[prop] = value;
};
export const removeConfigProp = function(prop) {
    delete defaultConfig[prop];
};

/**
 * Get misc settings from localConfig
 * @param {string} name of the prop to find
 * @param {any} defaultVal
 * @returns {any} value configured in misc settings
 */
export const getMiscSetting = (name, defaultVal) => {
    return get(getConfigProp('miscSettings') ?? {}, name, defaultVal);
};

// IDs for userSession
export const SESSION_IDS = {
    EVERYTHING: "everything",
    MAP: "map",
    MAP_POS: "map_pos",
    VISUALIZATION_MODE: "visualization_mode",
    LAYERS: "layers",
    ANNOTATIONS_LAYER: "annotations_layer",
    MEASUREMENTS_LAYER: "measurements_layer",
    BACKGROUND_LAYERS: "background_layers",
    OTHER_LAYERS: "other_layers",
    CATALOG_SERVICES: "catalog_services",
    WIDGETS: "widgets",
    SEARCH: "search",
    TEXT_SEARCH_SERVICES: "text_search_services",
    BOOKMARKS: "bookmarks",
    FEATURE_GRID: "feature_grid",
    OTHER: "other",
    USER_PLUGINS: "userPlugins"
};

/*
 * Function to update overrideConfig to clean specific settings
 * After the introduction of individual reset of the session, override Config is updated here. Previously it was clearing all session.
 * This function handles to update the overrideConfig(from session) to clean specific settings
 *
 * Layers are handled differently as they are partially updating properties(annotations, measurements, backgrounds, others) and merging function from loadash has problem in merging arrays of objects(it merges all properties of object from both arrays) which is used in `applyOverrides` function in this same file below
 * So for layers merge of original Config and overrideConfig  happens here. And applyOverrides use the value of overrideConfig
 * No Problem for arrays that gets entirely reset
 *
 * @param {object} override - current overrideConfig
 * @param {Array} thingsToClear - IDs of settings to be cleared
 * @param {object} originalConfig - original config
 * @param {object} customHandlers - session Saved By registerCustomSaveHandler
 * @returns {object} updated overrideConfig
*/
export const updateOverrideConfig = (override = {}, thingsToClear = [], originalConfig = {}, customHandlers = []) => {
    let overrideConfig = JSON.parse(JSON.stringify(override));

    if (thingsToClear?.includes(SESSION_IDS.EVERYTHING)) {
        overrideConfig = {};
        return overrideConfig;
    }

    // zoom and center
    if (thingsToClear.includes(SESSION_IDS.MAP_POS)) {
        delete overrideConfig.map.zoom;
        delete overrideConfig.map.center;
    }
    // visualization mode
    if (thingsToClear.includes(SESSION_IDS.VISUALIZATION_MODE)) {
        delete overrideConfig.map.visualizationMode;
    }

    // layers is the only case that partially gets reset, and there is problem to merge arrays with different index(it merges properties from two array on same index)
    // so merging original layers here. And while merging override config with original config: Override config is given priority. Check applyOverrides function below in this file.

    // annotation layers
    if (thingsToClear?.includes(SESSION_IDS.ANNOTATIONS_LAYER)) {
        overrideConfig.map.layers = [...overrideConfig.map?.layers?.filter((l)=>!l.id?.includes('annotations')), ...originalConfig?.map?.layers.filter((l)=>l.id?.includes('annotations'))];
    }
    // measurements layers
    if (thingsToClear?.includes(SESSION_IDS.MEASUREMENTS_LAYER)) {
        overrideConfig.map.layers = [...overrideConfig.map?.layers?.filter((l)=>!l?.name?.includes('measurements')), ...originalConfig?.map?.layers.filter(l=> l?.name?.includes('measurements'))];
    }
    // background layers
    if (thingsToClear?.includes(SESSION_IDS.BACKGROUND_LAYERS)) {
        overrideConfig.map.layers = [...overrideConfig.map?.layers?.filter((l)=>!l?.group?.includes('background')), ...originalConfig?.map?.layers.filter(l=> l?.group?.includes('background'))];
    }
    // other layers
    if (thingsToClear?.includes(SESSION_IDS.OTHER_LAYERS)) {
        overrideConfig.map.layers = [...overrideConfig.map?.layers?.filter(l=> l?.id?.includes('annotations') || l?.name?.includes('measurements') || l.group?.includes("background")), ...originalConfig?.map?.layers?.filter(l=> !l?.id?.includes('annotations') && !l?.name?.includes('measurements') && !l.group?.includes("background"))];
    }

    // reorder layers based on existing order of layers: since layers are modified in different orders, so sorting is important
    overrideConfig.map.layers = overrideConfig.map.layers.sort((a, b) =>
        override?.map?.layers.findIndex(item => item.id === a.id) - override?.map?.layers?.findIndex(item => item.id === b.id)
    );
    // catalog services
    if (thingsToClear?.includes(SESSION_IDS.CATALOG_SERVICES)) {
        delete overrideConfig.catalogServices;
    }
    // widgets
    if (thingsToClear?.includes(SESSION_IDS.WIDGETS)) {
        delete overrideConfig.widgetsConfig;
    }

    // search services
    if (thingsToClear?.includes(SESSION_IDS.TEXT_SEARCH_SERVICES)) {
        delete overrideConfig.map.text_search_config;
    }

    // bookmarks
    if (thingsToClear?.includes(SESSION_IDS.BOOKMARKS)) {
        delete overrideConfig.map.bookmark_search_config;
    }

    // feature grid
    if (thingsToClear?.includes(SESSION_IDS.FEATURE_GRID)) {
        // each properties are updated dynamically in featureGrid reducer(MAP_CONFIG_LOADED), so each attribute of featureGrid should be reset
        Object.keys(overrideConfig?.featureGrid ?? {}).forEach((fg)=>{
            overrideConfig.featureGrid[fg] = {}; // all properties's value are in object
        });
    }

    if (thingsToClear?.includes(SESSION_IDS.USER_PLUGINS)) {
        delete overrideConfig.context.userPlugins;
    }

    // handle config from registerCustomSaveConfig
    customHandlers?.forEach((k) => {
        if (thingsToClear?.includes(k)) {
            delete overrideConfig[k];
        }
    });


    return overrideConfig;

};
/**
* Merge two configurations
* While overriding, overrideConfig properties and original config has arrays then overrideConfig gets more priority
* merge from loadash has problem while merging arrays of objects(it merges properties of objects from both), So merge logic has been changed
 * @param {object} config the configuration to override
 * @param {object} override the data to use for override
 * @returns {object}
 */
export const applyOverrides = (config, override) => {
    const merged = mergeWith({}, config, override, (objValue, srcValue) => {
        // Till now layers is the only case that get partially reset and has case where two array with objects tries to merge, so merging with original config happens in updateOverrideConfig(above in the this file) while reset
        if (Array.isArray(objValue) && Array.isArray(srcValue)) {
            // Give priority if there are some elements in override
            if (srcValue.length > 0) {
                return [...srcValue];
            }
            return [...objValue];

        }
        // default merge rules for other cases
        // eslint-disable-next-line consistent-return
        return undefined;
    });
    return merged;
};
const ConfigUtils = {
    PropTypes: {
        center: centerPropType,
        config: PropTypes.shape({
            center: centerPropType,
            zoom: PropTypes.number.isRequired
        }),
        mapStateSource: PropTypes.string
    },
    getParsedUrl,
    getDefaults,
    setLocalConfigurationFile,
    loadConfiguration,
    getCenter,
    normalizeConfig,
    getUserConfiguration,
    getConfigurationOptions,
    getConfigUrl,
    convertFromLegacy,
    setupSources,
    normalizeSourceUrl,
    copySourceOptions,
    setupLayers,
    mergeConfigs,
    getProxyUrl,
    cleanDuplicatedQuestionMarks,
    getUrlWithoutParameters,
    filterUrlParams,
    getProxiedUrl,
    getBrowserProperties,
    setApiKeys,
    setUrlPlaceholders,
    replacePlaceholders,
    setLayerId,
    getConfigProp,
    setConfigProp,
    removeConfigProp,
    getMiscSetting
};

export default ConfigUtils;
