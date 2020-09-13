/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const {withProps} = require('recompose');
const DefaultFilter = require('./DefaultFilter');
const StringFilter = require('./StringFilter');
const NumberFilter = require('./NumberFilter');
const DateTimeFilter = require('./DateTimeFilter').default;
const GeometryFilter = require('./GeometryFilter').default;

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
module.exports = {
    getFilterRenderer: (type, props) => types[type] ? types[type](type, props) : types.defaultFilter(type, props),
    DefaultFilter,
    StringFilter,
    NumberFilter,
    DateTimeFilter,
    GeometryFilter
};
