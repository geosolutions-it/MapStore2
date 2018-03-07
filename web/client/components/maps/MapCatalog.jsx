/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { compose, mapPropsStream } = require('recompose');
const { isNil, castArray } = require('lodash');
const Message = require('../I18N/Message');
const Rx = require('rxjs');

const GeoStoreApi = require('../../api/GeoStoreDAO');


const BorderLayout = require('../layout/BorderLayout');
const LoadingSpinner = require('../misc/LoadingSpinner');
const withVirtualScroll = require('../misc/enhancers/infiniteScroll/withInfiniteScroll');
const loadingState = require('../misc/enhancers/loadingState');
const emptyState = require('../misc/enhancers/emptyState');
const withControllableState = require('../misc/enhancers/withControllableState');

const Icon = require('../misc/FitIcon');
const defaultPreview = <Icon glyph="geoserver" padding={20} />;
const SideGrid = compose(
    loadingState(({ loading, items = [] }) => items.length === 0 && loading),
    emptyState(
        ({ loading, items = [] }) => items.length === 0 && !loading,
        {
            title: <Message msgId="catalog.noRecordsMatched" />,
            style: { transform: "translateY(50%)" }
        })

)(require('../misc/cardgrids/SideGrid'));
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
const loadPage = ({ text, catalog = {} }, page = 0) => Rx.Observable
    .fromPromise(GeoStoreApi.getResourcesByCategory("MAP", text, {
        params: {
            start: page * PAGE_SIZE,
            limit: PAGE_SIZE
        }
    }))
    .map(resToProps)
    .catch(e => Rx.Observable.of({
        error: e,
        items: [],
        total: 0
    }));
const scrollSpyOptions = { querySelector: ".ms2-border-layout-body", pageSize: PAGE_SIZE };
const MapCatalogForm = require('./MapCatalogForm');
module.exports = compose(
    withControllableState('searchText', "setSearchText", ""),
    withVirtualScroll({ loadPage, scrollSpyOptions, hasMore: ({ total, items = [] } = {}) => total > items.length }),
    mapPropsStream(props$ =>
        props$.merge(props$.take(1).switchMap(({ catalog, loadFirst = () => { } }) =>
            props$
                .debounceTime(500)
                .startWith({ searchText: "" })
                .distinctUntilKeyChanged('searchText', (a, b) => a === b)
                .do(({ searchText } = {}) => loadFirst({ text: searchText }))
                .ignoreElements() // don't want to emit props
        )))

)(({ setSearchText = () => { }, selected, onSelected, loading, searchText, items = [], total }) => {
    return (<BorderLayout
        className="map-catalog"
        header={<MapCatalogForm title={<Message msgId={"catalog.title"} />} searchText={searchText} onSearchTextChange={setSearchText} />}
        footer={<div className="catalog-footer">
            <span>{loading ? <LoadingSpinner /> : null}</span>
            {!isNil(total) ? <span className="res-info"><Message msgId="catalog.pageInfoInfinite" msgParams={{ loaded: items.length, total }} /></span> : null}
        </div>}>
        <SideGrid
            items={items.map(i =>
                i === selected
                    || selected
                    && i && i.map
                    && selected.id === i.map.id
                    ? { ...i, selected: true }
                    : i)}
            loading={loading}
            onItemClick={({ map } = {}) => onSelected(map)} />
    </BorderLayout>);
});


