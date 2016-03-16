/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Grid, Row, Col} = require('react-bootstrap');

const {loadLocale} = require('../../actions/locale');
const {changeMapType} = require('../actions/home');

const {connect} = require('react-redux');
const {compose} = require('redux');

const Language = require('../components/home/Language');
const Brand = require('../components/home/Brand');
const Fork = require('../components/home/Fork');
const Logo = require('../components/home/Logo');
const Description = require('../components/home/Description');
const Examples = require('../components/home/Examples');
const Footer = require('../components/home/Footer');
const MapsList = require('../components/home/MapsList');

require('../assets/css/home.css');

const Home = React.createClass({
    propTypes: {
        locale: React.PropTypes.object,
        loadLocale: React.PropTypes.func,
        maps: React.PropTypes.object,
        mapType: React.PropTypes.string,
        changeMapType: React.PropTypes.func,
        loadMapConfig: React.PropTypes.func
    },
    contextTypes: {
        router: React.PropTypes.object
    },
    render() {
        return (
            <div className="home">
                <Fork/>
                <Grid fluid>
                    <Row className="show-grid">
                        <Col xs={12} md={6}>
                            <Brand/>
                        </Col>
                        <Col xs={12} md={6}>
                            <Language locale={this.props.locale.current} onChange={this.props.loadLocale.bind(null, 'translations')}/>
                        </Col>
                    </Row>
                    <Row className="show-grid">
                        <Col xs={12} md={12}>
                            <Logo/>
                        </Col>
                    </Row>
                    <Row className="show-grid">
                        <Col xs={12} md={6}>
                            <Row>
                                <Col>
                                    <Description/>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Examples/>
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={12} md={6}>
                            <MapsList
                                maps={this.props.maps} onChangeMapType={compose(this.props.changeMapType, (event) => event.target.value)}
                                mapType={this.props.mapType} title={this.props.locale.messages.manager.maps_title}
                                onGoToMap={this.goToMap}
                            />
                        {(this.props.maps) ? null : <div className="spinner-loader"></div> }
                        </Col>
                    </Row>
                    <Footer/>
                </Grid>
            </div>
        );
    },
    goToMap(map) {
        this.context.router.push("/viewer/" + this.props.mapType + "/" + map.id);
    }
});

module.exports = connect((state) => {
    return {
        maps: state.maps,
        locale: state.locale,
        mapType: state.home.mapType
    };
}, {
    loadLocale,
    changeMapType
})(Home);
