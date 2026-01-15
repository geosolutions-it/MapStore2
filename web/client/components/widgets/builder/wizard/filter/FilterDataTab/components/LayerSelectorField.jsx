/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, InputGroup, FormControl, Button, Glyphicon } from 'react-bootstrap';

// Inline utility functions
const getLayerTitle = (layer) => {
    if (!layer || typeof layer !== 'object') {
        return '';
    }
    return layer.title || layer.name || '';
};

const hasActiveFilter = (filter) => {
    if (!filter) {
        return false;
    }
    return !!(
        filter.filterFields?.length > 0 ||
        filter.spatialField?.geometry ||
        filter.crossLayerFilter
    );
};

/**
 * Layer selector field component with edit filter button
 */
const LayerSelectorField = ({
    layer,
    layerIsRequired = false,
    onOpenLayerSelector,
    onEditLayerFilter,
    showEditFilter = false,
    filter = null,
    dashBoardEditing = false
}) => {
    const layerTitle = getLayerTitle(layer);
    const hasFilter = hasActiveFilter(filter);
    const isDisabled = !dashBoardEditing && layer;
    const validationState = layerIsRequired && !layer ? 'error' : null;


    return (
        <FormGroup
            className="form-group-flex"
            validationState={validationState}
        >
            <ControlLabel>Layer</ControlLabel>
            <InputGroup>
                <FormControl
                    type="text"
                    value={layerTitle}
                    placeholder="Select a data source..."
                    readOnly
                    onClick={() => !isDisabled && onOpenLayerSelector()}
                    style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                    disabled={isDisabled}
                />
                <InputGroup.Button>
                    <Button
                        onClick={onOpenLayerSelector}
                        disabled={isDisabled}
                    >
                        <Glyphicon glyph="folder-open" />
                    </Button>
                    {showEditFilter && layer && (
                        <Button
                            onClick={onEditLayerFilter}
                            bsStyle={hasFilter ? 'success' : 'primary'}
                            title="Edit layer filter"
                        >
                            <Glyphicon glyph="filter" />
                        </Button>
                    )}
                </InputGroup.Button>
            </InputGroup>
        </FormGroup>
    );
};

LayerSelectorField.propTypes = {
    layer: PropTypes.object,
    layerIsRequired: PropTypes.bool,
    onOpenLayerSelector: PropTypes.func.isRequired,
    onEditLayerFilter: PropTypes.func,
    showEditFilter: PropTypes.bool,
    filter: PropTypes.object,
    dashBoardEditing: PropTypes.bool
};

export default LayerSelectorField;

