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
import localizedProps from '../../../../../../misc/enhancers/localizedProps';

const LocalizedFormControl = localizedProps('placeholder')(FormControl);

// Inline utility functions
const getLayerTitle = (layer) => {
    if (!layer || typeof layer !== 'object') {
        return '';
    }
    return layer.title || layer.name || '';
};


/**
 * Layer selector field component with edit filter button
 */
const LayerSelectorField = ({
    layer,
    layerIsRequired = false,
    onOpenLayerSelector,
    dashBoardEditing = false
}) => {
    const layerTitle = getLayerTitle(layer);
    const isDisabled = !dashBoardEditing && layer;
    const validationState = layerIsRequired && !layer ? 'error' : null;


    return (
        <FormGroup
            className="form-group-flex"
            validationState={validationState}
        >
            <ControlLabel>Layer</ControlLabel>
            <InputGroup>
                <LocalizedFormControl
                    type="text"
                    value={layerTitle}
                    placeholder="widgets.filterWidget.selectDataSourcePlaceHolder"
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

