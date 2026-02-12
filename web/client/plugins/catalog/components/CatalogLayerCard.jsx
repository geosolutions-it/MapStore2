/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState } from 'react';
import { Glyphicon, Checkbox, } from 'react-bootstrap';
import Button from '../../../components/layout/Button';
import ResourceCard from '../../ResourcesCatalog/components/ResourceCard';
import { isObject, isEmpty } from 'lodash';
import tooltip from '../../../components/misc/enhancers/tooltip';
import Message from '../../../components/I18N/Message';
import { addLayerToMap, resourceToLayerConfig } from '../utils/layerUtils';


const checkboxStyle = {
    position: 'absolute',
    top: '10px',
    left: '10px',
    zIndex: 10,
    borderRadius: '4px',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const CatalogLayerCard = ({
    record,
    idx,
    currentLocale,
    onError,
    service,
    defaultFormat,
    layerBaseConfig,
    authkeyParamNames,
    catalogType,
    catalogURL,
    crs,
    selectedService,
    source,
    onAddBackground,
    onAddBackgroundProperties,
    onLayerAdd,
    zoomToLayer,
    messages,
    hideThumbnail,
    isChecked = false,
    onToggle = () => {},
    panel = true,
    readOnly = false
}) => {
    const [loading, setLoading] = useState(false);
    const record_ = record?.record || record;

    const getTitle = (title) => {
        return isObject(title) ? title[currentLocale] || title.default : title || '';
    };

    const onAddToMap = (data, serviceType = data.serviceType) => {
        if (serviceType === 'geonode'){
            const layer = resourceToLayerConfig(record_);
            if (layer) {
                onLayerAdd(layer,{
                    zoomToLayer
                });
                return Promise.resolve();
            }
        }
        setLoading(true);
        return addLayerToMap({
            record: { ...data, serviceType },
            service,
            defaultFormat,
            layerBaseConfig,
            authkeyParamNames,
            catalogType,
            catalogURL,
            crs,
            selectedService,
            onError,
            onLayerAdd,
            source,
            onAddBackground,
            onAddBackgroundProperties,
            zoomToLayer
        }).finally(() => {
            setLoading(false);
        });
    };

    // To do 
    const generateTags = () => {
        const serviceTagMap = {
            wms: { name: 'WMS', color: '#4A90E2' },
            wmts: { name: 'WMTS', color: '#F5A623' },
            wfs: { name: 'WFS', color: '#7ED321' },
            cog: { name: 'COG', color: '#BD10E0' },
            '3dtiles': { name: '3D Tiles', color: '#50E3C2' },
            csw: { name: 'CSW', color: '#B8E986' },
            arcgis: { name: 'ArcGIS', color: '#417505' }
        };

        const tags = [];
        if (record_.serviceType && serviceTagMap[record_.serviceType]) {
            tags.push(serviceTagMap[record_.serviceType]);
        }
        if (record_?.additionalOGCServices && !isEmpty(record_.additionalOGCServices)) {
            Object.keys(record_.additionalOGCServices).forEach(serviceType => {
                if (serviceTagMap[serviceType] && !tags.some(t => t.name === serviceTagMap[serviceType].name)) {
                    tags.push(serviceTagMap[serviceType]);
                }
            });
        }

        return tags;
    };

    const hasAdditionalServices = !isEmpty(record_?.additionalOGCServices);
    
    const buttons = [{
        Component: (props) => (
            <Button
                {...props}
                className="square-button-md"
                variant="primary"
                disabled={loading}
                onClick={(e) => {
                    e.stopPropagation();
                    onAddToMap(record_);
                }}
            >
                {loading ? <Glyphicon glyph="refresh" /> : <Glyphicon glyph="plus" />}
            </Button>
        ),
        name: 'addToMap',
        target: 'card-buttons'
    }];

    // If there are additional services, create options dropdown with all services
    const options = [];
    if (hasAdditionalServices) {
        options.push({
            Component: () => (
                <li
                    className='_padding-lr-md _padding-tb-sm'
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToMap(record_);
                    }}
                >
                    <Message msgId={`catalog.additionalOGCServices.${record_.serviceType || 'wms'}`} />
                </li>
            ),
            name: `add-${record_.serviceType || 'wms'}`,
            target: 'card-options'
        });

        Object.keys(record_?.additionalOGCServices || {}).forEach(serviceType => {
            options.push({
                Component: () => (
                    <li
                        className='_padding-lr-md _padding-tb-sm'
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToMap(record_.additionalOGCServices[serviceType], serviceType);
                        }}
                    >
                        <Message msgId={`catalog.additionalOGCServices.${serviceType}`} />
                    </li>
                ),
                name: `add-${serviceType}`,
                target: 'card-options'
            });
        });
    }

    return (
        <li
            key={`${idx}:${record_?.title}`}
            style={{
                minWidth: panel ? '100%' : 'calc(25% - 0.75rem)',
                maxWidth: panel ? '100%' : 'calc(25% - 0.75rem)',
                width: panel ? '100%' : 'calc(25% - 0.75rem)',
                position: 'relative',
                flexShrink: 0
            }}
        >
            <div
                style={{
                    ...checkboxStyle,
                    ...(hideThumbnail ? {
                        top: '8px',
                        left: '8px',
                    } : {})
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <Checkbox
                    checked={isChecked}
                    onChange={(event) => {
                        event.stopPropagation();
                        onToggle(record, event.target.checked);
                    }}
                />
            </div>
            <ResourceCard
                data={{
                    ...record_,
                    '@extras': {
                        info: {
                            thumbnailUrl: record_?.thumbnail_url,
                            icon: { glyph: 'add-layer' },
                            title: getTitle(record_?.title),
                            creator: record_.metadata?.creator || record_?.creator || 'Unknown',
                            description: record_?.description || 'No description available'
                        }
                    },
                    tags: generateTags()
                }}
                options={options}
                buttons={buttons}
                readOnly={readOnly}
                hideThumbnail={hideThumbnail}
                onClick={() => onToggle(record, !isChecked)}
                layoutCardsStyle="grid"
                metadata={[
                    { path: '@extras.info.title', target: 'header' },
                    { path: 'identifier', target: 'body' },
                    { path: '@extras.info.description', target: 'body', ellipsis: false },
                    { path: 'tags', itemColor: 'color', itemValue: 'name', showFullContent: true, type: 'tag' },
                    { path: '@extras.info.creator', target: 'footer', icon: { glyph: 'user' }, noDataLabelId: 'resourcesCatalog.emptyUnknown', width: 10, disableIf: false }
                ]}
            />
            {loading && (
                <div className="ms-resource-card-loading" />
            )}
        </li>
    );
};

export default CatalogLayerCard;
