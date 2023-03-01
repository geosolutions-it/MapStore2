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

export const getVisualizationModeFromMapLibrary = (mapType) => {
    const { visualizationMode = VisualizationModes._2D } = mapLibrariesConfiguration[mapType] || {};
    return visualizationMode;
};

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
