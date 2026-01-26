/*
 * Copyright 2025, GeoSolutions.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { Glyphicon } from 'react-bootstrap';
import filterWidgetEnhancer from '../../components/widgets/enhancers/filterWidget';
import LoadingSpinner from '../../components/misc/LoadingSpinner';
import FilterTitle from '../../components/widgets/builder/wizard/filter/FilterTitle';
import FilterSelectAllOptions from '../../components/widgets/builder/wizard/filter/FilterSelectAllOptions';
import Message from '../../components/I18N/Message';
import HTML from '../../components/I18N/HTML';
import FilterCheckboxList from '../../components/widgets/builder/wizard/filter/FilterCheckboxList';
import FilterChipList from '../../components/widgets/builder/wizard/filter/FilterChipList';
import FilterDropdownList from '../../components/widgets/builder/wizard/filter/FilterDropdownList';
import FilterSwitchList from '../../components/widgets/builder/wizard/filter/FilterSwitchList';
import InfoPopover from '../../components/widgets/widget/InfoPopover';
import { cleanPaths } from '../../utils/WidgetsUtils';

const NoTargetInfo = ({ interactions = [], activeTargets = {} }) => {
    const connectedActiveTargets = useMemo(() => {
        const interactionTargetPaths = interactions
            .filter(({plugged}) => plugged) // get only plugged interactions
            .map(interaction => cleanPaths(interaction.target.nodePath)); // get target paths;
        return interactionTargetPaths
            .filter(path =>
                Object.entries(activeTargets).some(([activePath, visibility]) => {
                    return visibility && path === cleanPaths(activePath);
                })
            );
    }, [activeTargets, interactions]);

    // display the list of layers/widgets affected by the filter when there are active interactions
    const hasActiveInteractions = connectedActiveTargets.length > 0;
    if (hasActiveInteractions) {
        return null;
    }
    return (<InfoPopover
        bsStyle="warning"
        glyph="warning-sign"
        placement="top"
        text={
            <HTML
                msgId={
                    interactions.length === 0
                        ? "widgets.filterWidget.noInteractionsInfo"
                        : "widgets.filterWidget.noTargetsInfo"
                }
            />}
    />
    );
};
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
    interactions = [],
    activeTargets = {},
    showNoTargetsInfo,
    onSelectionChange = () => {},
    loading = false,
    missingParameters = false,
    selectableItems = []
}) => {
    if (!filterData) {
        return null;
    }

    const { layout = {} } = filterData;
    const Component = componentMap[layout.variant ?? 'checkbox'];
    if (!Component) {
        throw new Error(`Unsupported filter variant: ${layout.variant}`);
    }
    // Show message when required parameters are missing
    if (missingParameters) {
        return (
            <div className={[className].filter(Boolean).join(' ')}>
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
                    <div className="filter-view-widget-missing-parameter" style={{ fontSize: '14px', maxWidth: '400px' }}>
                        <Message msgId="widgets.filterWidget.missingParametersMessage" />
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
    const showNoTargetsInfoTool = showNoTargetsInfo ?? layout.showNoTargetsInfo ?? true;
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

                {showTitle
                    ? <FilterTitle
                        key={filterData.id + '-title'}
                        filterLabel={layout.label}
                        filterIcon={layout.icon}
                        filterNameStyle={titleStyle}
                        className="ms-filter-title"
                    />
                    : <span
                        className="ms-filter-title"
                        key={filterData.id + '-title'}
                    ></span> // Preserve space even if title is hidden

                }{
                    showNoTargetsInfoTool
                        ? <NoTargetInfo
                            key={filterData.id + '-no-targets-info'}
                            interactions={interactions}
                            activeTargets={activeTargets}
                        />
                        : null
                }

                {showSelectAll && (<FilterSelectAllOptions
                    key={filterData.id + '-select-all'}
                    items={selectableItems}
                    selectedValues={selections || []}
                    onSelectionChange={onSelectionChange}
                    selectionMode={layout.selectionMode}
                />)
                }
            </div>
            <Component
                key={filterData.id}
                items={selectableItems}
                selectionMode={layout.selectionMode}
                selectedValues={selections || []}
                onSelectionChange={onSelectionChange}
                {...getLayoutProps()}
            />
        </div>
    );
};

FilterView.propTypes = {
    className: PropTypes.string,
    showNoTargetsInfo: PropTypes.bool,
    interactions: PropTypes.array,
    activeTargets: PropTypes.object,
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
    selectableItems: PropTypes.array
};

// Export unwrapped component for testing
export { FilterView };

export default compose(
    filterWidgetEnhancer
)(FilterView);

