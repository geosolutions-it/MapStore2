/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var connect = require('react-redux').connect;
var assign = require('object-assign');

var {bindActionCreators} = require('redux');

var {loadLocale} = require('../../../actions/locale');
var {changeMapType} = require('../../manager/actions/mapType');

var {Grid, Col, Row} = require('react-bootstrap');

var Localized = require('../../../components/I18N/Localized');

var Brand = require('../components/Brand');
var Logo = require('../components/Logo');
var Description = require('../components/Description');
var Examples = require('../components/Examples');
var MapsList = require('../components/MapsList');
var Language = require('../components/Language');
var Footer = require('../components/Footer');

var Home = React.createClass({
    propTypes: {
        messages: React.PropTypes.object,
        locale: React.PropTypes.string,
        maps: React.PropTypes.shape({
            success: React.PropTypes.bool.isRequired,
            totalCount: React.PropTypes.number.isRequired,
            results: React.PropTypes.oneOfType([
                React.PropTypes.string,
                React.PropTypes.array
            ])
        }),
        mapType: React.PropTypes.string,
        changeMapType: React.PropTypes.func,
        loadLocale: React.PropTypes.func
    },
    renderLayout() {
        return (
            <Grid fluid>
                <Row className="show-grid">
                    <Col xs={12} md={6}>
                        <Brand/>
                    </Col>
                    <Col xs={12} md={6}>
                        <Language locale={this.props.locale} onChange={this.props.loadLocale}/>
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
                     <MapsList maps={this.props.maps} onChangeMapType={this.changeMapType}
                         mapType={this.props.mapType} title={this.props.messages.manager.maps_title}/>
                 </Col>
                  </Row>
                  <Row>
                      <Col>
                          <Footer/>
                      </Col>
                  </Row>
              </Grid>
          )
        ;
    },
    render() {
        return (
            <Localized messages={this.props.messages} locale={this.props.locale}>
                {() => {return this.renderLayout(); }}
            </Localized>
        );
    },
    changeMapType: function(event) {
        this.props.changeMapType(event.target.value);
    }
});


module.exports = connect((state) => {
    return {
        messages: state.locale ? state.locale.messages : null,
        locale: state.locale ? state.locale.current : null,
        mapType: state.mapType,
        maps: state.maps ? state.maps : null
    };
}, dispatch => {
    return bindActionCreators(assign({}, {
        loadLocale: loadLocale.bind(null, 'translations'),
        changeMapType: changeMapType
    }), dispatch);
})(Home);
