const React = require('react');
const connect = require('react-redux').connect;
const LMap = require('../../../components/map/cesium/Map');
const LLayer = require('../../../components/map/cesium/Layer');

const SearchBar = require("../../../components/Search/SearchBar");
const NominatimResultList = require("../../../components/Search/geocoding/NominatimResultList");
const MousePosition = require("../../../components/mapcontrols/mouseposition/MousePosition");

const {changeMapView} = require('../../../actions/map');
const {changeMousePosition} = require('../../../actions/mousePosition');
const {textSearch, resultsPurge} = require("../../../actions/search");

const Localized = require('../../../components/I18N/Localized');

const Viewer = React.createClass({
    propTypes: {
        // redux store slice with map configuration (bound through connect to store at the end of the file)
        map: React.PropTypes.object,
        layers: React.PropTypes.array,
        // redux store dispatch func
        dispatch: React.PropTypes.func,
        textSearch: React.PropTypes.func,
        resultsPurge: React.PropTypes.func,
        changeMapView: React.PropTypes.func,
        changeMousePosition: React.PropTypes.func,
        mousePosition: React.PropTypes.object,
        messages: React.PropTypes.object,
        locale: React.PropTypes.string,
        localeError: React.PropTypes.string,
        searchResults: React.PropTypes.array,
        mapStateSource: React.PropTypes.string
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
        if (this.props.map && this.props.layers && this.props.messages) {
            return (
                <Localized messages={this.props.messages} locale={this.props.locale} loadingError={this.props.localeError}>
                    <div className="fill">
                        <LMap id="map" center={this.props.map.center} zoom={this.props.map.zoom}
                            onMapViewChanges={this.props.changeMapView} mapStateSource={this.props.mapStateSource}
                            onClick={this.props.changeMousePosition}>
                            {this.renderLayers(this.props.layers)}
                        </LMap>
                        <SearchBar key="seachBar" onSearch={this.props.textSearch} onSearchReset={this.props.resultsPurge} />
                        <NominatimResultList key="nominatimresults"
                            results={this.props.searchResults}
                            onItemClick={(this.props.changeMapView)}
                            afterItemClick={this.props.resultsPurge}
                            mapConfig={this.props.map}/>
                            <MousePosition
                                key="mousePosition"
                                enabled={true}
                                mousePosition={this.props.mousePosition}
                                crs="EPSG:4326"/>
                    </div>
                </Localized>
            );
        }
        return null;
    }
});


require('../../../components/map/cesium/plugins/index');

// connect Redux store slice with map configuration
module.exports = connect((state) => {
    return {
        map: state.map || state.mapConfig && state.mapConfig.map,
        mapStateSource: state.map && state.map.mapStateSource,
        layers: state.mapConfig && state.mapConfig.layers,
        messages: state.locale ? state.locale.messages : null,
        locale: state.locale ? state.locale.current : null,
        localeError: state.locale && state.locale.loadingError ? state.locale.loadingError : undefined,
        searchResults: state.searchResults,
        mousePosition: state.mousePosition && state.mousePosition.position ? {
            x: state.mousePosition.position.latlng.lng,
            y: state.mousePosition.position.latlng.lat,
            crs: "EPSG:4326"
        } : null
    };
}, {
    textSearch,
    resultsPurge,
    changeMapView,
    changeMousePosition
})(Viewer);
