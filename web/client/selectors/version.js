/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const versionSelector = (state) => state.version && state.version.current || '';
export const githubUrlSelector = (state) => state.version && state.version.githubUrl || '';
export const commitSelector = (state) => state.version && state.version.commit || '';
export const messageSelector = (state) => state.version && state.version.message || '';
export const dateSelector = (state) => state.version && state.version.date || '';
export const validateVersion = version => version && version.indexOf('${mapstore2.version}') === -1 && version.indexOf('no-version') === -1 ? true : false;
