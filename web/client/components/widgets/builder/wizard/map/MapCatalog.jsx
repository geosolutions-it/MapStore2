/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isNil, castArray, isEmpty } from 'lodash';
import React from 'react';
import { compose } from 'recompose';

import Message from '../../../../I18N/Message';
import BorderLayout from '../../../../layout/BorderLayout';
import emptyState from '../../../../misc/enhancers/emptyState';
import loadingState from '../../../../misc/enhancers/loadingState';
import LoadingSpinner from '../../../../misc/LoadingSpinner';
import MapCatalogForm from '../../../../maps/MapCatalogForm';

const SideGrid = compose(
    loadingState(({ loading, items = [] }) => items.length === 0 && loading),
    emptyState(
        ({ loading, items = [] }) => items.length === 0 && !loading,
        {
            title: <Message msgId="catalog.noRecordsMatched" />,
            style: { transform: "translateY(50%)" }
        })

)(require('../../../../misc/cardgrids/SideGrid').default);

export default ({
    setSearchText = () => { },
    selected,
    skip = 0,
    onSelected,
    loading,
    searchText,
    items = [],
    loaderProps = {},
    total,
    header,
    title = <Message msgId={"maps.title"} />
}) => {
    return (<BorderLayout
        className="map-catalog"
        header={header || <MapCatalogForm title={title} searchText={searchText} onSearchTextChange={setSearchText} />}
        footer={<div className="catalog-footer">
            {loading && items.length > 0 ? <LoadingSpinner /> : null}
            {!isNil(total) ?
                <span className="res-info"><Message msgId="catalog.pageInfoInfinite"
                    msgParams={{ loaded: items.length - skip, total }} /></span> : null}
        </div>}>
        <SideGrid
            loaderProps={loaderProps}
            items={items.map(i =>
                !isEmpty(selected)
                    && i && i.map
                    && selected.some(s => s.id === i.map.id)
                    ? { ...i, selected: true }
                    : i)}
            loading={loading}
            onItemClick={({ map } = {}, props, event) => {
                if (event.ctrlKey) {
                    return onSelected(isEmpty(selected)
                        ? castArray(map)
                        : castArray(selected).concat(map));
                }
                return onSelected(castArray(map));
            }} />
    </BorderLayout>);
};
