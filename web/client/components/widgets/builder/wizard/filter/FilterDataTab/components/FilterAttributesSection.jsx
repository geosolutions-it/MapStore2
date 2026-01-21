/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, InputGroup, ButtonGroup } from 'react-bootstrap';
import Select from 'react-select';
import AttributeSelector from './AttributeSelector';
import sortByAttributesIcon from '../../../../../../../themes/default/svg/sort-by-attributes.svg';
import sortByAttributesAltIcon from '../../../../../../../themes/default/svg/sort-by-attributes-alt.svg';
import tooltip from '../../../../../../misc/enhancers/tooltip';
import ButtonWithTooltip from '../../../../../../misc/Button';
import Message from '../../../../../../I18N/Message';

const TButtonWithTooltip = tooltip(({ children, active, ...props }) => (
    <ButtonWithTooltip
        {...props}
        bsStyle={active ? 'primary' : 'default'}
        className="square-button-md"
    >
        {children}
    </ButtonWithTooltip>
));

// Inline utility function
const getAttributeNoResultsText = (hasLayerSelection, error = null) => {
    if (!hasLayerSelection) {
        return 'Select a layer first';
    }
    return error || 'No attributes available';
};

/**
 * Section for configuring filter attributes (value, label, sort)
 */
const FilterAttributesSection = ({
    valuesFrom,
    valueAttribute,
    labelAttribute,
    sortByAttribute,
    sortOrder,
    attributeOptions = [],
    isLoading = false,
    hasLayerSelection = false,
    error = null,
    onValueAttributeChange,
    onLabelAttributeChange,
    onSortByAttributeChange,
    onSortOrderChange
}) => {
    const attributeNoResultsText = getAttributeNoResultsText(hasLayerSelection, error);
    const isAttributeDisabled = !attributeOptions.length && !isLoading;

    const handleValueAttributeChange = (option) => {
        onValueAttributeChange(option?.value);
    };

    const handleLabelAttributeChange = (option) => {
        onLabelAttributeChange(option?.value);
    };

    const handleSortByAttributeChange = (option) => {
        onSortByAttributeChange(option?.value);
    };

    return (
        <>
            <AttributeSelector
                label={<Message msgId="widgets.filterWidget.valueAttribute" />}
                value={valueAttribute}
                options={attributeOptions}
                onChange={handleValueAttributeChange}
                isLoading={isLoading}
                hasLayerSelection={hasLayerSelection}
                error={error}
                disabled={isAttributeDisabled}
                clearable={false}
                placeholder={<Message msgId="widgets.filterWidget.selectAttribute" />}
            />

            {valuesFrom === 'single' && (
                <AttributeSelector
                    label={<Message msgId="widgets.filterWidget.labelAttribute" />}
                    value={labelAttribute}
                    options={attributeOptions}
                    onChange={handleLabelAttributeChange}
                    isLoading={isLoading}
                    hasLayerSelection={hasLayerSelection}
                    error={error}
                    disabled={isAttributeDisabled}
                    clearable={false}
                    placeholder={<Message msgId="widgets.filterWidget.selectAttribute" />}
                />
            )}

            <FormGroup className="form-group-flex">
                <ControlLabel><Message msgId="widgets.filterWidget.sortByAttribute" /></ControlLabel>
                <InputGroup>
                    <Select
                        value={sortByAttribute ? attributeOptions.find(opt => opt.value === sortByAttribute) : null}
                        options={attributeOptions}
                        placeholder={<Message msgId="widgets.filterWidget.selectAttribute" />}
                        onChange={handleSortByAttributeChange}
                        disabled={isAttributeDisabled}
                        isLoading={isLoading}
                        noResultsText={attributeNoResultsText}
                        clearable={false}
                    />
                    <InputGroup.Button>
                        <ButtonGroup style={{ display: 'flex', flexDirection: 'row' }}>
                            <TButtonWithTooltip
                                id="sort-asc"
                                active={sortOrder === 'ASC'}
                                onClick={() => onSortOrderChange('ASC')}
                                tooltip="Ascending (ASC)"
                            >
                                <img src={sortByAttributesIcon} alt="ASC" style={{ width: '16px', height: '16px' }} />
                            </TButtonWithTooltip>
                            <TButtonWithTooltip
                                id="sort-desc"
                                active={sortOrder === 'DESC'}
                                onClick={() => onSortOrderChange('DESC')}
                                tooltip="Descending (DESC)"
                            >
                                <img src={sortByAttributesAltIcon} alt="DESC" style={{ width: '16px', height: '16px' }} />
                            </TButtonWithTooltip>
                        </ButtonGroup>
                    </InputGroup.Button>
                </InputGroup>
            </FormGroup>
        </>
    );
};

FilterAttributesSection.propTypes = {
    valuesFrom: PropTypes.string,
    valueAttribute: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    labelAttribute: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    sortByAttribute: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    sortOrder: PropTypes.string,
    attributeOptions: PropTypes.array,
    isLoading: PropTypes.bool,
    hasLayerSelection: PropTypes.bool,
    error: PropTypes.string,
    onValueAttributeChange: PropTypes.func.isRequired,
    onLabelAttributeChange: PropTypes.func.isRequired,
    onSortByAttributeChange: PropTypes.func.isRequired,
    onSortOrderChange: PropTypes.func.isRequired
};

export default FilterAttributesSection;

