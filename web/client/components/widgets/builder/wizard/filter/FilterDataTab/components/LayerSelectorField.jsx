/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, InputGroup, FormControl, Button, Glyphicon } from 'react-bootstrap';
import localizedProps from '../../../../../../misc/enhancers/localizedProps';
import { isFilterValid } from '../../../../../../../utils/FilterUtils';

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
    onFilterLayer = () => {},
    onOpenLayerSelector,
    dashBoardEditing = false,
    hideFilter = false
}) => {
    const layerTitle = getLayerTitle(layer);
    const isDisabled = !dashBoardEditing && layer;
    const validationState = layerIsRequired && !layer ? 'error' : null;

    const hasFilter = useMemo(() =>{
        return layer?.filter && typeof layer?.filter === 'object'
            ? isFilterValid(layer?.filter)
            : !!layer?.filter; // Handle string case
    }, [layer]);


    return (
        <FormGroup
            className="form-group-flex"
            validationState={validationState}
        >
            <ControlLabel>Layer</ControlLabel>
            <InputGroup style={{ zIndex: 0 }}>
                <LocalizedFormControl
                    placeholder="widgets.filterWidget.selectDataSourcePlaceHolder"
                    value={layerTitle}
                    onClick={() => !isDisabled && onOpenLayerSelector()}
                    style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                    readOnly
                    disabled={isDisabled} />
                {!isDisabled && <InputGroup.Button>
                    <Button
                        bsStyle="primary"
                        disabled={isDisabled}
                        onClick={() => !isDisabled && onOpenLayerSelector()}
                        tooltipId={'widgets.builder.selectLayer'}
                    >
                        <Glyphicon glyph={layer ? "cog" : "folder-open"} />
                    </Button>
                </InputGroup.Button>}
                {layer && !hideFilter && <InputGroup.Button>
                    <Button
                        bsStyle={hasFilter ? 'success' : 'primary'}
                        onClick={() =>  onFilterLayer(layer)}
                        tooltipId={'widgets.builder.filterLayer'}
                    >
                        <Glyphicon glyph="filter" />
                    </Button>
                </InputGroup.Button>}
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
    dashBoardEditing: PropTypes.bool,
    hideFilter: PropTypes.bool
};

export default LayerSelectorField;

