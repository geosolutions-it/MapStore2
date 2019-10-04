/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Rx = require('rxjs');
const { compose, withProps, mapPropsStream } = require('recompose');
const { castArray } = require('lodash');
const Message = require('../../I18N/Message');
const {getResources} = require('../../../api/persistence');
const Icon = require('../../misc/FitIcon');

const withControllableState = require('../../misc/enhancers/withControllableState');
const withVirtualScroll = require('../../misc/enhancers/infiniteScroll/withInfiniteScroll');

const defaultPreview = <Icon glyph="geoserver" padding={20} />;

/*
 * converts record item into a item for SideGrid
 */
const resToProps = ({ results, totalCount }) => ({
    items: (results !== "" && castArray(results) || []).map((r = {}) => ({
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
const loadPage = ({ text = "*", options = {} }, page = 0) => getResources({
    category: "MAP",
    query: text,
    options: {
        params: {
            start: page * PAGE_SIZE,
            limit: PAGE_SIZE
        },
        ...options
    }
})
    .map(resToProps)
    .catch(e => Rx.Observable.of({
        error: e,
        items: [],
        total: 0
    }));
const scrollSpyOptions = { querySelector: ".ms2-border-layout-body", pageSize: PAGE_SIZE };

/**
 * transforms loadPage to add the empty map item on top
 * @param {function} fn the original loadPage function
 */
const emptyMap = fn => (opts, page) => {
    if (page === 0 && opts && !opts.text) {
        return fn(opts, page).map(({ items, total, ...props}) => ({
            ...props,
            total,
            items: [{
                id: "EMPTY_MAP",
                title: <Message msgId="widgets.selectMap.emptyMap.title" />,
                description: <Message msgId="widgets.selectMap.emptyMap.description" />,
                preview: defaultPreview,
                map: {
                    id: "new.json"
                }
            }, ...items]
        }));
    }
    return fn(opts, page);
};

/**
 * Transforms withVirtualScroll to add an empty map on top.
 * @param {object} options
 */
const withEmptyMapVirtualScrollProperties = ({ loadPage: lp, scrollSpyOptions: sso, ...options}) => ({
    ...options,
    scrollSpyOptions: {
        skip: 1,
        ...sso
    },
    loadPage: emptyMap(lp),
    hasMore: ({total, items}) => {
        if (items && items.length >= 1 && items[0].id === "EMPTY_MAP") {
            return total > (items.length + 1);
        }
        return total > items.length;
    }
});
/**
 * Enhances the map catalog with virtual scroll including the support for empty map initial entry.
 * Provides skip property to allow widget's footer correct count and modifies properly the loadPage properties to use virtual scroll
 * To remove the the empty map you should use simply withVirtualScroll instead of `withEmptyVirtualScrollProperties` transformation and withProps enhancer
 */
const withEmptyMapVirtualScroll = compose(
    withVirtualScroll(withEmptyMapVirtualScrollProperties({ loadPage: loadPage, scrollSpyOptions, hasMore: ({ total, items = [] } = {}) => total > items.length })),
    withProps(({ items }) => ({ skip: items && items[0] && items[0].id === "EMPTY_MAP" ? 1 : 0}))
);
module.exports = {
    // manage local search text
    withSearchTextState: withControllableState('searchText', "setSearchText", ""),
    // add virtual virtual scroll running loadPage stream to get data
    withVirtualScroll: withVirtualScroll(({ loadPage: loadPage, scrollSpyOptions, hasMore: ({ total, items = [] } = {}) => total > items.length })),
    // same as above, but with empty map
    withEmptyMapVirtualScroll,
    // trigger loadFirst on text change
    searchOnTextChange: mapPropsStream(props$ =>
        props$.merge(props$.take(1).switchMap(({ loadFirst = () => { } }) =>
            props$
                .debounceTime(500)
                .startWith({ searchText: "" })
                .distinctUntilKeyChanged('searchText', (a, b) => a === b)
                .do(({ searchText, options } = {}) => loadFirst({ text: searchText, options }))
                .ignoreElements() // don't want to emit props
        )))

};
