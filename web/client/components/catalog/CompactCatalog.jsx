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
const {getCatalogRecords} = require('../../utils/CatalogUtils');
const Icon = require('../misc/FitIcon');
const defaultPreview = <Icon glyph="geoserver" padding={20}/>;
const SideGrid = compose(
    loadingState(({loading, items = []} ) => items.length === 0 && loading),
    emptyState(({loading, items = []} ) => items.length === 0 && !loading)

)(require('../misc/cardgrids/SideGrid'));
/*
 * converts record item into a item for SideGrid
 */
const resToProps = res => ({
    items: (res.records || []).map((record = {}) => ({
        title: record.title,
        caption: record.identifier,
        description: record.description,
        preview: record.thumbnail ? <img src="thumbnail" /> : defaultPreview,
        record
    })),
    loading: false,
    total: res.numberOfRecordsMatched
});
const PAGE_SIZE = 10;
/*
 * retrieves data from a catalog service
 */
const loadPage = ({text, catalog = {}}, page = 0) => Rx.Observable
    .fromPromise(API[catalog.type].textSearch(catalog.URL, page * PAGE_SIZE + (catalog.type === "csw" ? 1 : 0), PAGE_SIZE, text))
    .map((result) => ({result, records: getCatalogRecords(catalog.type, result || [])}))
    .map(resToProps);
const scrollSpyOptions = {querySelector: ".ms2-border-layout-body", pageSize: PAGE_SIZE};
module.exports = compose(
        withState('searchText', "setSearchText", ""),
        withVirtualScroll({loadPage, scrollSpyOptions}),
        mapPropsStream( props$ =>
            props$.merge(props$.take(1).switchMap(({catalog, loadFirst = () => {} }) =>
                props$
                    .debounceTime(500)
                    .startWith({searchText: "", catalog})
                    .distinct(({searchText} = {}) => searchText)
                    .do(({searchText, catalog: nextCatalog} = {}) => loadFirst({text: searchText, catalog: nextCatalog}))
                    .ignoreElements()
        )))

)(({setSearchText = () => {}, selected, onRecordSelected, loading, searchText, items= [], total, catalog}) => {
    return (<BorderLayout
                header={<CatalogForm searchText={searchText} onChange={setSearchText}/>}
                footer={<div>Record Matched: {items.length} of {total} - {loading ? <div className="toc-inline-loader"></div> : null}</div>}>
                <SideGrid items={items.map(i => i === selected ? {...i, selected: selected.identifier === i.identifier} : i)} loading={loading} onItemClick={({record} = {}) => onRecordSelected(record, catalog)}/>
            </BorderLayout>);
});
