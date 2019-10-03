/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const {Jumbotron, Grid, Row, Col} = require('react-bootstrap');
const HTML = require('../../components/I18N/HTML');

class HomeDescription extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        className: PropTypes.string,
        name: PropTypes.string
    };

    static defaultProps = {
        name: 'MapStore',
        className: 'ms-home-description',
        style: {}
    };

    render() {
        return (
            <Jumbotron className={this.props.className} style={this.props.style}>
                <Grid>
                    <Row>
                        <Col xs={12} className="text-center">
                            <h1>{this.props.name}</h1>
                            <p>
                                <HTML msgId="home.shortDescription"/>
                            </p>
                        </Col>
                    </Row>
                </Grid>
            </Jumbotron>
        );
    }
}

module.exports = {
    HomeDescriptionPlugin: HomeDescription
};
