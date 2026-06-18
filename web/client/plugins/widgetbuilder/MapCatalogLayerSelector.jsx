/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import castArray from 'lodash/castArray';
import isEmpty from 'lodash/isEmpty';

import Message from '../../components/I18N/Message';
import BorderLayout from '../../components/layout/BorderLayout';
import Toolbar from '../../components/widgets/builder/wizard/common/layerselector/Toolbar';
import BuilderHeader from './BuilderHeader';
import withCatalogRequests from '../../components/catalog/datasets/hoc/catalogRequestsWorkflow';
import CatalogComponent from '../../components/catalog/datasets/Catalog';
import { layersSelector } from '../../selectors/layers';
import { currentLocaleSelector } from '../../selectors/locale';
import { isWidgetLayerSupported } from '../../utils/WidgetsUtils';

const MAP_LAYERS_SERVICE_KEY = 'maplayers';

const Catalog = withCatalogRequests(CatalogComponent);

const withBackButton = ({ toggleLayerSelector } = {}) => [{
    glyph: 'arrow-left',
    tooltipId: 'widgets.builder.wizard.backToChartOptionConfiguration',
    onClick: () => toggleLayerSelector(false)
}];

const filterableMapLayersSelector = createSelector(
    layersSelector,
    (layers) => (layers || []).filter(isWidgetLayerSupported)
);

const selector = createStructuredSelector({
    mapLayers: filterableMapLayersSelector,
    currentLocale: currentLocaleSelector
});

/*
 * Catalog API that lists the layers currently present in the map instead of
 * querying a remote service. It mirrors the shape of the other catalog APIs
 * (e.g. `./GeoNode`) so it can be plugged into the datasets `Catalog`
 * component through its `API` prop.
 *
 * The map layers are supplied on the service object as
 * `service.mapLayers`, so `textSearch` resolves locally without any network
 * request.
 */

const MAP_LAYERS_API = {
    getLayerTitle: (layer = {}) => {
        if (typeof layer.title === 'string') {
            return layer.title;
        }
        return layer.title?.default || layer.name || layer.id;
    },
    matchesText: (layer, text) => {
        if (!text) {
            return true;
        }
        const filterText = String(text).toLowerCase();
        return [MAP_LAYERS_API.getLayerTitle(layer), layer.name, layer.description]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(filterText));
    },
    textSearch: (url, startPosition = 1, maxRecords = 12, text, options = {}) => {
        const service = options?.options?.service ?? options?.service;
        const mapLayers = service?.mapLayers || [];
        const filtered = mapLayers.filter((layer) => MAP_LAYERS_API.matchesText(layer, text));
        const start = Math.max((startPosition || 1) - 1, 0);
        const page = filtered.slice(start, start + maxRecords);
        return Promise.resolve({
            numberOfRecordsMatched: filtered.length,
            numberOfRecordsReturned: page.length,
            records: page,
            service
        });
    },
    getCatalogRecords: (data) => {
        if (data && data.records) {
            return data.records.map((layer) => ({
                ...layer,
                serviceType: 'maplayers',
                title: MAP_LAYERS_API.getLayerTitle(layer),
                description: layer.description || layer.name,
                identifier: layer.id,
                // keep a reference to the original map layer so it can be returned as-is
                mapLayer: layer,
                isValid: true
            }));
        }
        return null;
    },
    getLayerFromRecord: (record, options, asPromise = false) => {
        const layer = record?.mapLayer || record;
        return asPromise ? Promise.resolve(layer) : layer;
    },
    getCapabilities: () => {
        return {
            filterSupport: false,
            orderBySupport: false
        };
    }
};

/**
 * Layer selector that browses the layers currently in the map
 */
const MapCatalogLayerSelector = connect(selector)(({
    onClose = () => {},
    onLayerChoice = () => {},
    toggleLayerSelector = () => {},
    showLayers,
    stepButtons,
    editorData = {},
    mapLayers = [],
    currentLocale
}) => {
    const [selected, setSelected] = useState(null);

    const services = useMemo(() => ({
        [MAP_LAYERS_SERVICE_KEY]: {
            type: MAP_LAYERS_SERVICE_KEY,
            title: 'Map layers',
            url: 'map-layers',
            autoload: false,
            mapLayers
        }
    }), [mapLayers]);

    const onItemClick = ({ record } = {}) => {
        setSelected((prev) => (prev?.identifier === record?.identifier ? null : record));
    };

    const onProceed = () => {
        if (!selected) {
            return;
        }
        const layer = MAP_LAYERS_API.getLayerFromRecord(selected);
        const widgetType = editorData?.widgetType;
        const proceedWithLayerObject = ['counter', 'table'].includes(widgetType);
        const proceedKey = widgetType === 'chart' ? 'chart-layers' : 'filter-add';
        if (proceedWithLayerObject) {
            onLayerChoice(layer);
        } else if (showLayers?.key) {
            const { key, ...rest } = showLayers;
            onLayerChoice(key, { ...rest, layer: castArray(layer) });
        } else {
            onLayerChoice(proceedKey, castArray(layer));
        }
        toggleLayerSelector(false);
    };

    return (
        <BorderLayout
            className="bg-body layer-selector"
            header={
                <BuilderHeader onClose={onClose}>
                    <Toolbar
                        stepButtons={showLayers ? withBackButton({ toggleLayerSelector }) : (stepButtons || withBackButton({ toggleLayerSelector }))}
                        canProceed={!isEmpty(selected)}
                        selected={!isEmpty(selected)}
                        onProceed={onProceed}
                    />
                </BuilderHeader>
            }
        >
            <Catalog
                API={{ [MAP_LAYERS_SERVICE_KEY]: MAP_LAYERS_API }}
                title={<Message msgId="widgets.builder.wizard.selectALayer" />}
                services={services}
                selectedService={MAP_LAYERS_SERVICE_KEY}
                showCatalogSelector={false}
                hideIdentifier
                multiSelect={false}
                includeAddToMap={false}
                locales={currentLocale}
                selected={selected}
                onSelect={onItemClick}
            />
        </BorderLayout>
    );
});

MapCatalogLayerSelector.propTypes = {
    onClose: PropTypes.func,
    onLayerChoice: PropTypes.func,
    toggleLayerSelector: PropTypes.func,
    showLayers: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    editorData: PropTypes.object
};

export default MapCatalogLayerSelector;
