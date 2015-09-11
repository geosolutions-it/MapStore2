/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var I18N = require('../../../components/I18N/I18N');
var {Panel, Button, Carousel, CarouselItem} = require('react-bootstrap');

var Examples = React.createClass({
    render() {
        return (<Panel>
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
        </Panel>);
    }
});

module.exports = Examples;
