/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


function degToDms(deg) {
    // convert decimal deg to minutes and seconds
    var d = Math.floor(deg);
    var minfloat = (deg - d) * 60;
    var m = Math.floor(minfloat);
    var secfloat = (minfloat - m) * 60;
    var s = Math.floor(secfloat);

    return "" + d + "° " + m + "' " + s + "'' ";
}

function getFormattedBearingValue(azimuth = 0) {
    var bearing = "";
    if (azimuth >= 0 && azimuth < 90) {
        bearing = "N " + degToDms(azimuth) + "E";
    } else if (azimuth > 90 && azimuth <= 180) {
        bearing = "S " + degToDms(180.0 - azimuth) + "E";
    } else if (azimuth > 180 && azimuth < 270) {
        bearing = "S " + degToDms(azimuth - 180.0 ) + "W";
    } else if (azimuth >= 270 && azimuth <= 360) {
        bearing = "N " + degToDms(360 - azimuth ) + "W";
    }

    return bearing;
}

function mToft(length) {
    return length * 3.28084;
}

function mTokm(length) {
    return length * 0.001;
}

function mTomi(length) {
    return length * 0.000621371;
}

function mTonm(length) {
    return length * 0.000539956803;
}

function sqmTosqft(area) {
    return area * 10.7639;
}

function sqmTosqkm(area) {
    return area * 0.000001;
}

function sqmTosqmi(area) {
    return area * 0.000000386102159;
}
function sqmTosqnm(area) {
    return area * 0.00000029155;
}

function getFormattedLength(unit = "m", length = 0) {
    switch (unit) {
    case 'm':
        return length;
    case 'ft':
        return mToft(length);
    case 'km':
        return mTokm(length);
    case 'mi':
        return mTomi(length);
    case 'nm':
        return mTonm(length);
    default:
        return length;
    }
}

function getFormattedArea(unit = "sqm", area = 0) {
    switch (unit) {
    case 'sqm':
        return area;
    case 'sqft':
        return sqmTosqft(area);
    case 'sqkm':
        return sqmTosqkm(area);
    case 'sqmi':
        return sqmTosqmi(area);
    case 'sqnm':
        return sqmTosqnm(area);
    default:
        return area;
    }
}


module.exports = {
    getFormattedBearingValue,
    getFormattedLength,
    getFormattedArea,
    degToDms,
    mToft,
    mTokm,
    mTomi,
    mTonm,
    sqmTosqmi,
    sqmTosqkm,
    sqmTosqnm,
    sqmTosqft
};
