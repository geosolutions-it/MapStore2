/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { Col, FormGroup, FormControl, Grid, Row } = require('react-bootstrap');
const localizeProps = require('../misc/enhancers/localizedProps');
const SearchInput = localizeProps("placeholder")(FormControl);
module.exports = ({ onSearchTextChange = () => { }, searchText, title }) =>
    (<Grid className="catalog-form" fluid><Row><Col xs={12}>
        {title && (<h4 className="text-center">{title}</h4>)}
        <FormGroup controlId="catalog-form">
            <SearchInput type="text" placeholder="catalog.textSearchPlaceholder" value={searchText} onChange={(e) => onSearchTextChange(e.currentTarget.value)} />
        </FormGroup>
    </Col></Row></Grid>);
