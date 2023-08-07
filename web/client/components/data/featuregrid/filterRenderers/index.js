/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import { withProps } from 'recompose';

import DateTimeFilter from './DateTimeFilter';
import DefaultFilter from './DefaultFilter';
import GeometryFilter from './GeometryFilter';
import NumberFilter from './NumberFilter';
import StringFilter from './StringFilter';

const types = {
    "defaultFilter": (type) => withProps(() =>({type: type}))(DefaultFilter),
    "string": () => StringFilter,
    "number": () => NumberFilter,
    "int": () => NumberFilter,
    "date": () => withProps(() =>({type: "date"}))(DateTimeFilter),
    "time": () => withProps(() =>({type: "time"}))(DateTimeFilter),
    "date-time": () => withProps(() =>({type: "date-time"}))(DateTimeFilter),
    "geometry": () => GeometryFilter
};

const register = {};

export const registerFilterRenderer = (name, renderer) => {
    register[name] = renderer;
};

export const unregisterFilterRenderer = (name) => {
    delete register[name];
};

export const getFilterRendererByName = (name) => {
    return register[name];
};

/**
 * Returns the filter renderer for the given name or type. If the name is not found, it returns the default filter renderer for the given type.
 * If the type is not found, it returns the default filter renderer for the "defaultFilter" type.
 * @param {string} [params.name] the name of the filter renderer.
 * @param {string} [params.type] the type of the filter renderer. The available types are: "defaultFilter", "string", "number", "int", "date", "time", "date-time", "geometry".
 * @returns {React.Component} the filter renderer
 */
export const getFilterRenderer = ({name, type}) => {
    if (name) {
        return getFilterRendererByName(name);
    }
    return types[type] ? types[type](type) : types.defaultFilter(type);
};


