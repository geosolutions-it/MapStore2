/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import Button from '../../../components/layout/Button';
import FlexBox from '../../../components/layout/FlexBox';
import InputControl from '../../ResourcesCatalog/components/InputControl';

import tooltip from '../../../components/misc/enhancers/tooltip';

const ButtonWithTooltip = tooltip(Button);

function ResourcesSearchTool({
    glyph,
    className,
    onClick,
    tooltipId,
    labelId,
    variant
}) {
    return (
        <ButtonWithTooltip
            square
            variant={variant}
            borderTransparent
            className={className}
            onClick={onClick}
            tooltipId={labelId || tooltipId}
        >
            <Glyphicon glyph={glyph} />
        </ButtonWithTooltip>
    );
}

const CatalogSearchInput = ({
    searchText,
    onChangeText,
    enableFilters,
    onToggleFilters
}) => {
    const handleSearchChange = (value) => {
        onChangeText(value);
    };
    const handleReset = () => {
        onChangeText("");
    };

    return (
        <FlexBox
            className="ms-resources-search-field"
            gap="xs"
            centerChildrenVertically
        >
            <InputControl
                placeholder={'Search layers...'}
                debounceTime={300}
                value={searchText}
                onChange={handleSearchChange}
            />
            <ResourcesSearchTool
                glyph={'search'}
                onClick={() => handleSearchChange('')}
            />
            {enableFilters ? (
                <ResourcesSearchTool
                    glyph={'filter'}
                    onClick={onToggleFilters}
                />
            ) : null}
            {searchText ? <ResourcesSearchTool
                glyph={'1-close'}
                onClick={handleReset}
            /> : null}
        </FlexBox>
    );
};

export default CatalogSearchInput;
