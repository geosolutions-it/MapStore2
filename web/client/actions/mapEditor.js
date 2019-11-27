/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const SHOW = "MAP_EDITOR:SHOW";
export const HIDE = "MAP_EDITOR:HIDE";
export const SAVE = "MAP_EDITOR:SAVE";

/**
 * show map editor
 * @param {*} owner
 * @parma {object||string} map could be the map id to load or a map object
 */
export const show = (owner, map) => ({type: SHOW, owner, map});

/**
 * hide map editor
 */
export const hide = (owner) => ({ type: HIDE, owner });

/**
 *  lunch save on edited map
 */
export const save = (map, owner) => ({ type: SAVE, owner, map});
