/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactSelect from 'react-select';
import { FormGroup, Glyphicon, InputGroup } from 'react-bootstrap';
import Button from '../../../components/layout/Button';
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
                value: key,
                service: { ...service, key }
            };
        });
    };

    return (
        <FormGroup className="ms-catalog-service-select">
            <InputGroup>
                <SelectSync
                    clearValueText={getMessageById(messages, "catalog.clearValueText")}
                    noResultsText={getMessageById(messages, "catalog.noResultsText")}
                    clearable
                    options={getServices()}
                    value={selectedService}
                    onChange={(val) => onChangeSelectedService(val && val.value ? val.value : "", val?.service)}
                    placeholder={getMessageById(messages, "catalog.servicePlaceholder")}
                />
                <InputGroup.Addon>
                    <Button
                        onClick={() => onConfigureClick('edit', true)}
                    >
                        <Glyphicon glyph="plus" />
                    </Button>
                </InputGroup.Addon>
                <InputGroup.Addon>
                    <Button
                        onClick={() => onConfigureClick('edit', false)}
                        disabled={!canEdit || !selectedService}
                    >
                        <Glyphicon glyph="pencil" />
                    </Button>
                </InputGroup.Addon>
                {onDeleteService ? <InputGroup.Addon>
                    <Button
                        onClick={() => onDeleteService(selectedService)}
                        disabled={!canEdit || !selectedService}
                    >
                        <Glyphicon glyph="trash" />
                    </Button>
                </InputGroup.Addon> : null}

            </InputGroup>
        </FormGroup>
    );
};

export default CatalogServiceSelect;
