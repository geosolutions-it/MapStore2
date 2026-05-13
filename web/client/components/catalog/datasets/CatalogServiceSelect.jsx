/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactSelect from 'react-select';
import { FormGroup, Glyphicon, InputGroup } from 'react-bootstrap';
import Button from '../../layout/Button';
import Message from '../../I18N/Message';

const SelectSync = ReactSelect;

const CatalogServiceSelect = ({
    services,
    canEdit,
    onConfigureClick,
    onChangeSelectedService,
    selectedService,
    onDeleteService,
    setShowFilters
}) => {
    const getServices = () => {
        if (!services) return [];
        return Object.keys(services).map((key) => {
            const service = services[key];
            return {
                label: service.titleMsgId ? <Message msgId={service.titleMsgId} /> : service.title,
                value: key,
                service: { ...service, key }
            };
        });
    };

    const handleDeleteService = () => {
        onDeleteService(selectedService);
        setShowFilters(false);
    };

    const isServiceValid = selectedService && services?.[selectedService];
    return (
        <FormGroup className="ms-catalog-service-select">
            <InputGroup>
                <SelectSync
                    clearValueText={<Message msgId="catalog.clearValueText" />}
                    noResultsText={<Message msgId="catalog.noResultsText" />}
                    clearable
                    options={getServices()}
                    value={selectedService}
                    onChange={(val) => onChangeSelectedService(val && val.value ? val.value : "", val?.service)}
                    placeholder={<Message msgId="catalog.servicePlaceholder" />}
                />
                <InputGroup.Addon>
                    <Button
                        className= "ms-catalog-service-btn"
                        onClick={() => onConfigureClick('edit', true)}
                    >
                        <Glyphicon glyph="plus" />
                    </Button>
                </InputGroup.Addon>
                <InputGroup.Addon>
                    <Button
                        className= "ms-catalog-service-btn"
                        onClick={() => onConfigureClick('edit', false)}
                        disabled={!canEdit || !isServiceValid}
                    >
                        <Glyphicon glyph="pencil" />
                    </Button>
                </InputGroup.Addon>
                {onDeleteService ? <InputGroup.Addon>
                    <Button
                        className= "ms-catalog-service-delete-btn"
                        onClick={handleDeleteService}
                        disabled={!canEdit || !isServiceValid}
                    >
                        <Glyphicon glyph="trash" />
                    </Button>
                </InputGroup.Addon> : null}

            </InputGroup>
        </FormGroup>
    );
};

export default CatalogServiceSelect;
