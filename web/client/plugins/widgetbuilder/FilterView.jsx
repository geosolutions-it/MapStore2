/*
 * Copyright 2025, GeoSolutions.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { Glyphicon, OverlayTrigger, Tooltip } from 'react-bootstrap';
import filterWidgetEnhancer from '../../components/widgets/enhancers/filterWidget';
import LoadingSpinner from '../../components/misc/LoadingSpinner';
import FlexBox from '../../components/layout/FlexBox';
import FilterTitle from '../../components/widgets/builder/wizard/filter/FilterTitle';
import FilterSelectAllOptions from '../../components/widgets/builder/wizard/filter/FilterSelectAllOptions';
import Message from '../../components/I18N/Message';
import FilterCheckboxList from '../../components/widgets/builder/wizard/filter/FilterCheckboxList';
import FilterChipList from '../../components/widgets/builder/wizard/filter/FilterChipList';
import FilterDropdownList from '../../components/widgets/builder/wizard/filter/FilterDropdownList';
import FilterSwitchList from '../../components/widgets/builder/wizard/filter/FilterSwitchList';
import { isFilterSelectionValid } from './utils/filterBuilder';
const componentMap = {
    checkbox: FilterCheckboxList,
    button: FilterChipList,
    dropdown: FilterDropdownList,
    'switch': FilterSwitchList
};
const FilterView = ({
    className,
    filterData,
    selections = [],
    onSelectionChange = () => {},
    loading = false,
    missingParameters = false,
    selectableItems = [],
    fetchError = false
}) => {
    if (!filterData) {
        return null;
    }

    const { layout = {} } = filterData;
    const Component = componentMap[layout.variant];
    if (!Component) {
        return null;
    }
    const forceSelection = layout.forceSelection === true;
    const showForceSelectionError = !isFilterSelectionValid(filterData, selections || []);

    // Show message when required parameters are missing
    if (missingParameters) {
        return (
            <div className={['ms-filter-builder-mock-previews', className].filter(Boolean).join(' ')}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#999'
                }}>
                    <Glyphicon glyph="info-sign" style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <div style={{ fontSize: '14px', maxWidth: '400px' }}>
                        <Message msgId="widgets.filterWidget.missingParametersMessage" />
                    </div>
                </div>
            </div>
        );
    }

    // Show error message when fetch fails
    if (fetchError) {
        return (
            <div className={['ms-filter-builder-mock-previews', className].filter(Boolean).join(' ')}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                    textAlign: 'center'
                }}>
                    <Glyphicon glyph="warning-sign" style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <div style={{ fontSize: '14px', maxWidth: '400px' }}>
                        <Message msgId="widgets.filterWidget.fetchError" />
                    </div>
                </div>
            </div>
        );
    }

    const getLayoutProps = () => {
        if (layout.variant === 'button') {
            return {
                layoutDirection: layout.direction,
                layoutMaxHeight: layout.maxHeight,
                selectedColor: layout.selectedColor
            };
        }
        if (layout.variant === 'checkbox') {
            return {
                layoutDirection: layout.direction,
                layoutMaxHeight: layout.maxHeight
            };
        }
        if (layout.variant === 'switch') {
            return {
                layoutDirection: layout.direction,
                layoutMaxHeight: layout.maxHeight
            };
        }
        return {};
    };

    // Apply title styling from layout.titleStyle
    const titleStyle = {
        ...(layout.titleStyle?.fontSize && { fontSize: `${layout.titleStyle.fontSize}px` }),
        ...(layout.titleStyle?.fontWeight && { fontWeight: layout.titleStyle.fontWeight }),
        ...(layout.titleStyle?.fontStyle && { fontStyle: layout.titleStyle.fontStyle }),
        ...(layout.titleStyle?.textColor && { color: layout.titleStyle.textColor })
    };
    const showSelectAll = layout.showSelectAll ?? true;
    const showTitle = !layout.titleDisabled;

    // Apply background color to the container
    const containerStyle = {
        position: 'relative',
        ...(layout.backgroundColor && { backgroundColor: layout.backgroundColor }),
        ...(layout.backgroundColor && { padding: '12px', borderRadius: '4px' })
    };

    const onChangeSelections = (selectedValues) =>{
        // when force Selection is on, one item must be selected
        if (selectedValues?.length === 0 && layout.forceSelection) {
            return;
        }
        onSelectionChange(selectedValues);
    };

    return (
        <div className={['ms-filter-builder-mock-previews', className].filter(Boolean).join(' ')} style={containerStyle}>
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 10
                }}>
                    <LoadingSpinner />
                </div>
            )}
            <div className="ms-filter-selector-header">
                <FlexBox style={{ width: '100%' }} centerChildrenVertically>
                    <FlexBox gap="xs" centerChildrenVertically style={{ minWidth: 0 }}>

                        {showTitle
                            ? <FilterTitle
                                filterLabel={layout.label}
                                filterIcon={layout.icon}
                                filterNameStyle={titleStyle}
                                className="ms-filter-title"
                            />
                            : <span></span>
                        }
                        {showForceSelectionError && (
                            <OverlayTrigger
                                placement="top"
                                overlay={
                                    <Tooltip id={`ms-filter-force-selection-tooltip-${filterData?.id || 'default'}`}>
                                        When force selected, at least one item must be selected
                                    </Tooltip>
                                }
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    <Glyphicon glyph="warning-sign" style={{ color: '#d9534f' }} />
                                </span>
                            </OverlayTrigger>
                        )}
                    </FlexBox>
                    <FlexBox.Fill />
                    {showSelectAll && (
                        <FilterSelectAllOptions
                            items={selectableItems}
                            selectedValues={selections || []}
                            onSelectionChange={onChangeSelections}
                            selectionMode={layout.selectionMode}
                            allowEmptySelection={!forceSelection}
                        />
                    )}
                </FlexBox>
            </div>
            <Component
                key={filterData.id}
                items={selectableItems}
                selectionMode={layout.selectionMode}
                selectedValues={selections || []}
                onSelectionChange={onChangeSelections}
                {...getLayoutProps()}
            />
        </div>
    );
};

FilterView.propTypes = {
    className: PropTypes.string,
    filterData: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        layout: PropTypes.shape({
            variant: PropTypes.string.isRequired,
            icon: PropTypes.string,
            selectionMode: PropTypes.string,
            direction: PropTypes.oneOf(['horizontal', 'vertical']),
            maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            selectedColor: PropTypes.string
        })
    }),
    selections: PropTypes.array,
    onSelectionChange: PropTypes.func,
    loading: PropTypes.bool,
    missingParameters: PropTypes.bool,
    selectableItems: PropTypes.array,
    fetchError: PropTypes.bool
};

// Export unwrapped component for testing
export { FilterView };

export default compose(
    filterWidgetEnhancer
)(FilterView);

