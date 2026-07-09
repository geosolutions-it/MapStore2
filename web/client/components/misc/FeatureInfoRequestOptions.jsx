/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ControlLabel, FormControl, FormGroup } from 'react-bootstrap';

import Message from '../I18N/Message';
import InfoPopover from '../widgets/widget/InfoPopover';
import {
    DEFAULT_FEATURE_COUNT,
    sanitizeFeatureInfoBuffer,
    sanitizeFeatureInfoMaxItems
} from '../../utils/FeatureInfoRequestUtils';

const updateOption = (featureInfo, key, value, sanitize) => {
    const sanitized = sanitize(value);
    const nextFeatureInfo = { ...(featureInfo || {}) };
    if (sanitized === undefined) {
        delete nextFeatureInfo[key];
    } else {
        nextFeatureInfo[key] = sanitized;
    }
    return nextFeatureInfo;
};

const FeatureInfoRequestOptions = ({
    featureInfo = {},
    onChange = () => {},
    showBuffer = false
}) => {
    return (
        <>
            <FormGroup controlId="feature-info-max-items">
                <ControlLabel>
                    <Message msgId="layerProperties.featureInfoRequestOptions.maxItems" />
                    &nbsp;<InfoPopover text={<Message msgId="layerProperties.featureInfoRequestOptions.maxItemsTooltip" />} />
                </ControlLabel>
                <FormControl
                    data-qa="feature-info-max-items"
                    type="number"
                    min={1}
                    step={1}
                    value={featureInfo.maxItems === undefined ? DEFAULT_FEATURE_COUNT : featureInfo.maxItems}
                    onChange={(event) => onChange(updateOption(featureInfo, 'maxItems', event.target.value, sanitizeFeatureInfoMaxItems))} />
            </FormGroup>
            {showBuffer ? (
                <FormGroup controlId="feature-info-buffer">
                    <ControlLabel>
                        <Message msgId="layerProperties.featureInfoRequestOptions.buffer" />
                        &nbsp;<InfoPopover text={<Message msgId="layerProperties.featureInfoRequestOptions.bufferTooltip" />} />
                    </ControlLabel>
                    <FormControl
                        data-qa="feature-info-buffer"
                        type="number"
                        min={0}
                        step={1}
                        value={featureInfo.buffer === undefined ? '' : featureInfo.buffer}
                        onChange={(event) => onChange(updateOption(featureInfo, 'buffer', event.target.value, sanitizeFeatureInfoBuffer))} />
                </FormGroup>
            ) : null}
        </>
    );
};

FeatureInfoRequestOptions.propTypes = {
    featureInfo: PropTypes.object,
    onChange: PropTypes.func,
    showBuffer: PropTypes.bool
};

export default FeatureInfoRequestOptions;
