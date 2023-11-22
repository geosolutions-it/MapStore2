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
    "defaultFilter": (props) => withProps(() =>({type: props.type, isShownOperators: props.isShownOperators || false}))(DefaultFilter),
    "string": (props) => withProps(() =>({type: 'string', isShownOperators: props.isShownOperators || false}))(StringFilter),
    "number": (props) => withProps(() =>({type: 'number', isShownOperators: props.isShownOperators || false}))(NumberFilter),
    "int": (props) => withProps(() =>({type: 'integer', isShownOperators: props.isShownOperators || false}))(NumberFilter),
    "date": (props) => withProps(() =>({type: "date", isShownOperators: props.isShownOperators || false}))(DateTimeFilter),
    "time": (props) => withProps(() =>({type: "time", isShownOperators: props.isShownOperators || false}))(DateTimeFilter),
    "date-time": (props) => withProps(() =>({type: "date-time", isShownOperators: props.isShownOperators || false}))(DateTimeFilter),
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
export const getFilterRenderer = ({name, type, isShownOperators}) => {
    if (name) {
        return getFilterRendererByName(name);
    }
    return types[type] ? types[type]({type, isShownOperators}) : types.defaultFilter({type, isShownOperators});
};


