/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var connect = require('react-redux').connect;
var LangSelector = require('../../../components/LangSelector/LangSelector');
var Localized = require('../../../components/I18N/Localized');
var I18N = require('../../../components/I18N/I18N');
var loadLocale = require('../../../actions/locale').loadLocale;
var MapList = require('../../../components/MapManager/MapList');
var changeMapView = require('../../../actions/map').changeMapView;
var ReactBootstrap = require('react-bootstrap');
var Panel = ReactBootstrap.Panel;
var Button = ReactBootstrap.Button;
var Grid = ReactBootstrap.Grid;
var Col = ReactBootstrap.Col;
var Row = ReactBootstrap.Row;
var Carousel = ReactBootstrap.Carousel;
var CarouselItem = ReactBootstrap.CarouselItem;

var Viewer = React.createClass({
    propTypes: {
        mapConfig: React.PropTypes.object,
        messages: React.PropTypes.object,
        locale: React.PropTypes.string,
        maps: React.PropTypes.object,
        dispatch: React.PropTypes.func
    },
    renderModules(locale) {
        return (
            <Grid fluid={true}>
                <Row className="show-grid">
                    <Col xs={12} md={6}>
                        <div>
                            <a href="http://www.geo-solutions.it">
                                <img src="examples/home/img/geosolutions-brand.png" className="mapstore-logo"/>
                            </a>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <div id="langSelContainer" key="langSelContainer" >
                            <I18N.Message msgId="Language" />: <LangSelector currentLocale={locale} onLanguageChange={this.switchLanguage}/>
                        </div>

                    </Col>
                </Row>
                <Row className="show-grid">
                    <Col xs={12} md={12}>
                     <img src="examples/home/img/mapstorelogo.png" className="mapstore-logo" />
                     <img src="examples/home/img/MapStore2.png" className="mapstore-logo" />
                    </Col>

                </Row>
               <Row className="show-grid">
                 <Col xs={12} md={6}>
                    <Row>
                        <Col>
                            <Panel className="mapstore-presentation-panel">
                                 <p>
                                     <I18N.HTML msgId="home.description" />
                                 </p>
                            </Panel>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Panel>
                                <h3><I18N.Message msgId="home.Applications"/></h3>
                            <Carousel>
                                    <CarouselItem>
                                      <img width={900} height={500} alt="900x500" src="examples/home/img/Viewer.png"/>
                                      <div className="carousel-caption">
                                        <I18N.HTML msgId="home.examples.viewer.html" />
                                        <Button href="examples/viewer" bsStyle="info" target="_blank"><I18N.Message msgId="home.open" /></Button>
                                      </div>
                                    </CarouselItem>
                                    <CarouselItem>
                                      <img width={900} height={500} alt="900x500" src="examples/home/img/Manager.png"/>
                                      <div className="carousel-caption">
                                          <I18N.HTML msgId="home.examples.manager.html" />
                                        <Button href="examples/manager" bsStyle="info" target="_blank"><I18N.Message msgId="home.open" /></Button>
                                      </div>
                                    </CarouselItem>
                                </Carousel>
                            </Panel>
                        </Col>

                    </Row>
                 </Col>
                 <Col xs={12} md={6} style={{
                     }}>
                     {this.renderManager()}
                 </Col>
                  </Row>
                  <Row>
                      <Col>
                          <div id="footer" style={{
                                  textAlign: "center"
                              }}>

                            <p align="center"><b><a href="http://www.geo-solutions.it">GeoSolutions s.a.s.</a></b> • Via Poggio alle Viti 1187 - 55054 Massarosa (Lucca) - Italy</p>
                            <p align="center"><a href="mailto:info@geo-solutions.it">info@geo-solutions.it</a> • <a href="http://www.geo-solutions.it">www.geo-solutions.it</a> • Tel: 0039 0584 962313 • Fax: 0039 0584 1660272</p>
                        </div>
                      </Col>
                  </Row>
              </Grid>
          )
        ;
    },
    renderManager() {
        if (this.props.maps) {
            return (<MapList viewerUrl="examples/viewer"
            maps={this.props.maps ? this.props.maps.results : []}
            panelProps={{className: "mapmanager",
                header: this.props.messages.manager.maps_title,
                 collapsible: true,
                 defaultExpanded: true}} />);
        }
        return <div className="spinner-loader"></div>;
    },
    render() {
        if (this.props.messages) {
            return (
                <Localized messages={this.props.messages} locale={this.props.locale}>
                    {() => {return this.renderModules(this.props.locale); }}

                </Localized>
            );
        }
        return null;
    },
    manageNewMapView(center, zoom) {
        this.props.dispatch(changeMapView(center, zoom));
        const normCenter = {x: center.lng, y: center.lat, crs: "EPSG:4326"};
        this.props.dispatch(changeMapView(normCenter, zoom));
    },
    switchLanguage(lang) {
        this.props.dispatch(loadLocale('../../translations', lang));
    }
});


module.exports = connect((state) => {
    return {
        messages: state.locale ? state.locale.messages : null,
        locale: state.locale ? state.locale.current : null,
        maps: state.maps ? state.maps : null
    };
})(Viewer);
