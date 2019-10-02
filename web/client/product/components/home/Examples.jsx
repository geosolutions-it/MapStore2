/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const I18N = require('../../../components/I18N/I18N');
const {Panel, Button, Carousel, CarouselItem} = require('react-bootstrap');

const carouselImages = {
    viewer: require('../../assets/img/Viewer.jpg'),
    "3dviewer": require('../../assets/img/3DViewer.jpg'),
    mouseposition: require('../../assets/img/MousePosition.jpg'),
    scalebar: require('../../assets/img/ScaleBar.jpg'),
    layertree: require('../../assets/img/LayerTree.jpg'),
    queryform: require('../../assets/img/QueryForm.jpg'),
    featuregrid: require('../../assets/img/FeatureGrid.jpg'),
    print: require('../../assets/img/Print.jpg'),
    plugins: require('../../assets/img/Plugins.jpg'),
    api: require('../../assets/img/Api.jpg'),
    rasterstyler: require('../../assets/img/rasterstyler.jpg')
};

class Examples extends React.Component {
    render() {
        return (<Panel id="mapstore-examples-applications" className="mapstore-home-examples">
            <h3><I18N.Message msgId="home.Applications"/></h3>
            <Carousel>
                <CarouselItem>
                    <img width={900} height={500} alt="900x500" src={carouselImages.viewer}/>
                    <div className="carousel-caption">
                        <I18N.HTML msgId="home.examples.viewer.html" />
                        <Button href="#/viewer/leaflet/0" bsStyle="info" bsSize="large" target="_blank"><I18N.Message msgId="home.open" /></Button>
                    </div>
                </CarouselItem>
                <CarouselItem>
                    <img width={900} height={500} alt="900x500" src={carouselImages['3dviewer']}/>
                    <div className="carousel-caption">
                        <I18N.HTML msgId="home.examples.3dviewer.html" />
                        <Button href="examples/3dviewer" bsStyle="info" bsSize="large" target="_blank"><I18N.Message msgId="home.open" /></Button>
                    </div>
                </CarouselItem>
                <CarouselItem>
                    <img width={900} height={500} alt="900x500" src={carouselImages.mouseposition}/>
                    <div className="carousel-caption">
                        <I18N.HTML msgId="home.examples.mouseposition.html" />
                        <Button href="examples/mouseposition" bsStyle="info" bsSize="large" target="_blank"><I18N.Message msgId="home.open" /></Button>
                    </div>
                </CarouselItem>
                <CarouselItem>
                    <img width={900} height={500} alt="900x500" src={carouselImages.scalebar}/>
                    <div className="carousel-caption">
                        <I18N.HTML msgId="home.examples.scalebar.html" />
                        <Button href="examples/scalebar" bsStyle="info" bsSize="large" target="_blank"><I18N.Message msgId="home.open" /></Button>
                    </div>
                </CarouselItem>
                <CarouselItem>
                    <img width={900} height={500} alt="900x500" src={carouselImages.featuregrid}/>
                    <div className="carousel-caption">
                        <I18N.HTML msgId="home.examples.featuregrid.html" />
                        <Button href="examples/featuregrid" bsStyle="info" bsSize="large" target="_blank"><I18N.Message msgId="home.open" /></Button>
                    </div>
                </CarouselItem>
                <CarouselItem>
                    <img width={900} height={500} alt="900x500" src={carouselImages.print}/>
                    <div className="carousel-caption">
                        <I18N.HTML msgId="home.examples.print.html" />
                        <Button href="examples/print" bsStyle="info" bsSize="large" target="_blank"><I18N.Message msgId="home.open" /></Button>
                    </div>
                </CarouselItem>
                <CarouselItem>
                    <img width={900} height={500} alt="900x500" src={carouselImages.plugins}/>
                    <div className="carousel-caption">
                        <I18N.HTML msgId="home.examples.plugins.html" />
                        <Button href="examples/plugins" bsStyle="info" bsSize="large" target="_blank"><I18N.Message msgId="home.open" /></Button>
                    </div>
                </CarouselItem>
                <CarouselItem>
                    <img width={900} height={500} alt="900x500" src={carouselImages.api}/>
                    <div className="carousel-caption">
                        <I18N.HTML msgId="home.examples.api.html" />
                        <Button href="examples/api" bsStyle="info" bsSize="large" target="_blank"><I18N.Message msgId="home.open" /></Button>
                    </div>
                </CarouselItem>
            </Carousel>
        </Panel>);
    }
}

module.exports = Examples;
