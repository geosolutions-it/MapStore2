/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { Col, FormGroup, FormControl, Grid, Row } = require('react-bootstrap');
module.exports = ({onChange = () => {}}) =>
( <Grid fluid><Row><Col xs={12}>
    <FormGroup controlId="stats-title">
        <FormControl type="text" placeholder="Search..." onChange={(e) => onChange(e.currentTarget.value)}/>
    </FormGroup>
</Col></Row></Grid>);
