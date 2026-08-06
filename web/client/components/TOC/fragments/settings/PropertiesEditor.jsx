/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';

import Message from '../../../I18N/Message';
import useIsMounted from '../../../../hooks/useIsMounted';
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
    const [describedFields, setDescribedFields] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const isMounted = useIsMounted();
    const layerFields = sourceLayer.fields || EMPTY_FIELDS;
    const schemaFields = describedFields ?? (layerFields.length ? layerFields : EMPTY_FIELDS);
    const attributes = getAttributes(schemaFields, value);

    const loadAttributes = (merge) => {
        const layerName = sourceLayer.search?.name
            || sourceLayer.search?.typeName
            || sourceLayer.name;
        const sourceUrl = sourceLayer.describeFeatureTypeURL
            || sourceLayer.search?.url
            || sourceLayer.url;
        if (!sourceUrl || !layerName) {
            setError(true);
            return;
        }
        setError(false);
        setLoading(true);
        describeFeatureType({
            layer: {
                ...sourceLayer,
                name: layerName
            }
        }).toPromise()
            .then(({ data }) => isMounted(() => {
                const nextFields = (data?.featureTypes?.[0]?.properties || [])
                    .filter((field) => !isGeometryType(field))
                    .map((field) => ({
                        name: field.name,
                        type: field.localType || field.type,
                        alias: ''
                    }));
                setLoading(false);
                setDescribedFields(nextFields);
                onChange(getAttributes(nextFields, merge ? value : []));
            }))
            .catch(() => isMounted(() => {
                setLoading(false);
                setError(true);
            }));
    };

    useEffect(() => {
        if (!layerFields.length && !value.length) {
            loadAttributes(true);
        }
    }, []);

    const updateAttribute = (name, property, nextValue) => {
        onChange(attributes.map((attribute) => attribute.name === name
            ? { ...attribute, [property]: nextValue }
            : attribute));
    };

    return (
        <div className="ms-properties-view-editor">
            <Fields
                title={<Message msgId="layerProperties.propertiesView.attributes" />}
                fields={attributes}
                currentLocale={currentLocale}
                loading={loading}
                error={error}
                showVisibility
                onChange={updateAttribute}
                onLoadFields={() => loadAttributes(true)}
                onClear={() => loadAttributes(false)}/>
            {!loading && !error && !attributes.length ? (
                <Alert bsStyle="info">
                    <Message msgId="layerProperties.propertiesView.noAttributes" />
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
