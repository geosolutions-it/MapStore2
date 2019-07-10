var markerIcon = require('./img/marker-icon.png');
var markerShadow = require('./img/marker-shadow.png');
var ol = require('openlayers');
const {last, head} = require('lodash');
const blue = [0, 153, 255, 1];
const assign = require('object-assign');
const {trim, isString, isArray} = require('lodash');
const {colorToRgbaStr} = require('../../../utils/ColorUtils');
const {set} = require('../../../utils/ImmutableUtils');
const selectedStyleConfiguration = {
    white: [255, 255, 255, 1],
    blue: [0, 153, 255, 1],
    width: 3
};

const image = new ol.style.Circle({
  radius: 5,
  fill: null,
  stroke: new ol.style.Stroke({color: 'red', width: 1})
});

/**
 * it creates a custom style for the first point of a polyline
 * @param {object} options possible configuration of start point
 * @param {number} options.radius radius of the circle
 * @param {string} options.fillColor ol color for the circle fill style
 * @param {boolean} options.applyToPolygon tells if this style can be applied to a polygon
 * @return {ol.style.Style} style of the point
*/
const firstPointOfPolylineStyle = ({radius = 5, fillColor = 'green', applyToPolygon = false} = {}) => new ol.style.Style({
    image: new ol.style.Circle({
        radius,
        fill: new ol.style.Fill({
            color: fillColor
        })
    }),
    geometry: function(feature) {
        const geom = feature.getGeometry();
        const type = geom.getType();
        if (!applyToPolygon && type === "Polygon") {
            return null;
        }
        let coordinates = type === "Polygon" ? geom.getCoordinates()[0] : geom.getCoordinates();
        return coordinates.length > 1 ? new ol.geom.Point(head(coordinates)) : null;
    }
});

/**
 * it creates a custom style for the last point of a polyline
 * @param {object} options possible configuration of start point
 * @param {number} options.radius radius of the circle
 * @param {string} options.fillColor ol color for the circle fill style
 * @param {boolean} options.applyToPolygon tells if this style can be applied to a polygon
 * @return {ol.style.Style} style of the point
*/
const lastPointOfPolylineStyle = ({radius = 5, fillColor = 'red', applyToPolygon = false} = {}) => new ol.style.Style({
    image: new ol.style.Circle({
        radius,
        fill: new ol.style.Fill({
            color: fillColor
        })
    }),
    geometry: function(feature) {
        const geom = feature.getGeometry();
        const type = geom.getType();
        if (!applyToPolygon && type === "Polygon") {
            return null;
        }
        let coordinates = type === "Polygon" ? geom.getCoordinates()[0] : geom.getCoordinates();
        return new ol.geom.Point(coordinates.length > 3 ? coordinates[coordinates.length - (type === "Polygon" ? 2 : 1)] : last(coordinates));
    }
});

/**
    creates styles to highlight/customize start and end point of a polyline
*/
const startEndPolylineStyle = (startPointOptions = {}, endPointOptions = {}) => {
    return [firstPointOfPolylineStyle(startPointOptions), lastPointOfPolylineStyle(endPointOptions)];
};

const getTextStyle = (tempStyle, valueText, highlight = false) => {

    return new ol.style.Style({
        text: new ol.style.Text({
            offsetY: -( 4 * Math.sqrt(tempStyle.fontSize)), // TODO improve this for high font values > 100px
            textAlign: tempStyle.textAlign || "center",
            text: valueText || "",
            font: tempStyle.font,
            fill: new ol.style.Fill({
                // WRONG, SETTING A FILL STYLE WITH A COLOR (STROKE) ATTRIBUTE
                color: colorToRgbaStr(tempStyle.stroke || tempStyle.color || '#000000', tempStyle.opacity || 1)
            }),
            // halo
            stroke: highlight ? new ol.style.Stroke({
                color: [255, 255, 255, 1],
                width: 2
            }) : null
        }),
        image: highlight ?
            new ol.style.Circle({
                radius: 5,
                fill: null,
                stroke: new ol.style.Stroke({
                    color: colorToRgbaStr(tempStyle.color || "#0000FF", tempStyle.opacity || 1),
                    width: tempStyle.weight || 1
                })
            }) : null
    });
};

const Icons = require('../../../utils/openlayers/Icons');

const STYLE_POINT = {
    color: '#ffcc33',
    opacity: 1,
    weight: 3,
    fillColor: '#ffffff',
    fillOpacity: 0.2,
    radius: 10
};
const STYLE_CIRCLE = {
    color: '#ffcc33',
    opacity: 1,
    weight: 3,
    fillColor: '#ffffff',
    fillOpacity: 0.2
};
const STYLE_TEXT = {
    fontStyle: 'normal',
    fontSize: '14',
    fontSizeUom: 'px',
    fontFamily: 'Arial',
    fontWeight: 'normal',
    font: "14px Arial",
    textAlign: 'center',
    color: '#000000',
    opacity: 1
};
const STYLE_LINE = {
    color: '#ffcc33',
    opacity: 1,
    weight: 3,
    fillColor: '#ffffff',
    fillOpacity: 0.2,
    editing: {
        fill: 1
    }
};
const STYLE_POLYGON = {
    color: '#ffcc33',
    opacity: 1,
    weight: 3,
    fillColor: '#ffffff',
    fillOpacity: 0.2,
    editing: {
        fill: 1
    }
};
const STYLE_MARKER = {
    iconColor: "orange",
    iconShape: "circle",
    iconGlyph: "comment"
};

const defaultStyles = {
    "Marker": STYLE_MARKER,
    "Text": STYLE_TEXT,
    "Circle": STYLE_CIRCLE,
    "Point": STYLE_POINT,
    "MultiPoint": STYLE_POINT,
    "LineString": STYLE_LINE,
    "MultiLineString": STYLE_LINE,
    "Polygon": STYLE_POLYGON,
    "MultiPolygon": STYLE_POLYGON
};

const strokeStyle = (options, defaultsStyle = {color: 'blue', width: 3, lineDash: [6]}) => ({
    stroke: new ol.style.Stroke(
        options.style ?
        options.style.stroke || {
            color: options.style.color || defaultsStyle.color,
            lineDash: isString(options.style.dashArray) && trim(options.style.dashArray).split(' ') || defaultsStyle.lineDash,
            width: options.style.weight || defaultsStyle.width,
            lineCap: options.style.lineCap || 'round',
            lineJoin: options.style.lineJoin || 'round',
            lineDashOffset: options.style.dashOffset || 0
        }
        :
        {...defaultsStyle}
    )
});

const fillStyle = (options, defaultsStyle = {color: 'rgba(0, 0, 255, 0.1)'}) => ({
    fill: new ol.style.Fill(
        options.style ?
        options.style.fill || {
            color: colorToRgbaStr(options.style.fillColor, options.style.fillOpacity) || defaultsStyle.color
        }
        :
        {...defaultsStyle}
    )
});

const defaultOLStyles = {
    'Point': () => [new ol.style.Style({
        image: image
    })],
    'LineString': options => [new ol.style.Style(assign({},
        strokeStyle(options, {color: 'blue', width: 3})
    ))],
    'MultiLineString': options => [new ol.style.Style(assign({},
        strokeStyle(options, {color: 'blue', width: 3})
    ))],
    'MultiPoint': () => [new ol.style.Style({
        image: image
    })],
    'MultiPolygon': options => [new ol.style.Style(assign({},
        strokeStyle(options),
        fillStyle(options)
    ))],
    'Polygon': options => [new ol.style.Style(assign({},
        strokeStyle(options),
        fillStyle(options)
    ))],
    'GeometryCollection': options => [new ol.style.Style(assign({},
        strokeStyle(options),
        fillStyle(options),
      {image: new ol.style.Circle({
        radius: 10,
        fill: null,
        stroke: new ol.style.Stroke({
          color: 'magenta'
        })
      })
    }))],
  'Circle': () => [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'red',
      width: 2
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255,0,0,0.2)'
    })
})],
  'marker': (options) => [new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [14, 41],
      anchorXUnits: 'pixels',
      anchorYUnits: 'pixels',
      src: markerShadow
    })
}), new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: markerIcon
    }),
    text: new ol.style.Text({
        text: options.label,
        scale: 1.25,
    offsetY: 8,
        fill: new ol.style.Fill({color: '#000000'}),
        stroke: new ol.style.Stroke({color: '#FFFFFF', width: 2})
    })
    })]
};

const styleFunction = function(feature, options) {
    const type = feature.getGeometry().getType();
    return defaultOLStyles[type](options && options.style && options.style[type] && {style: {...options.style[type]}} || options || {});
};

function getMarkerStyle(options) {
    if (options.style.iconUrl) {
        return Icons.standard.getIcon(options);
    }
    const iconLibrary = options.style.iconLibrary || 'extra';
    if (Icons[iconLibrary]) {
        return Icons[iconLibrary].getIcon(options);
    }
    return null;
}


/**
 * TODO DOCUMENT This
 *
*/
const getValidStyle = (geomType, options = { style: defaultStyles}, isDrawing, textValues, fallbackStyle, radius = 0 ) => {
    let tempStyle = options.style[geomType] || options.style;
    if (geomType === "MultiLineString" || geomType === "LineString") {
        let styles = [
            new ol.style.Style({
                stroke: options.style.useSelectedStyle ? new ol.style.Stroke({
                    color: [255, 255, 255, 1],
                    width: tempStyle.weight + 2
                }) : null
            }),
            new ol.style.Style(tempStyle ? {
                stroke: new ol.style.Stroke( tempStyle && tempStyle.stroke ? tempStyle.stroke : {
                    color: colorToRgbaStr(options.style && tempStyle.color || "#0000FF", tempStyle.opacity || 1),
                    lineDash: options.style.highlight ? [10] : [0],
                    width: tempStyle.weight || 1
                }),
                image: isDrawing ? image : null
            } : {
                stroke: new ol.style.Stroke(defaultStyles[geomType] && defaultStyles[geomType].stroke ? defaultStyles[geomType].stroke : {
                    color: colorToRgbaStr(options.style && defaultStyles[geomType].color || "#0000FF", defaultStyles[geomType].opacity || 1),
                    lineDash: options.style.highlight ? [10] : [0],
                    width: defaultStyles[geomType].weight || 1
                })
            })
        ];
        let startEndPointStyles = options.style.useSelectedStyle ? startEndPolylineStyle({radius: tempStyle.weight, applyToPolygon: true}, {radius: tempStyle.weight, applyToPolygon: true}) : [];
        return [ ...startEndPointStyles, ...styles];
    }

    if ((geomType === "MultiPoint" || geomType === "Point") && (tempStyle.iconUrl || tempStyle.iconGlyph) ) {
        return isDrawing ? new ol.style.Style({
            image: image
        }) : getMarkerStyle({style: {...tempStyle, highlight: options.style.highlight || options.style.useSelectedStyle}});

    }
    if (geomType === "Circle" && radius ) {
        let styles = [
            new ol.style.Style({
                    stroke: options.style.useSelectedStyle ? new ol.style.Stroke({
                        color: [255, 255, 255, 1],
                        width: tempStyle.weight + 4
                }) : null
            }),
            new ol.style.Style({
                stroke: new ol.style.Stroke( tempStyle && tempStyle.stroke ? tempStyle.stroke : {
                    color: options.style.useSelectedStyle ? blue : colorToRgbaStr(options.style && tempStyle.color || "#0000FF", tempStyle.opacity || 1),
                    lineDash: options.style.highlight ? [10] : [0],
                    width: tempStyle.weight || 1
                }),
                fill: new ol.style.Fill(tempStyle.fill ? tempStyle.fill : {
                    color: colorToRgbaStr(options.style && tempStyle.fillColor || "#0000FF", tempStyle.fillOpacity || 0.2)
                })
            }), new ol.style.Style({
                image: options.style.useSelectedStyle ? new ol.style.Circle({
                    radius: 3,
                    fill: new ol.style.Fill(tempStyle.fill ? tempStyle.fill : {
                        color: blue
                    })
              }) : null,
              geometry: function(feature) {
                  const geom = feature.getGeometry();
                  const type = geom.getType();
                  if (type === "Circle") {
                      let coordinates = geom.getCenter();
                      return new ol.geom.Point(coordinates);
                  }
                  return null;
              }
          })];
        return styles;
    }
    if (geomType === "Text" && tempStyle.font) {
        return [getTextStyle(tempStyle, textValues[0], options.style.useSelectedStyle || options.style.highlight)];
    }
    if (geomType === "MultiPolygon" || geomType === "Polygon") {
        let styles = [
            new ol.style.Style({
                stroke: options.style.useSelectedStyle ? new ol.style.Stroke({
                    color: [255, 255, 255, 1],
                    width: tempStyle.weight + 2
                }) : null
            }),
            new ol.style.Style({
                stroke: new ol.style.Stroke( tempStyle.stroke ? tempStyle.stroke : {
                    color: options.style.useSelectedStyle ? blue : colorToRgbaStr(options.style && tempStyle.color || "#0000FF", tempStyle.opacity || 1),
                    lineDash: options.style.highlight ? [10] : [0],
                    width: tempStyle.weight || 1
                }),
                image: isDrawing ? image : null,
                fill: new ol.style.Fill(tempStyle.fill ? tempStyle.fill : {
                    color: colorToRgbaStr(options.style && tempStyle.fillColor || "#0000FF", tempStyle.fillOpacity || 1)
                })
            })
        ];
        let startEndPointStyles = options.style.useSelectedStyle ? startEndPolylineStyle({radius: tempStyle.weight, applyToPolygon: true}, {radius: tempStyle.weight, applyToPolygon: true}) : [];
        return [...styles, ...startEndPointStyles];
    }
    return fallbackStyle;
};

function getStyle(options, isDrawing = false, textValues = []) {

    // this is causing max call stack size exceeded because it contains ol functions and it comes from the store
    // we suggest to remove this behaviour
    let style = options.nativeStyle;
    let type;
    let textStrings = textValues;
    let radius = 0;
    let geomType = (options.style && options.style.type) || (options.features && options.features[0] && options.features[0].geometry ? options.features[0].geometry.type : undefined);
    if (geomType === "FeatureCollection" || options.features && options.features[0] && options.features[0].type === "FeatureCollection") {
        return function(f) {
            var feature = this || f;
            type = feature.getGeometry() && feature.getGeometry().getType();
            const properties = feature && feature.getProperties();
            if (properties && properties.isCircle ) {
                type = "Circle";
                radius = properties.radius;
            }
            if (properties && properties.isText ) {
                type = "Text";
                textStrings = [properties.valueText];
            }
            const optionsChanged = set("style.useSelectedStyle", properties.canEdit, options);
            return getValidStyle(type, optionsChanged, isDrawing, textStrings, null, radius);
        };
    }
    if (options && options.properties && options.properties.isText) {
        type = "Text";
        textStrings = [options.properties.valueText];
        return getValidStyle(type, options, isDrawing, textStrings, null, radius);
    }
    if (options && options.properties && options.properties.isCircle ) {
        type = "Circle";
        radius = options.properties.radius;
        return getValidStyle(type, options, isDrawing, textStrings, null, radius);
    }
    if (!style && options.style) {
        style = {
            stroke: new ol.style.Stroke( options.style.stroke ? options.style.stroke : {
                color: colorToRgbaStr(options.style && options.style.color || "#0000FF", options.style.opacity || 1),
                lineDash: options.style.highlight ? [10] : [0],
                width: options.style.weight || 1
            }),
            fill: new ol.style.Fill(options.style.fill ? options.style.fill : {
                color: colorToRgbaStr(options.style && options.style.fillColor || "#0000FF", options.style.fillOpacity || 1)
            })
        };

        if (geomType === "Point") {
            style = {
                image: new ol.style.Circle(assign({}, style, {radius: options.style.radius || 5}))
            };
        }
        if (options.style.iconUrl || options.style.iconGlyph) {
            const markerStyle = getMarkerStyle(options);

            style = function(f) {
                var feature = this || f;
                type = feature.getGeometry().getType();
                switch (type) {
                    case "Point":
                    case "MultiPoint":
                        return markerStyle;
                    default:
                        return styleFunction(feature, options);
                }
            };
            return style;
        }
        style = new ol.style.Style(style);


        /* managing new style structure
        ************************************************************************
        */
        if (geomType === "GeometryCollection") {
            style = function(f) {
                var feature = this || f;
                let markerStyles;
                type = feature.getGeometry().getType();
                let textIndexes = feature.get("textGeometriesIndexes") || [];
                let circles = feature.get("circles") || [];
                let textValue = feature.get("textValues");// || [""];
                if (feature.getGeometry().getType() === "GeometryCollection") {
                    let geometries = feature.getGeometry().getGeometries();
                    let styles = geometries.reduce((p, c, i) => {
                        type = c.getType();
                        if ((type === "Point" || type === "MultiPoint") && textIndexes.length && textIndexes.indexOf(i) !== -1) {
                            let gStyle = getValidStyle("Text", options, isDrawing, [textValue[textIndexes.indexOf(i)]]);
                            gStyle.setGeometry(c);
                            return p.concat([gStyle]);
                        }
                        if (type === "Polygon" && circles.length && circles.indexOf(i) !== -1) {
                            let gStyle = getValidStyle("Circle", options, isDrawing, []);
                            gStyle.setGeometry(c);
                            return p.concat([gStyle]);
                        }
                        if (type === "Point" || type === "MultiPoint") {
                            markerStyles = getMarkerStyle({style: {...options.style[type], highlight: options.style.highlight}});
                            return p.concat(markerStyles.map(m => {
                                m.setGeometry(c);
                                return m;
                            }));
                        }
                        let gStyle = getValidStyle(type, options, isDrawing, textValues);
                        if (isArray(gStyle)) {
                            gStyle.forEach(s => s.setGeometry(c));
                        } else {
                            gStyle.setGeometry(c);
                        }
                        return p.concat([gStyle]);
                    }, []);
                    return styles;
                }
                if (type === "Point" || type === "MultiPoint") {
                    markerStyles = getMarkerStyle({style: {...options.style[type], highlight: options.style.highlight}});
                    return isDrawing ? new ol.style.Style({
                        image: image,
                        geometry: feature.getGeometry()
                    }) : markerStyles.map(m => {
                        m.setGeometry(feature.getGeometry());
                        return m;
                    });
                }
                return getValidStyle(type, options, isDrawing, textValues);
            };
            return style;
        }
        if (geomType === "Circle") {
            radius = options.features && options.features.length && options.features[0].properties && options.features[0].properties.radius || 10;
        }

        return getValidStyle(geomType, options, isDrawing, textValues, style, radius);
    }
    // *************************************************************************

    return (options.styleName && !options.overrideOLStyle) ? (feature) => {
        if (options.styleName === "marker") {
            type = feature.getGeometry().getType();
            switch (type) {
                case "Point":
                case "MultiPoint":
                    return defaultOLStyles.marker(options);
                default:
                    break;
            }
        }
        return defaultOLStyles[options.styleName](options);
    } : style || styleFunction;
}


module.exports = {
    startEndPolylineStyle,
    lastPointOfPolylineStyle,
    firstPointOfPolylineStyle,
    selectedStyleConfiguration,
    getStyle,
    getMarkerStyle,
    styleFunction,
    defaultStyles
};
