/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactSelect from 'react-select';
import { Glyphicon } from 'react-bootstrap';
import Button from '../../../components/layout/Button';
import FlexBox from '../../../components/layout/FlexBox';
import { FlexFill } from '../../../components/layout/FlexBox';
import { getMessageById } from '../../../utils/LocaleUtils';

const SelectSync = ReactSelect;

const CatalogServiceSelect = ({
    services,
    canEdit,
    onConfigureClick,
    onChangeSelectedService,
    selectedService,
    messages,
    onDeleteService
}) => {
    const getServices = () => {
        if (!services) return [];
        return Object.keys(services).map((key) => {
            const service = services[key];
            return {
                label: service.titleMsgId ? getMessageById(messages, service.titleMsgId) : service.title,
                value: key
            };
        });
    };

    return (
        <FlexBox gap="sm" centerChildrenVertically>
            <FlexFill style={{ minWidth: '275px' }}>
                <SelectSync
                    clearValueText={getMessageById(messages, "catalog.clearValueText")}
                    noResultsText={getMessageById(messages, "catalog.noResultsText")}
                    clearable
                    options={getServices()}
                    value={selectedService}
                    onChange={(val) => onChangeSelectedService(val && val.value ? val.value : "")}
                    placeholder={getMessageById(messages, "catalog.servicePlaceholder")}
                />
            </FlexFill>
            <FlexFill />
            <Button
                variant="primary"
                title="Add Service"
                onClick={() => onConfigureClick('edit', true)}
            >
                <Glyphicon glyph="plus" />
            </Button>
            <Button
                variant="primary"
                title="Edit Service"
                onClick={() => onConfigureClick('edit', false)}
                disabled={!canEdit || !selectedService}
            >
                <Glyphicon glyph="pencil" />
            </Button>
            <Button
                variant="danger"
                title="Delete Service"
                onClick={() => onDeleteService(selectedService)}
                disabled={!canEdit || !selectedService}
            >
                <Glyphicon glyph="trash" />
            </Button>
        </FlexBox>
    );
};

export default CatalogServiceSelect;
