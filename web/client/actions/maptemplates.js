/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const CLEAR_MAP_TEMPLATES = 'MAPTEMPLATES:CLEAR_MAP_TEMPLATES';
export const clearMapTemplates = () => ({ type: CLEAR_MAP_TEMPLATES });

export const SET_TEMPLATES = 'MAPTEMPLATES:SET_TEMPLATES';
export const setTemplates = (templates) => ({ type: SET_TEMPLATES, templates});

export const SET_ALLOWED_TEMPLATES = 'MAPTEMPLATES:SET_ALLOWED_TEMPLATES';
export const setAllowedTemplates = (templates) => ({ type: SET_ALLOWED_TEMPLATES, templates});

export const OPEN_MAP_TEMPLATES_PANEL = 'MAPTEMPLATES:OPEN_MAP_TEMPLATES_PANEL';
export const openMapTemplatesPanel = () => ({ type: OPEN_MAP_TEMPLATES_PANEL });

export const SET_MAP_TEMPLATES_LOADED = 'MAPTEMPLATES:SET_MAP_TEMPLATES_LOADED';
export const setMapTemplatesLoaded = (loaded, error) => ({ type: SET_MAP_TEMPLATES_LOADED, loaded, error });

export const SET_TEMPLATE_DATA = 'MAPTEMPLATES:SET_TEMPLATE_DATA';
export const setTemplateData = (id, data) => ({ type: SET_TEMPLATE_DATA, id, data });

export const SET_TEMPLATE_LOADING = 'MAPTEMPLATES:SET_TEMPLATE_LOADING';
export const setTemplateLoading = (id, loadingValue) => ({ type: SET_TEMPLATE_LOADING, id, loadingValue });

export const MERGE_TEMPLATE = 'MAPTEMPLATES:MERGE_TEMPLATE';
export const mergeTemplate = (id) => ({ type: MERGE_TEMPLATE, id });

export const REPLACE_TEMPLATE = 'MAPTEMPLATES:REPLACE_TEMPLATE';
export const replaceTemplate = (id) => ({ type: REPLACE_TEMPLATE, id });

export const TOGGLE_FAVOURITE_TEMPLATE = 'MAPTEMPLATES:TOGGLE_FAVOURITE_TEMPLATE';
export const toggleFavouriteTemplate  = (id) => ({ type: TOGGLE_FAVOURITE_TEMPLATE, id });
