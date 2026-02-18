/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Checkbox, Dropdown, Glyphicon, MenuItem } from 'react-bootstrap';
import Button from '../../../components/layout/Button';
import FlexBox from '../../../components/layout/FlexBox';
import { FlexFill } from '../../../components/layout/FlexBox';
import Message from '../../../components/I18N/Message';

const CatalogToolbar = ({
    isPanel,
    total = 0,
    isAllSelected,
    isIndeterminate,
    selectedCount = 0,
    onSelectAll,
    onAddSelected,
    onToggleFilters,
    selectedFormat,
    orderOptions = [
        {
            label: 'Most recent',
            labelId: 'resourcesCatalog.mostRecent',
            value: '-date'
        },
        {
            label: 'Less recent',
            labelId: 'resourcesCatalog.lessRecent',
            value: 'date'
        },
        {
            label: 'A Z',
            labelId: 'resourcesCatalog.aZ',
            value: 'title'
        },
        {
            label: 'Z A',
            labelId: 'resourcesCatalog.zA',
            value: '-title'
        },
        {
            label: 'Most popular',
            labelId: 'resourcesCatalog.mostPopular',
            value: 'popular_count'
        }
    ],
    defaultLabelId = 'resourcesCatalog.orderBy',
    sort,
    onSortChange
}) => {

    return (
        <FlexBox
            gap="sm"
            classNames={['_padding-sm', !isPanel && '_margin-lr-md']}
            centerChildrenVertically
        >
            {selectedFormat === 'geonode' && (
                <FlexBox classNames={[]}>
                    <Button
                        variant="primary"
                        title="Filters"
                        onClick={onToggleFilters}
                    >
                        <Glyphicon glyph="filter" />
                        {!isPanel && <span className="_padding-lr-xs">Filter</span>}
                    </Button>
                </FlexBox>
            )}

            <FlexFill flexBox gap="sm" centerChildrenVertically>
                <span>
                    <Message msgId="Layers Found" msgParams={{ count: total }} />
                    {` (${total})`}
                </span>
            </FlexFill>

            <FlexBox gap="sm" centerChildrenVertically>
                <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    style={{ margin: 0 }}
                >
                    <Message msgId="Select All" />
                </Checkbox>
            </FlexBox>

            <FlexBox classNames={[]}>
                <Button
                    variant="primary"
                    title="Add To Map"
                    onClick={onAddSelected}
                    disabled={selectedCount === 0}
                >
                    <Message msgId="catalog.addToMap" />
                    {selectedCount > 0 && ` (${selectedCount})`}
                </Button>
            </FlexBox>
            {selectedFormat === 'geonode' && (
            <Dropdown pullRight id="sort-dropdown">
                <Dropdown.Toggle
                    bsStyle={'default'}
                    bsSize="sm"
                    noCaret
                >
                    <Message msgId={sort?.labelId || defaultLabelId} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {orderOptions.map(({ labelId, value }) => {
                        return (
                            <MenuItem
                                key={value}
                                active={value === sort}
                                onClick={(e) => {
                                    if (onSortChange) {
                                        e.preventDefault();
                                        onSortChange(value);
                                    }
                                }}
                            >
                                <Message msgId={labelId} />
                            </MenuItem>
                        );
                    })}
                </Dropdown.Menu>
            </Dropdown>
            )}
        </FlexBox>
    );
};

export default CatalogToolbar;
