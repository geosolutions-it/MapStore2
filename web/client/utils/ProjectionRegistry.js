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
    if (format === FORMAT.PROJ4 || format === FORMAT.WKT1) {
        // proj4js handles both natively
        return { def, supported: true };
    }
    if (format === FORMAT.WKT2) {
        // WKT2 support in proj4js is partial - log a warning and skip registration
        // Extension point: plug in a WKT2 → proj4 converter here in the future
        console.warn(`[ProjectionRegistry] WKT2 format is not fully supported for registration. Code will be stored but may not project correctly.`);
        return { def, supported: false };
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

    const axisOrientation = projDef?.axisOrientation || proj4Metadata?.axis || 'enu';
    const units = projDef?.units || proj4Metadata?.units || 'm';

    const entry = {
        code,
        def: normalizedDef,
        extent,
        worldExtent,
        axisOrientation,
        units,
        supported
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

export function isRegistered(code) {
    const has = registry.has(code);
    return has;
}

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

window.ProjectionRegistry = ProjectionRegistry; // for debugging and external use - not required for internal functionality

export default ProjectionRegistry;
