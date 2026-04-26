/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import Button from '../../layout/Button';
import FlexBox from '../../layout/FlexBox';
import InputControl from '../resources/InputControl';
import { getCredentials } from '../../../utils/SecurityUtils';
import { isEmpty } from 'lodash';

import tooltip from '../../misc/enhancers/tooltip';

const ButtonWithTooltip = tooltip(Button);

function ResourcesSearchTool({
    glyph,
    className,
    onClick,
    tooltipId,
    labelId,
    variant,
    disabled
}) {
    return (
        <ButtonWithTooltip
            square
            variant={variant}
            borderTransparent
            className={className}
            onClick={onClick}
            tooltipId={labelId || tooltipId}
            disabled={disabled}
        >
            <Glyphicon glyph={glyph} />
        </ButtonWithTooltip>
    );
}

const CatalogSearchInput = ({
    searchText,
    onChangeText,
    onChangeTextNoDebounce,
    enableFilters,
    onToggleFilters,
    onResetFilters,
    includeSearchButton = true,
    onShowSecurityModal,
    onSetProtectedServices,
    currentService,
    hasActiveFilters
}) => {
    const handleSearchChange = (value) => {
        const protectedId = currentService?.protectedId;
        const creds = getCredentials(protectedId);
        if (protectedId && isEmpty(creds)) {
            // avoid searching if a protection is present
            onShowSecurityModal(true);
            onSetProtectedServices([currentService]);
        } else {
            onChangeText(value);
        }
    };
    const handleReset = () => {
        onChangeText("", { skipAutoSearch: true });
        onResetFilters?.();
    };

    const isServiceSelected = !!currentService;

    return (
        <FlexBox
            className="ms-resources-search-field"
            gap="xs"
            centerChildrenVertically
        >
            <InputControl
                className="ms-catalog-search-input"
                placeholder="catalog.search"
                debounceTime={300}
                value={searchText}
                onChange={handleSearchChange}
                onChangeNoDebounce={onChangeTextNoDebounce}
            />
            {includeSearchButton ? <ResourcesSearchTool
                glyph={'search'}
                onClick={() => {
                    if (isServiceSelected) {
                        handleSearchChange(searchText);
                    }
                }}
                disabled={!isServiceSelected}
            /> : null}
            {enableFilters ? (
                <ResourcesSearchTool
                    glyph={'filter'}
                    onClick={() => {
                        if (isServiceSelected) {
                            onToggleFilters();
                        }
                    }}
                    className={hasActiveFilters ? 'ms-filter-notification-circle' : ''}
                    disabled={!isServiceSelected}
                />
            ) : null}
            {searchText || hasActiveFilters ? <ResourcesSearchTool
                glyph={'1-close'}
                onClick={() => {
                    if (isServiceSelected) {
                        handleReset();
                    }
                }}
                disabled={!isServiceSelected}
            /> : null}
        </FlexBox>
    );
};

export default CatalogSearchInput;
