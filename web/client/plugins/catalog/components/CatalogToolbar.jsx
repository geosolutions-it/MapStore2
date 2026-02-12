/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { Checkbox } from 'react-bootstrap';
import Button from '../../../components/layout/Button';
import FlexBox from '../../../components/layout/FlexBox';
import {FlexFill} from '../../../components/layout/FlexBox';
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
}) => {
    console.log(selectedFormat,'selectedFormat')
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
        </FlexBox>
    );
};

export default CatalogToolbar;
