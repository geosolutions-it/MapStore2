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
import { Glyphicon } from "react-bootstrap";

import Message from '../../../../I18N/Message';
import HTML from '../../../../I18N/HTML';
import BorderLayout from '../../../../layout/BorderLayout';
import emptyState from '../../../../misc/enhancers/emptyState';
import loadingState from '../../../../misc/enhancers/loadingState';
import LoadingSpinner from '../../../../misc/LoadingSpinner';
import MapCatalogForm from '../../../../maps/MapCatalogForm';
import SideGridCard from '../../../../misc/cardgrids/SideGrid';
import ButtonRB from "../../../../misc/Button";
import tooltip from "../../../../misc/enhancers/tooltip";
const Button = tooltip(ButtonRB);

const SideGrid = compose(
    loadingState(({ loading, items = [] }) => items.length === 0 && loading),
    emptyState(
        ({ loading, items = [] }) => items.length === 0 && !loading,
        {
            title: <Message msgId="catalog.noRecordsMatched" />,
            style: { transform: "translateY(50%)" }
        })

)(SideGridCard);

const Title = ({title = ''}) => (<>{title}
    <Button
        style={{marginLeft: 4}}
        tooltipPosition={"right"}
        tooltip={<HTML msgId="widgets.mapSwitcher.subTitle" />}
        className="maps-subtitle square-button-md no-border"
        key="info-sign">
        <Glyphicon glyph="info-sign" />
    </Button></>
);

const MapCatalog = ({
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
        header={header || <MapCatalogForm title={<Title title={title}/>}
            searchText={searchText}
            onSearchTextChange={setSearchText}
        />}
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
                if (event.ctrlKey || event.metaKey) {
                    return onSelected(isEmpty(selected)
                        ? castArray(map)
                        : castArray(selected).concat(map));
                }
                return onSelected(castArray(map));
            }} />
    </BorderLayout>);
};

export default MapCatalog;
