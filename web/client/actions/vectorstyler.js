/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import uuid from 'uuid';

export const SET_VECTOR_RULE_PARAMETER = 'SET_VECTOR_RULE_PARAMETER';
export const NEW_VECTOR_RULE = 'NEW_VECTOR_RULE';
export const REMOVE_VECTOR_RULE = 'REMOVE_VECTOR_RULE';
export const SELECT_VECTOR_RULE = 'SELECT_VECTOR_RULE';
export const SET_VECTORSTYLE_PARAMETER = 'SET_VECTORSTYLE_PARAMETER';
export const SET_VECTOR_LAYER = 'SET_VECTOR_LAYER';

export function setVectorStyleParameter(component, property, value) {
    return {
        type: SET_VECTORSTYLE_PARAMETER,
        component,
        property,
        value
    };
}
export function setVectorRuleParameter(property, value) {
    return {
        type: SET_VECTOR_RULE_PARAMETER,
        property,
        value
    };
}
export function setVectorLayer(layer) {
    return {
        type: SET_VECTOR_LAYER,
        layer
    };
}
export function newVectorRule() {
    return {
        type: NEW_VECTOR_RULE,
        id: uuid.v1()
    };
}
export function removeVectorRule(id) {
    return {
        type: REMOVE_VECTOR_RULE,
        id
    };
}
export function selectVectorRule(id) {
    return {
        type: SELECT_VECTOR_RULE,
        id
    };
}
