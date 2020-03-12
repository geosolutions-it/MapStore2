/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { compose } = require('recompose');
const { isNil } = require('lodash');
const Message = require('../I18N/Message');
const MapCatalogForm = require('./MapCatalogForm');
const BorderLayout = require('../layout/BorderLayout');
const LoadingSpinner = require('../misc/LoadingSpinner');
const loadingState = require('../misc/enhancers/loadingState');
const emptyState = require('../misc/enhancers/emptyState');

const SideGrid = compose(
    loadingState(({ loading, items = [] }) => items.length === 0 && loading),
    emptyState(
        ({ loading, items = [] }) => items.length === 0 && !loading,
        {
            title: <Message msgId="catalog.noRecordsMatched" />,
            style: { transform: "translateY(50%)" }
        })

)(require('../misc/cardgrids/SideGrid'));
module.exports = ({
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
            <span>{loading && items.length > 0 ? <LoadingSpinner /> : null}</span>
            {!isNil(total) ?
                <span className="res-info"><Message msgId="catalog.pageInfoInfinite"
                    msgParams={{ loaded: items.length - skip, total }} /></span> : null}
        </div>}>
        <SideGrid
            loaderProps={loaderProps}
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
};


