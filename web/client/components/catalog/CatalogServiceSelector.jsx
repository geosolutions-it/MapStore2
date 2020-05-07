/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {InputGroup, Glyphicon} = require('react-bootstrap');

const localizedProps = require('../misc/enhancers/localizedProps');
const Select = localizedProps(['placeholder', 'clearValueText', 'noResultsText'])(require('react-select').default);

module.exports = ({
    isValidServiceSelected,
    services,
    selectedService,
    onChangeCatalogMode = () => {},
    onChangeSelectedService = () => {}
}) => (<InputGroup>
    <Select
        clearValueText={"catalog.clearValueText"}
        noResultsText={"catalog.noResultsText"}
        clearable
        options={services}
        value={selectedService}
        onChange={(val) => onChangeSelectedService(val && val.value ? val.value : "")}
        placeholder={"catalog.servicePlaceholder"} />
    {isValidServiceSelected ? (<InputGroup.Addon className="btn"
        onClick={() => onChangeCatalogMode("edit", false)}>
        <Glyphicon glyph="pencil"/>
    </InputGroup.Addon>) : null}
    <InputGroup.Addon className="btn" onClick={() => onChangeCatalogMode("edit", true)}>
        <Glyphicon glyph="plus"/>
    </InputGroup.Addon>
</InputGroup>
);
