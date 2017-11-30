/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {branch} = require('recompose');

const DefaultLoadingomponent = require('../LoadingView');

const defaultTest = ({loading, isLoading}) => loading || isLoading && ((typeof isLoading === 'function') ? isLoading() : isLoading === true);
/**
* Empty State enhancer. Enhances an object displaying an empty state view under a given condition
* @type {function}
* @name emptyState
* @memberof components.misc.enhancers
* @param {function} isLoading The test function for loading condition. By default checks loading prop as boolean or isLoading as boolean or function
* @param {object} [loaderProps] You can pass `width` and `height` props to make the component adapt to your container
* @param {Component} [EmptyComponent=EmptyView] the component to use for empty view. By default [EmptyView](#components.misc.EmptyView)
* @example
* emptyState(({data=[]}) => data.length === 0)(ComponentToEnhance);
*
*/
module.exports = (isLoading = defaultTest, loaderProps ={}, LoadingComponent = DefaultLoadingomponent) => branch(
    isLoading,
   // TODO return proper HOC
   () => () => <LoadingComponent {...loaderProps} />);
