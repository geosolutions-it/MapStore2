var React = require('react');
var connect = require('react-redux').connect;
var LMap = require('../../../components/leaflet/Map');
var LLayer = require('../../../components/leaflet/Layer');
var ConfigUtils = require('../../../utils/ConfigUtils');

var MyApp = React.createClass({
    propTypes: {
        // redux store slice with map configuration (bound through connect to store at the end of the file)
        mapConfig: React.PropTypes.object,
        // redux store dispatch func
        dispatch: React.PropTypes.func
    },
    renderLayers(layers) {
        if (layers) {
            return layers.map(function(layer) {
                return <LLayer type={layer.type} key={layer.name} options={layer} />;
            });
        }
        return null;
    },
    render() {
        // wait for loaded configuration before rendering
        if (this.props.mapConfig) {
            let config = this.props.mapConfig;
            let center = ConfigUtils.getCenter(config.center, config.projection);
            return (
                <LMap id="map" center={center} zoom={config.zoom}>
                     {this.renderLayers(config.layers)}
                </LMap>
            );
        }
        return null;
    }
});

// include support for OSM and WMS layers
require('../../../components/leaflet/plugins/OSMLayer');
require('../../../components/leaflet/plugins/WMSLayer');

// connect Redux store slice with map configuration
module.exports = connect((state) => {
    return {
        mapConfig: state.mapConfig
    };
})(MyApp);
