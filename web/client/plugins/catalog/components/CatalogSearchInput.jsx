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
import { FlexFill } from '../../../components/layout/FlexBox';
import InputControl from '../../ResourcesCatalog/components/InputControl';
import { getMessageById } from '../../../utils/LocaleUtils';

const CatalogSearchInput = ({
    searchText,
    messages,
    isCentered,
    onChangeText
}) => {
    const handleSearchChange = (value) => {
        onChangeText(value);
    };
    const handleReset = () => {
        onChangeText("");
    };

    return (
        <FlexFill flexBox centerChildrenVertically>
            <InputControl
                placeholder={getMessageById(messages, "catalog.textSearchPlaceholder")}
                debounceTime={300}
                value={searchText}
                onChange={handleSearchChange}
            />
            {!isCentered && (
                <Button onClick={handleReset}>
                    <Glyphicon glyph="remove" />
                </Button>
            )}
        </FlexFill>
    );
};

export default CatalogSearchInput;
