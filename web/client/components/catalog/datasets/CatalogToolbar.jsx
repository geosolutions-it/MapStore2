/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Checkbox, Dropdown, MenuItem } from 'react-bootstrap';
import Button from '../../layout/Button';
import FlexBox, { FlexFill } from '../../layout/FlexBox';
import Message from '../../I18N/Message';

const CatalogToolbar = ({
    total = 0,
    isAllSelected,
    isIndeterminate,
    selectedCount = 0,
    onSelectAll,
    onAddSelected,
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
    onSortChange,
    enableOrderBy,
    multiSelect,
    includeAddToMap,
    loading
}) => {

    return (
        <FlexBox
            gap="sm"
            className="ms-catalog-toolbar"
            centerChildrenVertically
        >
            <FlexFill flexBox gap="sm" centerChildrenVertically>
                <span>
                    <Message msgId="catalog.layers" msgParams={{ count: total }} />
                    {` (${total})`}
                </span>
            </FlexFill>
            {total > 0 && multiSelect && !loading && onSelectAll ? <FlexBox gap="sm" centerChildrenVertically>
                <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    style={{ margin: 0 }}
                >
                    <Message msgId="catalog.selectAll" />
                </Checkbox>
            </FlexBox> : null}
            {multiSelect && includeAddToMap ? <FlexBox classNames={[]}>
                <Button
                    variant="primary"
                    onClick={onAddSelected}
                    disabled={selectedCount === 0}
                >
                    <Message msgId="catalog.addToMap" />
                    {selectedCount > 0 && ` (${selectedCount})`}
                </Button>
            </FlexBox> : null}
            {enableOrderBy && (
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
