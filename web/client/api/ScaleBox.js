/**
 * Copyright 2015, Marko Polovina
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var L = require('leaflet'),
ScaleBox;

/**
 * [ScaleBox component]
 * @param {[Boolean]} showBar   [if you want to display scalebar]
 * @param {[Boolean]} showCombo [if you want to display scalecombo]
 * @param {[String]} units [units as string, eg. 'm', 'km', 'mi']
 * @param {[Object]} options   [component options]
 */
ScaleBox = function (showBar, showCombo, units, options) {
	"use strict";

	var that = this, 
	config = {
	},
	options = $.extend({}, config, options);

	that.bar = showBar;
	that.combo = showCombo;
	that.units = units;
	that.getBarValues = getBarValues;
	that.getComboItems = getComboItems;

	/**
	 * [getBarValues returns an array with scalebar text and element width]
	 * @return {[jQuery promise]} [array, first result is text for scalebar and the second result is scalebar element width]
	 */
	function getBarValues () {
		var def = new $.Deferred, mes = 1, metersPerPixel, distPerPixel;

		// if there is no leaflet map then return, but don't reject
		if (!leafMap)
			def.resolve(['Map is not defined!', 200]);

		// check units
		if (that.units === 'm')
			mes = 1;
		else if (that.units === 'km')
			mes = 1000;
		else if (that.units === 'mi')
			mes = 1609.344;

		// old code, it's less accuracy
		// metersPerPixel = 40075016.686 * Math.abs(Math.cos(window.leafMap.getCenter().lat * 180/Math.PI)) / Math.pow(2, window.leafMap.getZoom()+8);
		
		// get meters per pixel
		metersPerPixel = getMetersPerPixel();
		// get units per pixel
		distPerPixel = metersPerPixel / mes;

		// get text for scalebar and scalebar element width
		getDistAndPixel(distPerPixel, 10).done(function (distAndWidth) {
			var num, text, width;

			num = distAndWidth[0];
			text = num + that.units;
			width = distAndWidth[1];

			def.resolve([text, width]);
		});

		return def.promise();
	}

	/**
	 * [getMetersPerPixel return meters per pixel]
	 * @return {[Number]} [returns meters per pixel]
	 */
	function getMetersPerPixel () {
		// get leafMap center
		var centerLatLng = leafMap.getCenter(), 
		// convert to containerpoint (pixels)
		pointC = leafMap.latLngToContainerPoint(centerLatLng), 
		// add one pixel to x
		pointX = [pointC.x + 1, pointC.y], 
		// add one pixel to y
		pointY = [pointC.x, pointC.y + 1], 

		// convert containerpoints to latlng's
		latLngC = leafMap.containerPointToLatLng(pointC),
		latLngX = leafMap.containerPointToLatLng(pointX),
		latLngY = leafMap.containerPointToLatLng(pointY),

		// calculate distance between c and x (latitude)
		distanceX = latLngC.distanceTo(latLngX), 
		// calculate distance between c and y (longitude)
		distanceY = latLngC.distanceTo(latLngY); 

		// return distance on latitude
		return distanceX;
	}

	/**
	 * [getDistAndPixel returns text for scalebar and scalebar element width]
	 * @param  {[Number]} distPerPixel [units per pixel]
	 * @param  {[Number]} defDist    [default scale denominator]
	 * @return {[jQuery promise]}   [array, text and number width]
	 */
	function getDistAndPixel (distPerPixel, defDist) {
		var def = new $.Deferred(),
		elWid = defDist / distPerPixel, i = 0;

		// don't want that element width is smaller then 50 pixels
		if (elWid < 50) {
			for (i; elWid < 50; i++) {
				defDist = defDist * 10;
				elWid = (defDist / distPerPixel);
			}
		}

		// don't want that element width is greater then 400 pixels
		if (elWid > 400) {
			for (i; elWid > 400; i++) {
				defDist = defDist / 10;
				elWid = (defDist / distPerPixel);
			}
		}

		def.resolve([defDist, elWid]);

		return def.promise();
	}

	/**
	 * [getComboItems return scalecombo item in array]
	 * @return {[Array]} [scalecombo items]
	 */
	function getComboItems () {
		// min zoom level
		var minZoom = leafMap._layersMinZoom ? leafMap._layersMinZoom : 0, 
		// max zoom level
		maxZoom = leafMap._layersMaxZoom ? leafMap._layersMaxZoom : 18,
		// meters per pixel
	 	metersPerPixel = getMetersPerPixel(),
	 	// pixel to meter
	 	pixelToMeter = 0.0002645833333333,
	 	// scale on current zoom level
	 	zoomScaleOnLev = metersPerPixel / pixelToMeter,
	 	// current zoom level
	 	zoomLev = leafMap.getZoom(),
		items = [];  

		for (maxZoom; maxZoom >= minZoom; maxZoom--) {
			let difZoomLev = zoomLev - maxZoom,
			zoomForLev = difZoomLev > 0 ? (zoomScaleOnLev * Math.pow(2, difZoomLev)) : (zoomScaleOnLev / Math.pow(2, Math.abs(difZoomLev)));

			items.push([maxZoom, '1:' + parseInt(zoomForLev)]);
		}

		return items;
	}
}

module.exports = ScaleBox;