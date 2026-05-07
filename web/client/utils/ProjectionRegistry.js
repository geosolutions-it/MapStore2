/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import proj4 from 'proj4';
import { registerGridFiles } from './ProjectionUtils';

const registry = new Map(); // code → { code, def, extent, worldExtent, ... }
const listeners = [];

const FORMAT = {
    PROJ4: 'proj4',
    WKT1: 'wkt1',
    WKT2: 'wkt2',
    UNKNOWN: 'unknown'
};

export function detectFormat(def) {
    if (!def || typeof def !== 'string') {
        return FORMAT.UNKNOWN;
    }
    const trimmed = def.trim();
    if (trimmed.startsWith('+proj=') || trimmed.startsWith('+init=')) {
        return FORMAT.PROJ4;
    }
    if (trimmed.startsWith('PROJCS[') || trimmed.startsWith('GEOGCS[')) {
        return FORMAT.WKT1;
    }
    if (trimmed.startsWith('PROJCRS[') || trimmed.startsWith('GEOGCRS[') || trimmed.startsWith('BOUNDCRS[')) {
        return FORMAT.WKT2;
    }
    return FORMAT.UNKNOWN;
}

export function toDef(def) {
    const format = detectFormat(def);
    // proj4js handles proj4 strings and WKT1 natively; WKT2 coverage is
    // partial but in practice most WKT2 strings parse - let proj4 try, and
    // upstream validation (isValidDef in GeoServerProjections) rejects the
    // ones that don't yield a usable unit.
    if (format === FORMAT.PROJ4 || format === FORMAT.WKT1 || format === FORMAT.WKT2) {
        return { def, supported: true };
    }
    console.warn(`[ProjectionRegistry] Unknown projection def format, skipping: ${def}`);
    return { def, supported: false };
}

export function register(projDef) {
    const { code, def, extent, worldExtent } = projDef;
    if (!code) {
        return;
    }

    const { def: normalizedDef, supported } = toDef(def);

    if (supported) {
        proj4.defs(code, normalizedDef);
    }
    const proj4Metadata = proj4.defs(code);
    // If proj4 already knows the code (e.g. registered earlier or via the
    // legacy addProjections helper that recovers the def from proj4 itself),
    // the projection is usable regardless of how the input def parsed -
    // mark it supported so map-library adapters pick it up.
    const isSupported = supported || !!proj4Metadata;

    const axisOrientation = projDef?.axisOrientation || proj4Metadata?.axis || 'enu';
    const units = projDef?.units || proj4Metadata?.units || 'm';

    const entry = {
        code,
        def: normalizedDef,
        extent,
        worldExtent,
        axisOrientation,
        units,
        supported: isSupported
    };
    registry.set(code, entry);

    // Notify all map-library adapters
    listeners.forEach(fn => fn(entry));
}

export function unRegister(code) {
    if (registry.has(code)) {
        registry.delete(code);
        // Note: proj4js does not support un-defining a projection once defined, so we do not attempt to do that here
    }
}

export function unRegisterAll() {
    registry.clear();
    // Note: proj4js does not support un-defining projections once defined, so we do not attempt to do that here
}

export function registerAll(projDefs = []) {
    // Returns a Promise so callers can chain .then() - for plain defs this resolves immediately via Promise.resolve
    projDefs.forEach(register);
    return Promise.resolve();
}

/**
 *  Grid files require async loading - wrap registerAll for that case
 */
export function registerAllWithGridFiles(projDefs = [], gridFiles = null, proj4Instance = proj4) {
    const gridPromise = gridFiles
        ? registerGridFiles(gridFiles, proj4Instance) // imported from ProjectionUtils
        : Promise.resolve();
    return gridPromise.then(() => registerAll(projDefs));
}

/**
 * used by utils/openlayers/projUtils.js
 * @param {*} listener
 * @returns {function} Returns an unsubscribe function.
 */
export function onRegister(listener) {
    listeners.push(listener);
    // Replay already-registered defs so late subscribers get the full picture
    registry.forEach(listener);
    return () => {
        const idx = listeners.indexOf(listener);
        if (idx !== -1) listeners.splice(idx, 1);
    };
}

export function getAll() {
    return Array.from(registry.values());
}

export function getByCode(code) {
    return registry.get(code) ?? null;
}

// Projections natively supported by proj4.
const PROJ4_NATIVE_CODES = new Set(['EPSG:4326', 'EPSG:3857', 'EPSG:900913', 'CRS:84']);

export function isRegistered(code) {
    return registry.has(code) || PROJ4_NATIVE_CODES.has(code);
}

// CRS that are not built into OpenLayers but are commonly required by the
// application (e.g. EPSG:4269 carries extents that OL needs for view
// calculations). EPSG:4326 / EPSG:3857 are intentionally excluded - OL ships
// them with specific axis orientations and re-registering would overwrite
// those built-ins.
const BUILTIN_DEFS = [{
    code: "EPSG:4269",
    def: "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs",
    axisOrientation: "neu",
    extent: [-172.54, 23.81, -47.74, 86.46],
    worldExtent: [-172.54, 23.81, -47.74, 86.46]
}];
BUILTIN_DEFS.forEach(register);

const ProjectionRegistry = {
    register,
    registerAll,
    registerAllWithGridFiles,
    onRegister,
    getAll,
    getByCode,
    isRegistered,
    unRegister,
    unRegisterAll
};

export default ProjectionRegistry;
