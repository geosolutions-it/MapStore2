/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import LocalizedString, { applyDefaultToLocalizedString } from '../../../I18N/LocalizedString';

const renderValue = (value) => {
    if (typeof value === 'string') {
        return value;
    }
    if (value === undefined) {
        return '';
    }
    return JSON.stringify(value);
};

/**
 * Renders the configured attributes of one feature.
 * Geometry is intentionally omitted because it is not part of feature.properties.
 */
const FeatureAttributes = ({ feature, attributes }) => {
    const properties = feature?.properties || {};
    const configuredAttributes = attributes?.length
        ? attributes.filter(({ visible = true }) => visible)
        : Object.keys(properties).map((name) => ({ name }));
    return (
        <div className="ms-properties-viewer">
            {feature?.id !== undefined ? (
                <div className="ms-properties-viewer-title">{`${feature.id}`}</div>
            ) : null}
            <ul className="ms-properties-viewer-body">
                {configuredAttributes
                    .filter(({ name }) => Object.prototype.hasOwnProperty.call(properties, name))
                    .map(({ name, alias }) => (
                        <li key={name}>
                            <div className="ms-properties-viewer-key">
                                <LocalizedString value={applyDefaultToLocalizedString(alias, name)}/>
                            </div>
                            <div className="ms-properties-viewer-value">{renderValue(properties[name])}</div>
                        </li>
                    ))}
            </ul>
        </div>
    );
};

FeatureAttributes.propTypes = {
    feature: PropTypes.object,
    attributes: PropTypes.array
};

export default FeatureAttributes;
