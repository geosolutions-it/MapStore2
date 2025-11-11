/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import withTooltip from '../../../misc/enhancers/tooltip';
import { Glyphicon } from 'react-bootstrap';
import { isNil } from 'lodash';
import { getRestrictionsMessageInfo } from '../../../../utils/FeatureGridUtils';
import Message from '../../../I18N/Message';

const GlyphiconIndicator = withTooltip(Glyphicon);

const CellValidationErrorMessage = ({
    value,
    valid,
    column,
    changed
}) => {

    if (valid || column.key === 'geometry') {
        return null;
    }
    const restrictionsMessageInfo = getRestrictionsMessageInfo(column?.schema, column?.schemaRequired);
    const isPrimaryKey = column?.isPrimaryKey;
    return (
        <>
            {/* when the value is empty we need a placeholder to fill the height of the field */}
            {value === '' || isNil(value) ? <span style={{ height: '1em', display: 'inline-block' }} /> : null}
            <GlyphiconIndicator
                className={`ms-cell-validation-indicator ms-${changed ? 'danger' : isPrimaryKey ? 'info' : 'warning'}-text`}
                tooltip={
                    isPrimaryKey
                        ? <Message msgId="featuregrid.primaryKey.tooltip" />
                        : <div>
                            {(restrictionsMessageInfo?.msgIds || []).map(msgId =>
                                <div key={msgId}><Message msgId={msgId} msgParams={restrictionsMessageInfo.msgParams}/></div>)}
                        </div>
                }
                glyph="exclamation-mark"
            />
        </>
    );
};

CellValidationErrorMessage.propTypes = {
    value: PropTypes.any,
    valid: PropTypes.bool,
    changed: PropTypes.bool,
    column: PropTypes.object
};

CellValidationErrorMessage.defaultProps = {
    value: null,
    column: {}
};

export default CellValidationErrorMessage;
