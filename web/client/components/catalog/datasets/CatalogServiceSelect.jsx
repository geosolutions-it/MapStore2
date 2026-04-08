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
    setShowFilters,
    disableServiceSelection = false,
    showServiceAddButton = true,
    showServiceEditButton = true,
    showServiceDeleteButton = true
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

    return (
        <FormGroup className="ms-catalog-service-select">
            <InputGroup>
                <SelectSync
                    clearValueText={<Message msgId="catalog.clearValueText" />}
                    noResultsText={<Message msgId="catalog.noResultsText" />}
                    clearable
                    disabled={disableServiceSelection}
                    options={getServices()}
                    value={selectedService}
                    onChange={(val) => onChangeSelectedService(val && val.value ? val.value : "", val?.service)}
                    placeholder={<Message msgId="catalog.servicePlaceholder" />}
                />
                {showServiceAddButton ? <InputGroup.Addon>
                    <Button
                        className= "ms-catalog-service-btn"
                        onClick={() => onConfigureClick('edit', true)}
                    >
                        <Glyphicon glyph="plus" />
                    </Button>
                </InputGroup.Addon> : null}
                {showServiceEditButton ? <InputGroup.Addon>
                    <Button
                        className= "ms-catalog-service-btn"
                        onClick={() => onConfigureClick('edit', false)}
                        disabled={!canEdit || !selectedService}
                    >
                        <Glyphicon glyph="pencil" />
                    </Button>
                </InputGroup.Addon> : null}
                {onDeleteService && showServiceDeleteButton ? <InputGroup.Addon>
                    <Button
                        className= "ms-catalog-service-delete-btn"
                        onClick={handleDeleteService}
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
