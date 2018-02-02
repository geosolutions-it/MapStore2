/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { Col, FormGroup, FormControl, Grid, Row } = require('react-bootstrap');
const CatalogServiceSelector = require('./CatalogServiceSelector');
module.exports = ({onSearchTextChange = () => {}, searchText, title, catalog, services, isValidServiceSelected}) =>
( <Grid className="catalog-form" fluid><Row><Col xs={12}>
    <h4 className="text-center">{title}</h4>
    <FormGroup>
        <CatalogServiceSelector servieces={services} catalog={catalog} isValidServiceSelected={isValidServiceSelected}/>
    </FormGroup>
    <FormGroup controlId="catalog-form">
        <FormControl type="text" placeholder="Search..." value={searchText} onChange={(e) => onSearchTextChange(e.currentTarget.value)}/>
    </FormGroup>
</Col></Row></Grid>);
