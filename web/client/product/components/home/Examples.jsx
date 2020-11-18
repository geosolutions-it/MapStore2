/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Carousel, CarouselItem, Panel } from 'react-bootstrap';

import I18N from '../../../components/I18N/I18N';
import viewer3d from '../../assets/img/3DViewer.jpg';
import api from '../../assets/img/Api.jpg';
import featuregrid from '../../assets/img/FeatureGrid.jpg';
import layertree from '../../assets/img/LayerTree.jpg';
import mouseposition from '../../assets/img/MousePosition.jpg';
import plugins from '../../assets/img/Plugins.jpg';
import print from '../../assets/img/Print.jpg';
import queryform from '../../assets/img/QueryForm.jpg';
import rasterstyler from '../../assets/img/rasterstyler.jpg';
import scalebar from '../../assets/img/ScaleBar.jpg';
import viewer from '../../assets/img/Viewer.jpg';
import Button from '../../../components/misc/Button';

const carouselImages = {
    viewer,
    "3dviewer": viewer3d,
    mouseposition,
    scalebar,
    layertree,
    queryform,
    featuregrid,
    print,
    plugins,
    api,
    rasterstyler
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

export default Examples;
