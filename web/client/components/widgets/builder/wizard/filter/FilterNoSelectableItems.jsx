/*
 * Copyright 2026, GeoSolutions.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import Message from '../../../../I18N/Message';

/**
 * Empty state shown when a filter has no selectable items.
 */
const FilterNoSelectableItems = ({ className }) => {
    return (
        <div
            className={className}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                textAlign: 'center',
                color: '#999'
            }}
        >
            <Glyphicon glyph="info-sign" style={{ fontSize: '48px', marginBottom: '16px' }} />
            <div style={{ fontSize: '14px', maxWidth: '400px' }}>
                <Message msgId="widgets.filterWidget.noSelectableItems" />
            </div>
        </div>
    );
};

FilterNoSelectableItems.propTypes = {
    className: PropTypes.string
};

export default FilterNoSelectableItems;

