/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const loadMore = require('./loadMore');

const {compose} = require('recompose');
const withScrollSpy = require('./withScrollSpy');

/**
 * Add infinite scroll functionality to a component.
 *
 * To do that you must provide the following parameters:
 * @param {function} loadPage         A function that returns an observable that emits props with at least `{items: [items of the page], total: 100}`
 * @param {object} scrollSpyOptions  Options for the `withInfiniteScroll` enhancer
 * @return {HOC}                  The HOC to apply
 */
module.exports = ({
    loadPage,
    scrollSpyOptions,
    loadStreamOptions
}) => compose(
        loadMore(loadPage),
        withScrollSpy(scrollSpyOptions, loadStreamOptions)

);
