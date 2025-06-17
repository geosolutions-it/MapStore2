/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isNil, isObject, isEmpty } from 'lodash';
import React from 'react';
import { compose, mapPropsStream, withPropsOnChange } from 'recompose';
import Rx from 'rxjs';
import uuid from 'uuid';
import API from '../../api/catalog';
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
 * assigns an identifier to a record
 */
/*
 * assigns an identifier to a record. The ID is required for local selection.
 * TODO: improve identifier generation.
 */
const getIdentifier = (r) =>
    r.identifier ? r.identifier
        :  r.provider
            ? r.provider + (r.variant ?? "") // existing tileprovider
            : (r.tileMapUrl // TMS 1.0.0
        || r.url + uuid()); //  default
/*
 * converts record item into a item for SideGrid
 */
const resToProps = ({records, result = {}, catalog = {}}) => ({
    items: (records || []).map((record = {}) => ({
        title: record.title && isObject(record.title) && record.title.default || record.title,
        caption: getIdentifier(record),
        description: record.description,
        preview: !catalog.hideThumbnail ? record.thumbnail ? <img src={record.thumbnail} /> : defaultPreview : null,
        record: {
            ...record, identifier: getIdentifier(record)
        }
    })),
    total: result && result.numberOfRecordsMatched
});
const PAGE_SIZE = 10;
/*
 * retrieves data from a catalog service and converts to props
 */
const loadPage = ({text, catalog = {}}, page = 0) => {
    const type = catalog.type;
    let options = {options: {service: catalog}};
    return Rx.Observable
        .fromPromise(API[type].textSearch(catalog.url, page * PAGE_SIZE + (type === "csw" ? 1 : 0), PAGE_SIZE, text, options))
        .map((result) => ({ result, records: API[type].getCatalogRecords(result || [], { url: catalog && catalog.url, service: catalog })}))
        .map(({records, result}) => resToProps({records, result, catalog}));
};
const scrollSpyOptions = {querySelector: ".ms2-border-layout-body .ms2-border-layout-content", pageSize: PAGE_SIZE};
const getCatalogItems = (items = [], selected = {}) => items.map(i =>
    (i === selected || selected && i && i.record && selected.identifier === i.record?.identifier)
        ? {...i, selected: true}
        : i
);
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
        props$.merge(props$.take(1).switchMap(({loadFirst = () => {}, services }) =>
            props$
                .debounceTime(500)
                .startWith({searchText: ""})
                .distinctUntilKeyChanged('searchText')
                .do(({searchText, selectedService: nextSelectedService} = {}) => !isEmpty(services[nextSelectedService]) && loadFirst({text: searchText, catalog: services[nextSelectedService] }))
                .ignoreElements() // don't want to emit props
        ))),
    withPropsOnChange(['selectedService'], props => {
        const service = props.services?.[props.selectedService];
        if (!isEmpty(service)) {
            props.loadFirst({text: props.searchText || "", catalog: service});
        }
    })
)(({ setSearchText = () => { }, selected, onRecordSelected, loading, searchText, items = [], total, catalog, services = {}, title, showCatalogSelector = true, error,
    onChangeSelectedService = () => {},
    selectedService, onChangeCatalogMode = () => {},
    getItems = (_items) => getCatalogItems(_items, selected),
    onItemClick = ({record} = {}) => onRecordSelected(record, catalog),
    canEditService
}) => {
    return (<BorderLayout
        className="compat-catalog"
        header={<CatalogForm onChangeCatalogMode={onChangeCatalogMode} onChangeSelectedService={onChangeSelectedService}
            services={Object.keys(services).map(key =>({ label: services[key]?.title, value: {...services[key], key}}))}
            selectedService={services[selectedService]} showCatalogSelector={showCatalogSelector}
            title={title}
            searchText={searchText}
            onSearchTextChange={setSearchText}
            canEditService={canEditService}/>}
        footer={<div className="catalog-footer">
            {loading ? <LoadingSpinner /> : null}
            {!isNil(total) ? <span className="res-info"><Message msgId="catalog.pageInfoInfinite" msgParams={{loaded: items.length, total}}/></span> : null}
        </div>}>
        <SideGrid
            items={getItems(items)}
            loading={loading}
            error={error}
            onItemClick={onItemClick}/>
    </BorderLayout>);
});
