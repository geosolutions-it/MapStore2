/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {compose, mapPropsStream, withState} = require('recompose');
const Rx = require('rxjs');

const API = {
    "csw": require('../../api/CSW')
};

const BorderLayout = require('../layout/BorderLayout');
const withVirtualScroll = require('../misc/enhancers/infiniteScroll/withInfiniteScroll');
const loadingState = require('../misc/enhancers/loadingState');
const emptyState = require('../misc/enhancers/emptyState');
const CatalogForm = require('./CatalogForm');

const SideGrid = compose(
    emptyState(({loading, items = []} ) => items.length === 0 && !loading),
    loadingState(({loading, items = []} ) => items.length === 0 && loading)
)(require('../misc/cardgrids/SideGrid'));
const resToProps = res => ({
    items: (res.records || []).map(({dc = {}} = {}) => ({title: dc.title})),
    loading: false,
    total: res.numberOfRecordsMatched
});
const PAGE_SIZE = 10;

const loadPage = (text, page = 0) => Rx.Observable.fromPromise(API.csw.textSearch("https://demo.geo-solutions.it/geoserver/csw", page * PAGE_SIZE + 1, PAGE_SIZE, text)).map(resToProps);
const scrollSpyOptions = {querySelector: ".ms2-border-layout-body", pageSize: PAGE_SIZE};
module.exports = compose(
        withState('searchText', "setSearchText", ""),
        withState('selected', "setSelected", null),
        withVirtualScroll({loadPage, scrollSpyOptions}),
        mapPropsStream( props$ => props$.merge(props$.take(1).switchMap(({loadFirst = () => {} }) =>
                props$
                    .pluck('searchText')
                    .debounceTime(500)
                    .startWith("")
                    .distinctUntilChanged()
                    .do(text => loadFirst(text))
                    .ignoreElements()
        )))

)(({setSearchText = () => {}, selected, setSelected = () => {}, loading, searchText, items= [], total}) => {
    return (<BorderLayout
                header={<CatalogForm searchText={searchText} onChange={setSearchText}/>}
                footer={<div>Record Matched: {items.length} of {total} - {loading ? "Loading" : null}</div>}>
                <SideGrid items={items.map(i => i === selected ? {...i, selected: true} : i)} onItemClick={i => setSelected(i)}/>
            </BorderLayout>);
});
