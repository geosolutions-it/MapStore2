/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Rx = require('rxjs');
const { compose, mapPropsStream } = require('recompose');
const { castArray } = require('lodash');
const GeoStoreApi = require('../../../api/GeoStoreDAO');

const Icon = require('../../misc/FitIcon');

const withControllableState = require('../../misc/enhancers/withControllableState');
const withVirtualScroll = require('../../misc/enhancers/infiniteScroll/withInfiniteScroll');

const defaultPreview = <Icon glyph="geoserver" padding={20} />;

/*
 * converts record item into a item for SideGrid
 */
const resToProps = ({ results, totalCount }) => ({
    items: (castArray(results) || []).map((r = {}) => ({
        id: r.id,
        title: r.name,
        description: r.description,
        preview: r.thumbnail ? <img src={decodeURIComponent(r.thumbnail)} /> : defaultPreview,
        map: r
    })),
    total: totalCount
});
const PAGE_SIZE = 10;
/*
 * retrieves data from a catalog service and converts to props
 */
const loadPage = ({ text, options = {} }, page = 0) => Rx.Observable
    .fromPromise(GeoStoreApi.getResourcesByCategory("MAP", text, {
        params: {
            start: page * PAGE_SIZE,
            limit: PAGE_SIZE
        },
        options
    }))
    .map(resToProps)
    .catch(e => Rx.Observable.of({
        error: e,
        items: [],
        total: 0
    }));
const scrollSpyOptions = { querySelector: ".ms2-border-layout-body", pageSize: PAGE_SIZE };


module.exports = compose(
    // manage local search text
    withControllableState('searchText', "setSearchText", ""),
    // add virtual virtual scroll running loadPage stream to get data
    withVirtualScroll({ loadPage, scrollSpyOptions, hasMore: ({ total, items = [] } = {}) => total > items.length }),
    mapPropsStream(props$ =>
        props$.merge(props$.take(1).switchMap(({ loadFirst = () => { } }) =>
            props$
                .debounceTime(500)
                .startWith({ searchText: "" })
                .distinctUntilKeyChanged('searchText', (a, b) => a === b)
                .do(({ searchText, options } = {}) => loadFirst({ text: searchText, options }))
                .ignoreElements() // don't want to emit props
        )))

);
