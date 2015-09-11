/**
 * Copyright 2015, Marko Polovina
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * [ScaleBox component]
 * @param {[Boolean]} showBar   [if you want to display scalebar]
 * @param {[Boolean]} showCombo [if you want to display scalecombo]
 * @param {[String]} units [units as string, eg. 'm', 'km', 'mi']
 * @param {[Object]} options   [component options]
 */
var ScaleBox = function(map, showBar, showCombo, units, options) {
    this.options = options;
    this.map = map;
    this.bar = showBar;
    this.combo = showCombo;
    this.units = units;
};

/**
 * [getBarValues returns an array with scalebar text and element width]
 * @return {[jQuery promise]} [array, first result is text for scalebar and the second result is scalebar element width]
 */
ScaleBox.prototype.getBarValues = function() {
    var that = this;
    var mes;
    var metersPerPixel;
    var distPerPixel;
    var distAndWidth;
    var num;
    var text;
    var width;

    // if there is no leaflet map then return, but don't reject
    if (!that.map) {
        return ['Map is not defined!', 200];
    }

    // check units
    if (that.units === 'm') {
        mes = 1;
    } else if (that.units === 'km') {
        mes = 1000;
    } else if (that.units === 'mi') {
        mes = 1609.344;
    }

    // old code, it's less accuracy
    // metersPerPixel = 40075016.686 * Math.abs(Math.cos(map.getCenter().lat * 180/Math.PI)) / Math.pow(2, map.getZoom()+8);

    // get meters per pixel
    metersPerPixel = that.getMetersPerPixel();
    // get units per pixel
    distPerPixel = metersPerPixel / mes;

    // get text for scalebar and scalebar element width
    distAndWidth = that.getDistAndPixel(distPerPixel, 10);

    num = distAndWidth[0];
    text = num + that.units;
    width = distAndWidth[1];

    return [text, width];
};

/**
 * [getMetersPerPixel return meters per pixel]
 * @return {[Number]} [returns meters per pixel]
 */
ScaleBox.prototype.getMetersPerPixel = function() {
    // get map center
    var centerLatLng = this.map.getCenter();
    // convert to containerpoint (pixels)
    var pointC = this.map.latLngToContainerPoint(centerLatLng);
    // add one pixel to x
    var pointX = [pointC.x + 1, pointC.y];

    // convert containerpoints to latlng's
    var latLngC = this.map.containerPointToLatLng(pointC);
    var latLngX = this.map.containerPointToLatLng(pointX);

    // calculate distance between c and x (latitude)
    var distanceX = latLngC.distanceTo(latLngX);

    // return distance on latitude
    return distanceX;
};

/**
 * [getDistAndPixel returns text for scalebar and scalebar element width]
 * @param  {[Number]} distPerPixel [units per pixel]
 * @param  {[Number]} defDist    [default scale denominator]
 * @return {[jQuery promise]}   [array, text and number width]
 */
ScaleBox.prototype.getDistAndPixel = function(distPerPixel, defDist) {
    var defaultDistance = defDist;
    var elWid = defaultDistance / distPerPixel;
    var i = 0;

    // don't want that element width is smaller then 50 pixels
    if (elWid < 50) {
        for (i; elWid < 50; i++) {
            defaultDistance = defaultDistance * 10;
            elWid = (defaultDistance / distPerPixel);
        }
    }

    // don't want that element width is greater then 400 pixels
    if (elWid > 400) {
        for (i; elWid > 400; i++) {
            defaultDistance = defaultDistance / 10;
            elWid = (defaultDistance / distPerPixel);
        }
    }

    return [defaultDistance, elWid];
};

/**
 * [getComboItems return scalecombo item in array]
 * @return {[Array]} [scalecombo items]
 */
ScaleBox.prototype.getComboItems = function() {
    // min zoom level
    var minZoom = this.map._layersMinZoom ? this.map._layersMinZoom : 0;
    // max zoom level
    var maxZoom = this.map._layersMaxZoom ? this.map._layersMaxZoom : 18;
    // meters per pixel
    var metersPerPixel = this.getMetersPerPixel();
    // pixel to meter
    var pixelToMeter = 0.0002645833333333;
    // scale on current zoom level
    var zoomScaleOnLev = metersPerPixel / pixelToMeter;
    // current zoom level
    var zoomLev = this.map.getZoom();
    var items = [];

    for (maxZoom; maxZoom >= minZoom; maxZoom--) {
        let difZoomLev = zoomLev - maxZoom;
        let zoomForLev = difZoomLev > 0 ? parseInt((zoomScaleOnLev * Math.pow(2, difZoomLev)), 10) : parseInt((zoomScaleOnLev / Math.pow(2, Math.abs(difZoomLev))), 10);

        items.push([maxZoom, '1:' + zoomForLev]);
    }

    return items;
};

module.exports = ScaleBox;
