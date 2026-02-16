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
import { getCredentials } from '../../../utils/SecurityUtils';
import { isEmpty } from 'lodash';

const CatalogSearchInput = ({
    searchText,
    onChangeText,
    messages,
    services,
    selectedService,
    onShowSecurityModal,
    onSetProtectedServices,
    onSearchChange,
    search,
    onReset,
    isCentered = false
}) => {
    const onSearchTextChange = (value) => {
        onChangeText(value);
        const currentService = services?.[selectedService];
        const protectedId = currentService?.protectedId;
        const creds = getCredentials(protectedId);

        if (protectedId && isEmpty(creds)) {
            onShowSecurityModal(true);
            onSetProtectedServices([currentService]);
        } else {
            if (onSearchChange) {
                onSearchChange(value);
                return;
            }
            search({
                services,
                selectedService,
                searchText: value
            });
        }
    };

    const reset = () => {
        onChangeText("");
        if (onSearchChange) {
            onSearchChange("");
        } else {
            search({
                services,
                selectedService,
                searchText: ""
            });
        }
        if (onReset) {
            onReset();
        }
    };

    return (
        <FlexFill flexBox centerChildrenVertically>
            <InputControl
                placeholder={getMessageById(messages, "catalog.textSearchPlaceholder")}
                debounceTime={300}
                value={searchText}
                onChange={onSearchTextChange}
            />
            {!isCentered && (
                <Button onClick={reset}>
                    <Glyphicon glyph="remove" />
                </Button>
            )}
        </FlexFill>
    );
};

export default CatalogSearchInput;
