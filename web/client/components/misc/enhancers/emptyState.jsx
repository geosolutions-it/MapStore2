/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {branch} = require('recompose');
const DefaultEmptyComponent = require("../EmptyView");


/**
* Empty State enhancer. Enhances an object displaying an empty state view under a given condition
* @type {function}
* @name emptyState
* @memberof components.misc.enhancers
* @param {function} test The test for the properties. If it is true, use empty view
* @param {object} [emptyComponentProps] parameters for the empty components. The structure must reflect the props of the EmptyComponent(3rd) parameter (or its default @see [EmptyView](#components.misc.EmptyView))
* @param {Component} [EmptyComponent=EmptyView] the component to use for empty view. By default [EmptyView](#components.misc.EmptyView)
* @example
* emptyState(({data=[]}) => data.length === 0)(ComponentToEnhance);
*
*/
module.exports = (test, emptyComponentProps, EmptyComponent = DefaultEmptyComponent) => branch(
    test,
   // TODO return proper HOC
   () => () => <EmptyComponent {...emptyComponentProps} />);
