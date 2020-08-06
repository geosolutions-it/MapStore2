/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Rx from 'rxjs';
import { isArray, zip, split, isNil, bind } from 'lodash';
import { compose, getContext } from 'recompose';
import { Glyphicon } from 'react-bootstrap';

import { getResource } from '../../api/persistence';
import Api from '../../api/GeoStoreDAO';

import withInfiniteScroll from '../misc/enhancers/infiniteScroll/withInfiniteScroll';
import withShareTool from '../resources/enhancers/withShareTool';
import withFilter from './enhancers/withFilter';
import withDelete from './enhancers/withDelete';
import withEdit from './enhancers/withEdit';
import LocaleUtils from '../../utils/LocaleUtils';
import Toolbar from '../misc/toolbar/Toolbar';
import Filter from '../misc/Filter';
import MapCatalog from '../maps/MapCatalog';

const getContextNames = ({results, ...other}) => {
    const maps = isArray(results) ? results : (results === "" ? [] : [results]);
    return maps.length === 0 ?
        Rx.Observable.of({results, ...other}) :
        Rx.Observable.forkJoin(
            maps.map(({context}) => context ?
                getResource(context, {includeAttributes: false, withData: false, withPermissions: false})
                    .switchMap(resource => Rx.Observable.of(resource.name))
                    .catch(() => Rx.Observable.of(null)) :
                Rx.Observable.of(null))
        ).map(contextNames => ({
            results: zip(maps, contextNames).map(
                ([curMap, contextName]) => ({...curMap, contextName})),
            ...other
        }));
};

const searchMaps = ({searchText, opts}) => Rx.Observable.defer(() => Api.getResourcesByCategory(
    'MAP',
    searchText || '*',
    opts
)).switchMap(response => getContextNames(response))
    .map(result => ({
        items: result.results,
        total: result.totalCount,
        loading: false
    })).catch(() => Rx.Observable.of({
        items: [],
        total: 0,
        loading: false
    }));

const loadPage = ({searchText = '', limit = 12} = {}, page = 0) => searchMaps({
    searchText,
    opts: {
        params: {
            includeAttributes: true,
            start: page * limit,
            limit
        }
    }
});

const onClickHandler = (map, router, mapType, toggleCatalog, reloadFunction) => {
    toggleCatalog();
    // reload if the same context was selected from catalog
    const {location} = router.history;
    if (!isNil(location.pathname)
    && (map.contextName === split(location.pathname, '/')[2])
    && (map.id === Number(split(location.pathname, '/')[3]))) {
        reloadFunction();
    } else {
        router.history.push(map.contextName ?
            "/context/" + map.contextName + "/" + map.id :
            "/viewer/" + mapType + "/" + map.id
        );
    }
};

const MapCatalogPanel = ({
    loading,
    mapType,
    items = [],
    filterText,
    onFilter = () => {},
    onDelete = () => {},
    onEdit = () => {},
    onShare = () => {},
    messages = {},
    router = {},
    toggleCatalog = () => {},
    reloadFunction = bind(window.location.reload, window.location)
}) => {
    const mapToItem = (map) => ({
        title: map.name,
        description: map.description,
        tools: <Toolbar
            btnDefaultProps={{
                className: 'square-button-md'
            }}
            buttons={[{
                glyph: 'trash',
                bsStyle: 'primary',
                tooltipId: 'mapCatalog.tooltips.delete',
                visible: map.canDelete,
                onClick: (e) => {
                    e.stopPropagation();
                    onDelete(map);
                }
            }, {
                glyph: 'wrench',
                bsStyle: 'primary',
                tooltipId: 'mapCatalog.tooltips.edit',
                visible: map.canEdit,
                onClick: (e) => {
                    e.stopPropagation();
                    onEdit(map);
                }
            }, {
                glyph: 'share-alt',
                bsStyle: 'primary',
                className: 'square-button-md',
                tooltipId: 'mapCatalog.tooltips.share',
                onClick: (e) => {
                    e.stopPropagation();
                    onShare(map);
                }
            }]}/>,
        preview:
            <div className="map-catalog-preview">
                {map.thumbnail && map.thumbnail !== 'NODATA' ?
                    <img src={decodeURIComponent(map.thumbnail)}/> :
                    <Glyphicon glyph="1-map"/>}
            </div>,
        onClick: () => onClickHandler(map, router, mapType, toggleCatalog, reloadFunction)
    });

    return (
        <div className="map-catalog-panel">
            <MapCatalog
                loading={loading}
                loaderProps={{
                    width: 480,
                    height: 480
                }}
                header={<Filter
                    filterText={filterText}
                    filterPlaceholder={LocaleUtils.getMessageById(messages, 'mapCatalog.filterPlaceholder')}
                    onFilter={onFilter}/>
                }
                items={items.map(mapToItem)}/>
        </div>
    );
};

export default compose(
    getContext({
        messages: PropTypes.object,
        router: PropTypes.object
    }),
    withInfiniteScroll({
        loadPage,
        loadMoreStreamOptions: {
            initialStreamDebounce: 300
        },
        scrollSpyOptions: {
            querySelector: '.map-catalog-panel > .map-catalog > .ms2-border-layout-body',
            pageSize: 12
        },
        hasMore: ({items = [], total = 0}) => items.length < total
    }),
    withFilter,
    withDelete,
    withEdit,
    withShareTool
)(MapCatalogPanel);
