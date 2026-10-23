/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// DXF diagnostics need a level in memory, not access to browser storage.
const levels = ['trace', 'debug', 'info', 'warn', 'error', 'silent'];
let level = 4;
const logger = Object.fromEntries(levels.slice(0, 5).map((name, index) => [name, (...args) => {
    if (index >= level) (console[name] || console.log).apply(console, args); // eslint-disable-line no-console
}]));
logger.setLevel = value => { level = Math.max(0, levels.indexOf(String(value).toLowerCase())); };
export default logger;
