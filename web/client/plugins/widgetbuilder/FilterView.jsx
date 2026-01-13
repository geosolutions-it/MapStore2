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
import { Glyphicon } from 'react-bootstrap';
import filterWidgetEnhancer from '../../components/widgets/enhancers/filterWidget';
import LoadingSpinner from '../../components/misc/LoadingSpinner';
import { isFilterValid } from '../../utils/FilterUtils';
import FilterTitle from '../../components/widgets/builder/wizard/filter/FilterTitle';
import FilterSelectAllOptions from '../../components/widgets/builder/wizard/filter/FilterSelectAllOptions';

const FilterView = ({
    className,
    filterData,
    componentMap = {},
    selections = [],
    onSelectionChange = () => {},
    loading = false,
    missingParameters = false
}) => {
    if (!filterData) {
        return null;
    }

    const { layout = {}, data = {} } = filterData;
    const Component = componentMap[layout.variant];
    if (!Component) {
        return null;
    }

    // For userDefined data source, transform userDefinedItems into items format
    // Only include items that have a valid filter
    const items = React.useMemo(() => {
        if (data.dataSource === 'userDefined' && data.userDefinedItems) {
            return data.userDefinedItems
                .filter(item => item.filter && isFilterValid(item.filter))
                .map(item => ({
                    id: item.id,
                    label: item.label || ''
                }));
        }
        return filterData.items || [];
    }, [data.dataSource, data.userDefinedItems, filterData.items]);

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
                        Please select required fields to generate the filter list
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

    // Apply background color to the container
    const containerStyle = {
        position: 'relative',
        ...(layout.backgroundColor && { backgroundColor: layout.backgroundColor }),
        ...(layout.backgroundColor && { padding: '12px', borderRadius: '4px' })
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
            <FilterTitle
                filterLabel={layout.label}
                filterIcon={layout.icon}
                filterNameStyle={titleStyle}
                className="ms-filter-title"
                titleDisabled={layout.titleDisabled}
            />
            <FilterSelectAllOptions
                items={items}
                onSelectionChange={onSelectionChange}
                selectionMode={layout.selectionMode}
            />
            <Component
                key={filterData.id}
                items={items}
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
    filterData: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        items: PropTypes.array,
        layout: PropTypes.shape({
            variant: PropTypes.string.isRequired,
            icon: PropTypes.string,
            selectionMode: PropTypes.string,
            direction: PropTypes.oneOf(['horizontal', 'vertical']),
            maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            selectedColor: PropTypes.string
        })
    }),
    componentMap: PropTypes.object,
    selections: PropTypes.array,
    onSelectionChange: PropTypes.func,
    loading: PropTypes.bool,
    missingParameters: PropTypes.bool
};

export default compose(
    filterWidgetEnhancer
)(FilterView);

