/* eslint-disable no-use-before-define */
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import olPopUp from './OlPopUp';
import assign from 'object-assign';

import {inherits} from 'ol';
import BaseObject from 'ol/Object';
import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Geolocation from 'ol/Geolocation';
import {Point, Circle} from 'ol/geom';
import GeometryCollection from 'ol/geom/GeometryCollection';
import {Style, Fill, Stroke, Icon} from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import throttle from 'lodash/throttle';
import isNil from 'lodash/isNil';
import {getNavigationArrowSVG} from '../LocateUtils';


const popUp = olPopUp();


const OlLocate = function(map, optOptions) {
    BaseObject.call(this, {state: "DISABLED"});
    this.map = map;
    const style = this._getDefaultStyles() || {};
    let defOptions = {
        drawCircle: true, // draw accuracy circle
        follow: true, // follow with zoom and pan the user's location
        stopFollowingOnDrag: false, // if follow is true, stop following when map is dragged (deprecated)
        // if true locate control remains active on click even if the user's location is in view.
        // clicking control will just pan to location not implemented
        remainActive: true,
        style,
        metric: true,
        onLocationError: this.onLocationError,
        // keep the current map zoom level when displaying the user's location. (if 'false', use maxZoom)
        keepCurrentZoomLevel: false,
        showPopup: true, // display a popup when the user click on the inner marker
        strings: {
            metersUnit: "meters",
            feetUnit: "feet",
            popup: "You are within {distance} {unit} from this point"
        },
        locateOptions: {
            maximumAge: 2000,
            enableHighAccuracy: false,
            timeout: 10000,
            maxZoom: 18
        }
    };

    this.options = assign({}, defOptions, optOptions || {} );
    this.geolocate = new Geolocation({
        projection: this.map.getView().getProjection(),
        trackingOptions: this.options.locateOptions
    });
    this.updateHandler = this._updatePosFt.bind(this);

    this.geolocate.on('change:position', (this.options.locateOptions.rateControl)
        ? throttle( this.updateHandler, this.options.locateOptions.rateControl )
        : this.updateHandler);
    this.geolocate.on('change:heading', () => {
        const heading = this.geolocate.getHeading();
        this.posFt.setProperties({
            heading
        });
    })
    this.popup = popUp;
    this.popup.hidden = true;
    this.popCnt = popUp.getElementsByClassName("ol-popup-cnt")[0];
    this.overlay = new Overlay({
        element: this.popup,
        positioning: 'top-center',
        stopEvent: false
    });
    this.layer = new VectorLayer({
        source: new VectorSource({useSpatialIndex: false})});
    this.posFt = new Feature({
        geometry: this.geolocate.getAccuracyGeometry(),
        properties: {
            heading: this.geolocate.getHeading()
        },
        name: 'position',
        id: '_locate-pos'});
    this.posFt.setStyle(this.options.style);
    this.layer.getSource().addFeature(this.posFt);

    this.clickHandler = this.mapClick.bind(this);
    this.stopHandler = this.stopFollow.bind(this);
    this.errorHandler = this.options.onLocationError.bind(this);
};

inherits(OlLocate, BaseObject);

OlLocate.prototype.start = function() {
    this.geolocate.on('error', this.errorHandler);
    this.follow = this.options.follow;
    this.geolocate.setTracking(true);
    this.layer.setMap(this.map);
    this.map.addOverlay(this.overlay);
    if (this.options.showPopup) {
        this.map.on('click', this.clickHandler);
        this.map.on('touch', this.clickHandler);
    }
    if (this.options.stopFollowingOnDrag) {
        this.map.on('pointerdrag', this.stopHandler);
    }
    if (!this.p) {
        this.set("state", "LOCATING");
    } else {
        this._updatePosFt();
    }
};
OlLocate.prototype.startFollow = function() {
    this.follow = true;
    if (this.options.stopFollowingOnDrag) {
        this.map.on('pointerdrag', this.stopHandler);
    }
    if (this.p) {
        this._updatePosFt();
    }
};
OlLocate.prototype.stop = function() {
    this.geolocate.un('error', this.errorHandler);
    this.geolocate.setTracking(false);
    this.popup.hide = true;
    this.map.removeOverlay(this.overlay);
    this.layer.setMap( null );
    if (this.options.showPopup) {
        this.map.un('click', this.clickHandler);
        this.map.un('touch', this.clickHandler);
    }
    if (this.options.stopFollowingOnDrag) {
        this.map.un('pointerdrag', this.stopHandler);
    }
    this.set("state", "DISABLED");
};


OlLocate.prototype.stopFollow = function() {
    this.follow = false;
    this.map.un('pointerdrag', this.stopHandler);
    this.set("state", "ENABLED");
};

OlLocate.prototype._updatePosFt = function() {
    let state = this.get("state");
    let nState = this.follow ? "FOLLOWING" : "ENABLED";
    if (nState !== state) {
        this.set("state", nState);
    }
    let p = this.geolocate.getPosition();
    this.p = p;
    let point = new Point([parseFloat(p[0]), parseFloat(p[1])]);
    if (this.options.drawCircle) {
        let accuracy = new Circle([parseFloat(p[0]), parseFloat(p[1])], this.geolocate.getAccuracy());
        this.posFt.setGeometry(new GeometryCollection([point, accuracy]));
    } else {
        this.posFt.setGeometry(new GeometryCollection([point]));
    }
    const heading = this.geolocate.getHeading();
    this.posFt.setProperties({
        heading
    });
    if (!this.popup.hidden) {
        this._updatePopUpCnt();
    }
    if (this.follow) {
        this.updateView(point);
    }
    // Update only once
    if (!this.options.remainActive) {
        this.geolocate.setTracking(false);
    }
    // debug
    /*
    let div = document.getElementById("OL_LOCATION_DEBUG");
    if (!div) {
        div = document.createElement("div");
        div.setAttribute('id', "OL_LOCATION_DEBUG");
        div.setAttribute('style', "position: absolute; bottom: 0; width: 100%; height: 200px; z-index:100000; background: rgba(5,5,5,.5)");
        document.body.appendChild(div);
    }
    div.innerHTML = `<pre>
        Position: ${p[0]}, ${p[1]},
        Heading: ${heading}
    </pre>`;
    */

};

OlLocate.prototype.updateView = function(point) {
    if (this.follow) {
        this.map.getView().setCenter(point.getCoordinates());
        if (!this.options.keepCurrentZoomLevel) {
            this.map.getView().setZoom(this.options.locateOptions.maxZoom);
        }
    }
};
OlLocate.prototype._updatePopUpCnt = function() {
    let distance;
    let unit;
    if (this.options.metric) {
        distance = this.geolocate.getAccuracy();
        unit = this.options.strings.metersUnit;
    } else {
        distance = Math.round(this.geolocate.getAccuracy() * 3.2808399);
        unit = this.options.strings.feetUnit;
    }
    let cnt = this.options.strings.popup.replace("{distance}", distance);
    this.popCnt.innerHTML = cnt.replace("{unit}", unit);
    this.overlay.setPosition(this.posFt.getGeometry().getGeometries()[0].getCoordinates());
    this.popup.hidden = false;
};

OlLocate.prototype.onLocationError = function(err) {
    /* eslint-disable */
    alert(err.message);
    /* eslint-enable */
};

OlLocate.prototype.mapClick = function(evt) {
    let feature = this.map.forEachFeatureAtPixel(evt.pixel,
        function(ft) {return ft; });
    if (feature && feature.get('id') === '_locate-pos' && this.popup.hidden) {
        this._updatePopUpCnt();
    } else if (!this.popup.hidden ) {
        popUp.hidden = true;
    }
};

OlLocate.prototype._getDefaultStyles = function() {
    const color = '#2A93EE';
    const circleAccuracyStyle = {
        fill: new Fill({color: 'rgba(19,106,236,0.15)'}),
        stroke: new Stroke({color: 'rgba(19,106,236,1)', width: 2})
    };
    const navArrow = getNavigationArrowSVG({color, svgAttributes: 'width="100" height="100"'});
    return (feature) => {
        const heading = feature.getProperties()?.heading;
        if (!isNil(heading)) {
            return new Style({
                image: new Icon({
                    imgSize: [100, 100],

                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    anchor: [0.5, 0.5],
                    scale: 0.3,
                    rotation: heading ?? 0,
                    opacity: 1,
                    src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(navArrow)
                }),
                ...circleAccuracyStyle
            });
        }
        return new Style({
            image: new CircleStyle({
                radius: 6,
                fill: new Fill({color}),
                stroke: new Stroke({color: 'rgba(19,106,236,1)', width: 2})
            }),
            ...circleAccuracyStyle
        });
    };
};

OlLocate.prototype.setStrings = function(newStrings) {
    this.options.strings = assign({}, this.options.strings, newStrings);
};

OlLocate.prototype.setTrackingOptions = function(options) {
    if (this.geolocate) {
        this.geolocate.setTrackingOptions(options);
        this.options.locateOptions = {...options};
    }
};

export default OlLocate;
