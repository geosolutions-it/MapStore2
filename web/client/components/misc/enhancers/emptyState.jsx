/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {isFunction} = require('lodash');
const {branch} = require('recompose');
const DefaultEmptyComponent = require("../EmptyView");


/**
* Empty State enhancer. Enhances an object displaying an empty state view under a given condition
* @type {function}
* @name emptyState
* @memberof components.misc.enhancers
* @param {function} isEmpty The test function for the properties. If it returns true, use empty view
* @param {object|function} [emptyComponentProps] parameters for the empty components.
* The structure must reflect the props of the EmptyComponent(3rd) parameter (or its default @see [EmptyView](#components.misc.EmptyView))
* If this parameter is a function, will call it getting the component properties to generate the emptyComponent props
* @param {Component} [EmptyComponent=EmptyView] the component to use for empty view. By default [EmptyView](#components.misc.EmptyView)
* @example
* emptyState(({data=[]}) => data.length === 0)(ComponentToEnhance);
*
*/
module.exports = (isEmpty, emptyComponentProps, EmptyComponent = DefaultEmptyComponent) => branch(
    isEmpty,
    // TODO return proper HOC
    () => (componentProps) => <EmptyComponent {...(emptyComponentProps && isFunction(emptyComponentProps) ? emptyComponentProps(componentProps) : emptyComponentProps)} />);
