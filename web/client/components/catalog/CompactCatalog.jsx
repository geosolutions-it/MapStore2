/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isNil, isObject } from 'lodash';
import React from 'react';
import { compose, mapPropsStream } from 'recompose';
import Rx from 'rxjs';

import CSW from '../../api/CSW';
import mapBackground from '../../api/mapBackground';
import WMS from '../../api/WMS';
import WMTS from '../../api/WMTS';
import { getCatalogRecords } from '../../utils/CatalogUtils';
import Message from '../I18N/Message';
import BorderLayout from '../layout/BorderLayout';
import SideGridComp from '../misc/cardgrids/SideGrid';
import emptyState from '../misc/enhancers/emptyState';
import withVirtualScroll from '../misc/enhancers/infiniteScroll/withInfiniteScroll';
import loadingState from '../misc/enhancers/loadingState';
import withControllableState from '../misc/enhancers/withControllableState';
import Icon from '../misc/FitIcon';
import LoadingSpinner from '../misc/LoadingSpinner';
import CatalogForm from './CatalogForm';

const API = {
    "csw": CSW,
    "wms": WMS,
    "wmts": WMTS,
    "backgrounds": mapBackground
};

const defaultPreview = <Icon glyph="geoserver" padding={20}/>;
const SideGrid = compose(
    loadingState(({loading, items = []} ) => items.length === 0 && loading),
    emptyState(
        ({loading, error} ) => !loading && error,
        {
            title: <Message msgId="catalog.error" />,
            style: { transform: "translateY(50%)"}
        }),
    emptyState(
        ({loading, items = []} ) => items.length === 0 && !loading,
        {
            title: <Message msgId="catalog.noRecordsMatched" />,
            style: { transform: "translateY(50%)"}
        })

)(SideGridComp);
/*
 * converts record item into a item for SideGrid
 */
const resToProps = ({records, result = {}}) => ({
    items: (records || []).map((record = {}) => ({
        title: record.title && isObject(record.title) && record.title.default || record.title,
        caption: record.identifier,
        description: record.description,
        preview: record.thumbnail ? <img src="thumbnail" /> : defaultPreview,
        record
    })),
    total: result && result.numberOfRecordsMatched
});
const PAGE_SIZE = 10;
/*
 * retrieves data from a catalog service and converts to props
 */
const loadPage = ({text, catalog = {}}, page = 0) => Rx.Observable
    .fromPromise(API[catalog.type].textSearch(catalog.url, page * PAGE_SIZE + (catalog.type === "csw" ? 1 : 0), PAGE_SIZE, text))
    .map((result) => ({ result, records: getCatalogRecords(catalog.type, result || [], { url: catalog && catalog.url, service: catalog })}))
    .map(resToProps);
const scrollSpyOptions = {querySelector: ".ms2-border-layout-body .ms2-border-layout-content", pageSize: PAGE_SIZE};
/**
 * Compat catalog : Reusable catalog component, with infinite scroll.
 * You can simply pass the catalog to browse and the handler onRecordSelected.
 * @example
 * <CompactCatalog catalog={type: "csw", url: "..."} onSelected={selected => console.log(selected)} />
 * @name CompactCatalog
 * @memberof components.catalog
 * @prop {object} catalog the definition of the selected catalog as `{type: "wms"|"wmts"|"csw", url: "..."}`
 * @prop {object} selected the record selected. Passing this will show it as selected (highlighted) in the list. It will compare record's `identifier` property to guess the selected record in the list
 * @prop {function} onRecordSelected
 * @prop {boolean} showCatalogSelector if true shows the catalog selector - TODO
 * @prop {array} services TODO allow selection of catalog from a list
 * @prop {string} [searchText] the search text (if you want to control it)
 * @prop {function} [setSearchText] handler to get search text changes (if not defined, the component will control the text by it's own)
 */
export default compose(
    withControllableState('searchText', "setSearchText", ""),
    withVirtualScroll({loadPage, scrollSpyOptions}),
    mapPropsStream( props$ =>
        props$.merge(props$.take(1).switchMap(({catalog, loadFirst = () => {} }) =>
            props$
                .debounceTime(500)
                .startWith({searchText: "", catalog})
                .distinctUntilKeyChanged('searchText')
                .do(({searchText, catalog: nextCatalog} = {}) => loadFirst({text: searchText, catalog: nextCatalog}))
                .ignoreElements() // don't want to emit props
        )))

)(({ setSearchText = () => { }, selected, onRecordSelected, loading, searchText, items = [], total, catalog, services, title, showCatalogSelector, error}) => {
    return (<BorderLayout
        className="compat-catalog"
        header={<CatalogForm services={services ? services : [catalog]} showCatalogSelector={showCatalogSelector} title={title} searchText={searchText} onSearchTextChange={setSearchText}/>}
        footer={<div className="catalog-footer">
            {loading ? <LoadingSpinner /> : null}
            {!isNil(total) ? <span className="res-info"><Message msgId="catalog.pageInfoInfinite" msgParams={{loaded: items.length, total}}/></span> : null}
        </div>}>
        <SideGrid
            items={items.map(i =>
                i === selected
                        || selected
                        && i && i.record
                        && selected.identifier === i.record.identifier
                    ? {...i, selected: true}
                    : i)}
            loading={loading}
            error={error}
            onItemClick={({record} = {}) => onRecordSelected(record, catalog)}/>
    </BorderLayout>);
});
