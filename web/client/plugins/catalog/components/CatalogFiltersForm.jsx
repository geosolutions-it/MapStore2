/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import FiltersForm from '../../ResourcesCatalog/components/FiltersForm';
import useParsePluginConfigExpressions from '../../ResourcesCatalog/hooks/useParsePluginConfigExpressions';
import useFilterFacets from '../../ResourcesCatalog/hooks/useFilterFacets';
import { getMonitoredStateSelector } from '../../ResourcesCatalog/selectors/resources';


import { userSelector } from '../../../selectors/security';
import { getFacetItems } from '../../../api/GeoNode';

/**
 * This  renders a  configurable input filters for documents catalog
 * @name CatalogFiltersForm
 * @prop {object[]} props.fields array of filter object configurations
 * @private
 */
function CatalogFiltersForm({
    id = 'ms-filter-form',
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
    fields: fieldsProp = [
        {
            id: "category",
            type: "select",
            order: 5,
            facet: "category",
            label: "Category",
            key: "filter{category.identifier.in}"
        },
        {
            id: "keyword",
            type: "select",
            order: 6,
            facet: "keyword",
            label: "Keyword",
            key: "filter{keywords.slug.in}"
        },
        {
            id: "region",
            type: "select",
            order: 7,
            facet: "place",
            label: "Region",
            key: "filter{regions.code.in}"
        },
        {
            type: "date-range",
            filterKey: "date",
            labelId: "Date Filter"
        },
        {
            labelId: "Extent Filter",
            type: "extent"
        }
    ],
    monitoredState,
    show = true,
    user,
    availableResourceTypes = ['MAP', 'DASHBOARD', 'GEOSTORY', 'CONTEXT'],
    onClose,
    currentservice,
}, context) {
    console.log(currentservice,'current service')

    const {
        fields
    } = useFilterFacets({
        query,
        fields: fieldsProp,
        request: ({ fields: fieldsArg, query: queryArg, monitoredState: monitoredStateArg }) =>
            getFacetItems({
                fields: fieldsArg,
                query: queryArg,
                monitoredState: monitoredStateArg,
                baseUrl: currentservice?.url || 'https://development.demo.geonode.org' // or from config
            }),
        monitoredState,
        visible: !!show
    }, [user]);

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

CatalogFiltersForm.contextTypes = {
    plugins: PropTypes.object
};

const CatalogFiltersFormConnected = connect(
    createStructuredSelector({
        user: userSelector,
        monitoredState: getMonitoredStateSelector
    }), {}
)(CatalogFiltersForm);
export default CatalogFiltersFormConnected;