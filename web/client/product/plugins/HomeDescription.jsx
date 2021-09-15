/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';
import { Jumbotron, Grid, Row, Col } from 'react-bootstrap';
import HTML from '../../components/I18N/HTML';
import logo from "./attribution/atlalogo11.png";

/**
 * Description of MapStore rendered in the home page.
 * Renders the HTML in localization files identified by
 * the path `home.shortDescription`.
 * @name HomeDescription
 * @class
 * @memberof plugins
 * @prop {string} [name='MapStore'] Title of the text
 */
class HomeDescription extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        className: PropTypes.string,
        name: PropTypes.string
    };

    static defaultProps = {
        name: 'Geoportale RSE',
        className: 'ms-home-description',
        style: {}
    };

    render() {
        return (
            <div>
                <Jumbotron className={this.props.className} style={this.props.style}>
                    <Grid>
                        <Row>
                            <Col xs={12} className="text-center">
                                <h1><HTML msgId="home.titolo_pagina"/></h1>
                                <p>
                                    <HTML msgId="home.shortDescription"/>
                                </p>
                            </Col>
                        </Row>
                    </Grid>
                </Jumbotron>
                <Grid>
                    <Row>
                        <Col md={30}>
                            <p>
                            <HTML msgId="home.RSE_Descrizione"/>
                            </p>
                            <p>
                            <HTML msgId="home.RSE_Description"/>
                            </p>
                        </Col>
                    </Row>
                </Grid>
                
            </div>
        );
    }
}

export default {
    HomeDescriptionPlugin: HomeDescription
};
