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
    "defaultFilter": (props) => withProps(({disabled, tooltipMsgId: editTooltipMsgId}) =>{
        let placeholderMsgId = props.isWithinAttrTbl ? "featuregrid.attributeFilter.placeholders.default" : props.placeholderMsgId;
        let tooltipMsgId = props.isWithinAttrTbl ? disabled ? editTooltipMsgId : "featuregrid.attributeFilter.tooltips.default" : props.tooltipMsgId;
        return { type: props.type, isWithinAttrTbl: props.isWithinAttrTbl || false, placeholderMsgId, tooltipMsgId };
    })(DefaultFilter),
    "string": (props) => withProps(({disabled, tooltipMsgId: editTooltipMsgId}) =>{
        let placeholderMsgId = props.isWithinAttrTbl ? "featuregrid.attributeFilter.placeholders.string" : props.placeholderMsgId;
        let tooltipMsgId = props.isWithinAttrTbl ? disabled ? editTooltipMsgId : "featuregrid.attributeFilter.tooltips.string" : props.tooltipMsgId;
        return { type: 'string', isWithinAttrTbl: props.isWithinAttrTbl || false, placeholderMsgId, tooltipMsgId };
    })(StringFilter),
    "number": (props) => withProps(({disabled, tooltipMsgId: editTooltipMsgId}) =>{
        let placeholderMsgId = props.isWithinAttrTbl ? "featuregrid.attributeFilter.placeholders.number" : props.placeholderMsgId;
        let tooltipMsgId = props.isWithinAttrTbl ? disabled ? editTooltipMsgId : "featuregrid.attributeFilter.tooltips.number" : props.tooltipMsgId;
        return { type: 'number', isWithinAttrTbl: props.isWithinAttrTbl || false,  placeholderMsgId, tooltipMsgId };
    })(NumberFilter),
    "int": (props) => withProps(({disabled, tooltipMsgId: editTooltipMsgId}) =>{
        let placeholderMsgId = props.isWithinAttrTbl ? "featuregrid.attributeFilter.placeholders.number" : props.placeholderMsgId;
        let tooltipMsgId = props.isWithinAttrTbl ? disabled ? editTooltipMsgId : "featuregrid.attributeFilter.tooltips.number" : props.tooltipMsgId;
        return { type: 'integer', isWithinAttrTbl: props.isWithinAttrTbl || false,  placeholderMsgId, tooltipMsgId };
    })(NumberFilter),
    "date": (props) => withProps(({disabled, tooltipMsgId: editTooltipMsgId}) =>{
        let placeholderMsgId = props.isWithinAttrTbl ? "featuregrid.attributeFilter.placeholders.date" : props.placeholderMsgId;
        let tooltipMsgId = props.isWithinAttrTbl ? disabled ? editTooltipMsgId : "featuregrid.attributeFilter.tooltips.date" : props.tooltipMsgId;
        return { type: "date", isWithinAttrTbl: props.isWithinAttrTbl || false,  placeholderMsgId, tooltipMsgId };
    })(DateTimeFilter),
    "time": (props) => withProps(({disabled, tooltipMsgId: editTooltipMsgId}) =>{
        let placeholderMsgId = props.isWithinAttrTbl ? "featuregrid.attributeFilter.placeholders.date" : props.placeholderMsgId;
        let tooltipMsgId = props.isWithinAttrTbl ? disabled ? editTooltipMsgId : "featuregrid.attributeFilter.tooltips.date" : props.tooltipMsgId;
        return { type: "time", isWithinAttrTbl: props.isWithinAttrTbl || false,  placeholderMsgId, tooltipMsgId };
    })(DateTimeFilter),
    "date-time": (props) => withProps(({disabled, tooltipMsgId: editTooltipMsgId}) =>{
        let placeholderMsgId = props.isWithinAttrTbl ? "featuregrid.attributeFilter.placeholders.date" : props.placeholderMsgId;
        let tooltipMsgId = props.isWithinAttrTbl ? disabled ? editTooltipMsgId : "featuregrid.attributeFilter.tooltips.date" : props.tooltipMsgId;
        return { type: "date-time", isWithinAttrTbl: props.isWithinAttrTbl || false,  placeholderMsgId, tooltipMsgId };
    })(DateTimeFilter),
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
export const getFilterRenderer = ({name, type, isWithinAttrTbl}) => {
    if (name) {
        return getFilterRendererByName(name);
    }
    return types[type] ? types[type]({type, isWithinAttrTbl}) : types.defaultFilter({type, isWithinAttrTbl});
};


