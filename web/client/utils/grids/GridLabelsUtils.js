import isFunction from "lodash/isFunction";

/**
 * Returns the modulo of a / b, depending on the sign of b.
 *
 * @param {number} a Dividend.
 * @param {number} b Divisor.
 * @return {number} Modulo.
 */
function modulo(a, b) {
    var r = a % b;
    return r * b < 0 ? r + b : r;
}

/**
 * @param {number} number Number to be formatted
 * @param {number} width The desired width
 * @param {number=} optPrecision Precision of the output string (i.e. number of decimal places)
 * @returns {string} Formatted string
 */
function padNumber(number, width, optPrecision) {
    var numberString = optPrecision !== undefined ? number.toFixed(optPrecision) : '' + number;
    var decimal = numberString.indexOf('.');
    decimal = decimal === -1 ? numberString.length : decimal;
    return decimal > width ? numberString : new Array(1 + width - decimal).join('0') + numberString;
}

/**
 * @param {string} hemispheres Hemispheres.
 * @param {number} degrees Degrees.
 * @param {number=} optFractionDigits The number of digits to include
 *    after the decimal point. Default is `0`.
 * @return {string} String.
 */
const degreesToStringHDMS = (hemispheres) => (degrees) => {
    var normalizedDegrees = modulo(degrees + 180, 360) - 180;
    var x = Math.abs(3600 * normalizedDegrees);

    var deg = Math.floor(x / 3600);
    var min = Math.floor((x - deg * 3600) / 60);
    var sec = x - (deg * 3600) - (min * 60);
    sec = Math.ceil(sec);

    if (sec >= 60) {
        sec = 0;
        min += 1;
    }

    if (min >= 60) {
        min = 0;
        deg += 1;
    }

    return deg + '\u00b0 ' + padNumber(min, 2) + '\u2032 ' +
      padNumber(sec, 2, 0) + '\u2033' +
      (normalizedDegrees === 0 ? '' : ' ' + hemispheres.charAt(normalizedDegrees < 0 ? 1 : 0));
};


const formatters = {
    standard: (axis) => (projection) =>
        projection === "EPSG:4326" ?
            degreesToStringHDMS(axis === "x" ? "EW" : "NS") :
            (value) => String(Math.round(value))
};

/**
 * Registers a label formatter function, under a name.
 * Can be retrieved with getFormatter.
 *
 * @param {string} name unique name of the formatter
 * @param {*} formatter formatter function, in the form (axis) => (projection) => (value) => <formatted value>
 *
 * @example
 *
 * registerFormatter("utm", (axis) => (projection) => {
 *  const projDef = proj4.defs(projection);
 *  if (projDef.projName === "utm") {
 *      return (v, options) => {
 *          const direction = axis === "x" ? (Math.sign(v) >= 0 ? "E" : "W") : (Math.sign(v) >= 0 ? "N" : "S");
 *          if (options.index === 0) {
 *              return `${Math.round(v)}${direction}`;
 *          }
 *          return `${Math.round(v)}`;
 *      };
 *  }
 *   return getFormatter(projection, axis);
 * });
 */
export function registerFormatter(name, formatter) {
    formatters[name] = formatter;
}

/**
 * Returns a label formatter function, for the specified combination of axis and projection.
 *
 * @param {string} projection projection used for labels
 * @param {string} axis x or y
 * @param {string/function} formatter optional formatter name or external formatter function. If not
 * defined, the standard formatter will be returned.
 * @returns a suitable label formatter
 */
export function getFormatter(projection, axis, formatter) {
    if (isFunction(formatter)) return formatter(projection, axis);
    return formatters[formatter || "standard"](axis)(projection);
}

/**
 * Returns an x label formatter function, for the specified projection.
 * @param {string} projection projection used for labels
 * @param {string/function} formatter optional formatter name or external formatter function. If not
 * defined, the standard formatter will be returned.
 * @returns a suitable label formatter
 */
export function getXLabelFormatter(projection, formatter) {
    return getFormatter(projection, "x", formatter);
}

/**
 * Returns an y label formatter function, for the specified projection.
 * @param {string} projection projection used for labels
 * @param {string/function} formatter optional formatter name or external formatter function. If not
 * defined, the standard formatter will be returned.
 * @returns a suitable label formatter
 */
export function getYLabelFormatter(projection, formatter) {
    return getFormatter(projection, "y", formatter);
}
