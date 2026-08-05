/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, ControlLabel, Glyphicon } from 'react-bootstrap';

import Message from '../../../I18N/Message';
import LoadingSpinner from '../../../misc/LoadingSpinner';
import Fields from '../LayerFields/Fields';
import { describeFeatureType } from '../../../../observables/wfs';
import { isGeometryType } from '../../../../utils/ogc/WFS/base';
import { notPrimaryGeometryFields } from '../../../../utils/FeatureTypeUtils';

const EMPTY_FIELDS = [];
const GEOMETRY_FIELD_TYPES = new Set(['Geometry', ...Object.values(notPrimaryGeometryFields)]);

const isGeometryField = (field = {}) => {
    const type = field.type || '';
    return GEOMETRY_FIELD_TYPES.has(type) || isGeometryType({ ...field, type });
};

const getAttributes = (fields = [], configuredAttributes = []) => {
    const sourceFields = fields.length ? fields : configuredAttributes;
    return sourceFields
        .filter((field) => !isGeometryField(field))
        .map((field) => {
            const configuredAttribute = configuredAttributes.find(({ name }) => name === field.name);
            return {
                ...field,
                ...configuredAttribute,
                visible: configuredAttribute?.visible ?? field.visible ?? true
            };
        });
};

/**
 * Configures the attributes rendered by one Properties Identify view.
 * It loads the current layer schema when field metadata is not already available.
 */
const PropertiesEditor = ({ sourceLayer = {}, value = [], onChange = () => {}, currentLocale }) => {
    const [loadedFields, setLoadedFields] = useState([]);
    const [loadKey, setLoadKey] = useState(0);
    const [loadStatus, setLoadStatus] = useState('idle');
    const fields = sourceLayer.fields || EMPTY_FIELDS;
    const attributes = getAttributes(fields.length ? fields : loadedFields, value);

    useEffect(() => {
        if (fields.length || value.length) {
            setLoadStatus('ready');
            return () => {};
        }
        const layerName = sourceLayer.search?.name
            || sourceLayer.search?.typeName
            || sourceLayer.name;
        const sourceUrl = sourceLayer.describeFeatureTypeURL
            || sourceLayer.search?.url
            || sourceLayer.url;
        if (!sourceUrl || !layerName) {
            setLoadedFields([]);
            setLoadStatus('error');
            return () => {};
        }
        let cancelled = false;
        setLoadedFields([]);
        setLoadStatus('loading');
        describeFeatureType({
            layer: {
                ...sourceLayer,
                name: layerName
            }
        }).toPromise()
            .then(({ data }) => {
                if (!cancelled) {
                    const nextFields = (data?.featureTypes?.[0]?.properties || [])
                        .filter((field) => !isGeometryType(field))
                        .map((field) => ({
                            name: field.name,
                            type: field.localType || field.type,
                            alias: ''
                        }));
                    setLoadedFields(nextFields);
                    setLoadStatus('ready');
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setLoadStatus('error');
                }
            });
        return () => {
            cancelled = true;
        };
    }, [
        fields,
        value.length,
        loadKey,
        sourceLayer.describeFeatureTypeURL,
        sourceLayer.name,
        sourceLayer.search?.name,
        sourceLayer.search?.typeName,
        sourceLayer.search?.url,
        sourceLayer.url
    ]);

    const updateAttribute = (name, property, nextValue) => {
        onChange(attributes.map((attribute) => attribute.name === name
            ? { ...attribute, [property]: nextValue }
            : attribute));
    };

    return (
        <div className="ms-properties-view-editor">
            <ControlLabel><Message msgId="layerProperties.propertiesView.attributes" /></ControlLabel>
            {loadStatus === 'loading' ? (
                <div className="ms-properties-view-loading">
                    <LoadingSpinner /> <Message msgId="loading" />
                </div>
            ) : null}
            {loadStatus !== 'loading' && attributes.length ? (
                <Fields
                    fields={attributes}
                    currentLocale={currentLocale}
                    showToolbar={false}
                    showVisibility
                    onChange={updateAttribute}/>
            ) : null}
            {loadStatus === 'ready' && !attributes.length ? (
                <Alert bsStyle="info">
                    <Message msgId="layerProperties.propertiesView.noAttributes" />
                </Alert>
            ) : null}
            {loadStatus === 'error' ? (
                <Alert bsStyle="danger">
                    <Message msgId="layerProperties.propertiesView.attributesError" />
                    <Button
                        className="pull-right"
                        bsStyle="link"
                        onClick={() => setLoadKey((key) => key + 1)}>
                        <Glyphicon glyph="refresh" />&nbsp;
                        <Message msgId="layerProperties.propertiesView.retry" />
                    </Button>
                </Alert>
            ) : null}
        </div>
    );
};

PropertiesEditor.propTypes = {
    sourceLayer: PropTypes.object,
    value: PropTypes.array,
    onChange: PropTypes.func,
    currentLocale: PropTypes.string
};

export default PropertiesEditor;
