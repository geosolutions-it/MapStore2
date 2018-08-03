var markerIcon = require('./img/marker-icon.png');
var markerShadow = require('./img/marker-shadow.png');
var ol = require('openlayers');

const assign = require('object-assign');
const {trim, isString} = require('lodash');

const {colorToRgbaStr} = require('../../../utils/ColorUtils');

const image = new ol.style.Circle({
  radius: 5,
  fill: null,
  stroke: new ol.style.Stroke({color: 'red', width: 1})
});

const Icons = require('../../../utils/openlayers/Icons');


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

const defaultStyles = {
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
    return defaultStyles[type](options && options.style && options.style[type] && {style: {...options.style[type]}} || options || {});
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

function getStyle(options) {
    let style = options.nativeStyle;
    const geomType = (options.style && options.style.type) || (options.features && options.features[0] ? options.features[0].geometry.type : undefined);
    if (!style && options.style) {
        style = {
            stroke: new ol.style.Stroke( options.style.stroke ? options.style.stroke : {
                color: options.style.color || 'blue',
                width: options.style.weight || 1,
                opacity: options.style.opacity || 1
            }),
            fill: new ol.style.Fill(options.style.fill ? options.style.fill : {
                color: options.style.fillColor || 'blue',
                opacity: options.style.fillOpacity || 1
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
        } else {
            style = new ol.style.Style(style);
        }
    }
    return (options.styleName && !options.overrideOLStyle) ? (feature) => {
        if (options.styleName === "marker") {
            const type = feature.getGeometry().getType();
            switch (type) {
                case "Point":
                case "MultiPoint":
                    return defaultStyles.marker(options);
                default:
                    break;
            }
        }
        return defaultStyles[options.styleName](options);
    } : style || styleFunction;
}
module.exports = {
    getStyle,
    getMarkerStyle,
    styleFunction
};
