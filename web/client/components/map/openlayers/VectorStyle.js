var markerIcon = require('./img/marker-icon.png');
var markerShadow = require('./img/marker-shadow.png');
var ol = require('openlayers');
// const {reprojectGeoJson} = require('../../../utils/CoordinatesUtils');

const assign = require('object-assign');
const {trim, isString} = require('lodash');

const {colorToRgbaStr} = require('../../../utils/ColorUtils');

const image = new ol.style.Circle({
  radius: 5,
  fill: null,
  stroke: new ol.style.Stroke({color: 'red', width: 1})
});

const Icons = require('../../../utils/openlayers/Icons');

const STYLE_POINT = {
    color: '#ffcc33',
    opacity: 1,
    weight: 3,
    fillColor: '#ffffff',
    fillOpacity: 0.2,
    radius: 10
};
const STYLE_CIRCLE = STYLE_POINT;

const STYLE_TEXT = {
    fontStyle: 'normal',
    fontSize: '14',
    fontSizeUom: 'px',
    fontFamily: 'FontAwesome',
    fontWeight: 'normal',
    font: "14px FontAwesome",
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
const defaultStyles = {
    "Text": STYLE_TEXT,
    "Circle": STYLE_CIRCLE,
    "Point": STYLE_POINT,
    "MultiPoint": STYLE_POINT,
    "LineString": STYLE_LINE,
    "MultiLineString": STYLE_LINE,
    "Polygon": STYLE_POLYGON,
    "MultiPolygon": STYLE_POLYGON
};

const strokeStyle = (options, defaultsStyle = {color: 'blue', width: 3, lineDash: [4]}) => ({
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
        strokeStyle(options, {color: 'green', width: 1})
    ))],
    'MultiLineString': options => [new ol.style.Style(assign({},
        strokeStyle(options, {color: 'green', width: 1})
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
    'GeometryCollection': () => [new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'magenta',
        width: 2
      }),
      fill: new ol.style.Fill({
        color: 'magenta'
      }),
      image: new ol.style.Circle({
        radius: 10,
        fill: null,
        stroke: new ol.style.Stroke({
          color: 'magenta'
        })
      })
    })],
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
/*const styleFunction = function(feature, options) {
    const type = feature.getGeometry().getType();
    return defaultStyles[type](options && options.style && options.style[type] && {style: {...options.style[type]}} || options || {});*/
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

const getValidStyle = (geomType, options = { style: defaultStyles}, isDrawing, textValues, fallbackStyle ) => {
    let style;
    let tempStyle = options.style[geomType] || options.style;
    if (geomType === "MultiLineString" || geomType === "LineString") {
        style = tempStyle ? {
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
                }) };
        return new ol.style.Style(style);
    }

    if ((geomType === "MultiPoint" || geomType === "Point") && (tempStyle.iconUrl || tempStyle.iconGlyph) ) {
        return isDrawing ? new ol.style.Style({
            image: image
        }) : getMarkerStyle({style: {...tempStyle, highlight: options.style.highlight}});

    }
    if ((geomType === "Circle") && tempStyle.radius ) {
        return new ol.style.Style({
            stroke: new ol.style.Stroke( tempStyle && tempStyle.stroke ? tempStyle.stroke : {
                color: colorToRgbaStr(options.style && tempStyle.color || "#0000FF", tempStyle.opacity || 1),
                lineDash: options.style.highlight ? [10] : [0],
                width: tempStyle.weight || 1
            }),
            fill: new ol.style.Fill(tempStyle.fill ? tempStyle.fill : {
                color: colorToRgbaStr(options.style && tempStyle.fillColor || "#0000FF", tempStyle.fillOpacity || 0.2)
            }),
            image: new ol.style.Circle({
                radius: tempStyle.radius || 10,
                fill: new ol.style.Fill(tempStyle.fill ? tempStyle.fill : {
                    color: colorToRgbaStr(options.style && tempStyle.fillColor || "#0000FF", tempStyle.fillOpacity || 0.2)
                }),
                stroke: new ol.style.Stroke({
                  color: colorToRgbaStr(options.style && tempStyle.color || "#0000FF", tempStyle.opacity || 1),
                  lineDash: options.style.highlight ? [10] : [0],
                  width: tempStyle.weight || 1
                })
            })
        });
    }
    if (geomType === "Text" && tempStyle.font) {
        return isDrawing ? new ol.style.Style({
            image: image
        }) : new ol.style.Style({
            text: new ol.style.Text({
                textAlign: tempStyle.textAlign || "center",
                text: textValues[0] || "",
                font: tempStyle.font,
                fill: new ol.style.Fill({
                    color: colorToRgbaStr(tempStyle.stroke || tempStyle.color || '#000000', tempStyle.opacity || 1)
                }),
                stroke: options.style.highlight ? new ol.style.Stroke({
                    color: colorToRgbaStr(tempStyle.stroke || tempStyle.color || '#000000', tempStyle.opacity || 1),
                    width: 1
                }) : null
            })
        });
    }
    if (geomType === "MultiPolygon" || geomType === "Polygon") {
        style = {
            stroke: new ol.style.Stroke( tempStyle.stroke ? tempStyle.stroke : {
                color: colorToRgbaStr(options.style && tempStyle.color || "#0000FF", tempStyle.opacity || 1),
                lineDash: options.style.highlight ? [10] : [0],
                width: tempStyle.weight || 1
            }),
            image: isDrawing ? image : null,
            fill: new ol.style.Fill(tempStyle.fill ? tempStyle.fill : {
                color: colorToRgbaStr(options.style && tempStyle.fillColor || "#0000FF", tempStyle.fillOpacity || 1)
            })
        };
        return new ol.style.Style(style);
    }
    return fallbackStyle;
};

function getStyle(options, isDrawing = false, textValues = []) {

    let style = options.nativeStyle;
    const geomType = (options.style && options.style.type) || (options.features && options.features[0] ? options.features[0].geometry.type : undefined);
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
                const type = feature.getGeometry().getType();
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
                let type = feature.getGeometry().getType();
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
                        gStyle.setGeometry(c);
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
        return getValidStyle(geomType, options, isDrawing, textValues, style);
    }
    // *************************************************************************

    return (options.styleName && !options.overrideOLStyle) ? (feature) => {
        if (options.styleName === "marker") {
            const type = feature.getGeometry().getType();
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
    getStyle,
    getMarkerStyle,
    styleFunction,
    defaultStyles
};
