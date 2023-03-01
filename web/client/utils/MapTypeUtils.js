import trimEnd from 'lodash/trimEnd';
import { getBrowserProperties, getConfigProp } from './ConfigUtils';

export const MapLibraries = {
    LEAFLET: 'leaflet',
    OPENLAYERS: 'openlayers',
    CESIUM: 'cesium'
};

export const VisualizationModes = {
    _2D: '2D',
    _3D: '3D'
};

const mapLibrariesConfiguration = {
    [MapLibraries.LEAFLET]: {
        visualizationMode: VisualizationModes._2D
    },
    [MapLibraries.OPENLAYERS]: {
        visualizationMode: VisualizationModes._2D
    },
    [MapLibraries.CESIUM]: {
        visualizationMode: VisualizationModes._3D
    }
};

const DEFAULT_MAP_TYPE_CONFIG = {
    [VisualizationModes._2D]: {
        mobile: MapLibraries.LEAFLET,
        desktop: MapLibraries.OPENLAYERS
    },
    [VisualizationModes._3D]: {
        mobile: MapLibraries.CESIUM,
        desktop: MapLibraries.CESIUM
    }
};

/**
 * Return the visualization mode given a map library
 * @param {string} mapLibrary the name of the map library, one of "leaflet", "openlayers" or "cesium"
 * @returns {string} "2D" or "3D" value
 */
export const getVisualizationModeFromMapLibrary = (mapLibrary) => {
    const { visualizationMode = VisualizationModes._2D } = mapLibrariesConfiguration[mapLibrary] || {};
    return visualizationMode;
};

/**
 * Return the map library given a visualization mode
 * @param {string} visualizationMode the name of the visualization mode, one of "2D" or "3D"
 * @returns {string} leaflet", "openlayers" or "cesium" value
 */
export const getMapLibraryFromVisualizationMode = (visualizationMode = VisualizationModes._2D) => {
    const { mobile } = getBrowserProperties();
    const customMapTypeConfig = getConfigProp('mapType') || {};
    const config = {
        ...DEFAULT_MAP_TYPE_CONFIG[visualizationMode],
        ...customMapTypeConfig[visualizationMode]
    };
    const device = mobile ? 'mobile' : 'desktop';
    return config[device];
};

export const viewerMapRegex = /(\/viewer\/)(\w+)(\/\w+\b(?<!\bcontext))/;
export const contextMapRegex = /(\/viewer\/)(\w+)(\/\w+\/context\/\w+)/;

export function findMapType(path = "") {
    return [viewerMapRegex, contextMapRegex].reduce((previous, regex) => {
        if (previous) return previous;
        const match = path.match(regex);
        return match && match[0] && match[2];
    }, null);
}


export function replaceMapType(path, newMapType) {
    // check context new regex  first
    const contextMatch = path.match(contextMapRegex);
    if (contextMatch) {
        const [, prefix, , suffix] = contextMatch;
        return `${prefix}${newMapType}${suffix}`;
    }
    // check normal viewer regex after
    const viewerMapMatch = path.match(viewerMapRegex);
    if (viewerMapMatch) {
        const [, prefix, , suffix] = viewerMapMatch;
        return `${prefix}${newMapType}${suffix}`;
    }
    return path;
}

/**
 * Remove the mapType given a path
 * @param {string} path the pathname to check
 * @returns {string} the pathname without mapType part
 */
export function removeMapType(path) {
    // check context new regex  first
    const contextMatch = path.match(contextMapRegex);
    if (contextMatch) {
        const [, prefix, , suffix] = contextMatch;
        return `${trimEnd(prefix, '/')}${suffix}`;
    }
    // check normal viewer regex after
    const viewerMapMatch = path.match(viewerMapRegex);
    if (viewerMapMatch) {
        const [, prefix, , suffix] = viewerMapMatch;
        return `${trimEnd(prefix, '/')}${suffix}`;
    }
    return path;
}
