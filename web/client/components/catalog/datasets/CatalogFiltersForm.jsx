/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import FiltersForm from '../resources/FiltersForm';
import useFilterFacets from '../hooks/useFilterFacets';
import { getFacetItems } from '../../../api/GeoNode';

/**
 * This  renders a  configurable input filters for documents catalog
 * @name CatalogFiltersForm
 * @prop {object[]} props.fields array of filter object configurations
 * @private
 */
function CatalogFiltersForm({
    id = 'ms-catalog-filter-form',
    onChange: onSearch,
    onClear,
    query,
    extent = {
        layers: [
            {
                type: 'osm',
                title: 'Open Street Map',
                name: 'mapnik',
                source: 'osm',
                group: 'background',
                visibility: true
            }
        ],
        style: {
            color: '#397AAB',
            opacity: 0.8,
            fillColor: '#397AAB',
            fillOpacity: 0.4,
            weight: 4
        }
    },
    fields: fieldsProp = [],
    monitoredState,
    show = true,
    onClose,
    currentService,
    filters
}) {
    const {
        fields
    } = useFilterFacets({
        query,
        fields: fieldsProp,
        request: (params) =>
            getFacetItems({
                ...params,
                baseUrl: currentService?.url
            }),
        monitoredState,
        visible: !!show
    }, [filters]);

    return (
        <FiltersForm
            id={id}
            extentProps={extent}
            fields={fields}
            query={query}
            onChange={(params) => onSearch(params)}
            onClear={onClear}
            onClose={onClose}
        />
    );
}

export default CatalogFiltersForm;
