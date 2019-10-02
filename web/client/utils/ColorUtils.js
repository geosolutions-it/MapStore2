/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const tinycolor = require("tinycolor2");
const {toNumber} = require("lodash");

/**
 * Porting of various MapStore(1) utilities for random/color scale generations
 * @name ColorUtils
 * @memberof utils
 * @static
 */
const ColorUtils = {
    decToHex: ( nn ) => {
        const HCHARS = '0123456789ABCDEF';
        let n = parseInt(nn, 10);
        n = ( !isNaN( n )) ? n : 0;
        n = (n > 255 || n < 0) ? 0 : n;
        return HCHARS.charAt( ( n - n % 16 ) / 16 ) + HCHARS.charAt( n % 16 );
    },
    rgbToHex: ( r, g, b ) => {
        if ( r instanceof Array ) { return ColorUtils.rgbToHex( r[0], r[1], r[2] ); }
        return "#" + ColorUtils.decToHex( r ) + ColorUtils.decToHex( g ) + ColorUtils.decToHex( b );
    },
    realToDec: function( n ) {
        return Math.min( 255, Math.round( n * 256 ) );
    },
    rgbToHsv: ( rr, gg, bb ) => {
        if ( rr instanceof Array ) { return ColorUtils.rgbToHsv( rr[0], rr[1], rr[2] ); }
        let r = rr / 255;
        let g = gg / 255;
        let b = bb / 255;
        let min;
        let max;
        let delta;
        let h;
        let s;
        min = Math.min( Math.min( r, g ), b );
        max = Math.max( Math.max( r, g ), b );
        delta = max - min;
        switch (max) {
        case min: h = 0; break;
        case r: h = 60 * ( g - b ) / delta;
            if ( g < b ) { h += 360; }
            break;
        case g: h = ( 60 * ( b - r ) / delta ) + 120; break;
        case b: h = ( 60 * ( r - g ) / delta ) + 240; break;
        default: break;
        }
        s = ( max === 0 ) ? 0 : 1 - ( min / max );
        return [Math.round( h ), s, max];
    },
    /**
     * Generates a scale of colors, as much different as possible.
     * @memberof utils.ColorUtils
     * @param  {number} total the number of classes to generated
     * @return {Array}       array of hexstrings of colors
     */
    distributedColorsHEX: (total) => {
        let i = 360 / (total - 1); // distribute the colors evenly on the hue range
        // let i = total / 360; // distribute the colors evenly on the hue range
        let r = []; // hold the generated colors
        const hsvToRgb = (h, s, v) => {
            let rgb = hsvToRgb(h, s, v);
            // return rgb;
            return ColorUtils.rgbToHex(rgb);
        };
        for (let x = 0; x < total; x++) {
            r.push(hsvToRgb(i * x, 0.57, 0.63, x)); // you can also alternate the saturation and value for even more contrast between the colors
        }
        return r;
    },
    /**
     * Generates a scale of colors of the same tone.
     * @memberof utils.ColorUtils
     * @param {number} base  from 0 to 360 the hsv to start (e.g. 0 red)
     * @param {number} range from 0 to 360 how much have to change the color
     * @param {number} total the number of classes to generate
     * @param options: some options for color generations
     * h: if present, keep hue fixed.
     * s: if present, keep saturation fixed.
     * v: if present, keep value fixed.
     * e.g. To generate a chart with a same tone you kave to change value and saturation
     * and keep the same color as base. So the options will be:
     * {base:90,range:0}
     * e.g. To generate many different colors
     * {base:180,range:360, s: 0.67,v :0.67}
     */
    sameToneRangeColors: (bb, range, total, options) => {
        // if base is a string i suppose is an hex color
        let base = bb;
        if (isNaN(parseFloat(bb))) {
            let hsvbase = ColorUtils.hexToHsv(bb);
            base = hsvbase[0];
        }
        let svstep = 0.50 / (total - 1); // distribute the colors evenly on the sat/value range
        let hstep = range / (total - 1); // distribute the colors evenly on the hue range
        // let i = total / 360; // distribute the colors evenly on the hue range
        let r = []; // hold the generated colors

        if (total === 1) {
            svstep = 0.50;
            hstep = range / 2;
        }
        for (let x = 0; x < total; x++) {
            let h = base + x * hstep - range / 2;
            let s = svstep * x + 0.30;
            let v = s;
            if (options) {
                h = options.h || h;
                s = options.s || s;
                v = options.v || v;
            }
            // this is a 1 dimension diagonal sampling of points
            r.push(ColorUtils.hsvToHex(h, s, v, x));
        }
        return r;
    },
    hsvToRgb: ( h, s, v ) => {
        if ( h instanceof Array ) { return ColorUtils.hsvToRgb( h[0], h[1], h[2] ); }
        let r;
        let g;
        let b;
        let i = Math.floor( ( h / 60 ) % 6 );
        let f = ( h / 60 ) - i;
        let p = v * ( 1 - s );
        let q = v * ( 1 - f * s );
        let t = v * ( 1 - ( 1 - f ) * s );
        switch (i) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
        default: break;
        }
        return [ColorUtils.realToDec( r ), ColorUtils.realToDec( g ), ColorUtils.realToDec( b )];
    },
    hsvToHex: (h, s, v) => {
        let rgb = ColorUtils.hsvToRgb(h, s, v);
        // return rgb;
        return ColorUtils.rgbToHex(rgb);
    },
    hexToHsv: (h) => {
        let hex = h;
        if (hex.length > 0) {
            if (hex[0] === '#') {
                hex = h.substring(1);
            }
            let rgb = ColorUtils.hexToRgb(hex);
            return ColorUtils.rgbToHsv(rgb);
        }
        return null;
    },
    hexToRgb: (h) => {
        let hex = h;
        let r;
        let g;
        let b;
        if (hex.charAt(0) === '#') {
            hex = h.substring(1);
        }
        r = hex.charAt(0) + hex.charAt(1);
        g = hex.charAt(2) + hex.charAt(3);
        b = hex.charAt(4) + hex.charAt(5);
        return [
            parseInt(r, 16),
            parseInt(g, 16),
            parseInt(b, 16)
        ];
    },
    colorToHexStr: (color = 'red') => tinycolor(color).toHexString(),
    /**
    * convert any valid css color to rgba str
    * @param {string} color any valid css color
    * @param {number} opacity 0 - 1 alpha value
    * @param {string} defaultColor any valid css color
    * @return {string} rgba string or undefined if color and defaultColor are undefined
    */
    colorToRgbaStr: (color, alpha, defaultColor) => {
        const c = tinycolor(color);
        return color && c.setAlpha(toNumber(alpha !== undefined ? alpha : c.getAlpha())).toRgbString() || defaultColor;
    }

};
module.exports = ColorUtils;
