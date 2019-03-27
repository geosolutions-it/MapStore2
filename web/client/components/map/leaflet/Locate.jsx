var PropTypes = require('prop-types');
var React = require('react');
var L = require('leaflet');
var assign = require('object-assign');
require('leaflet.locatecontrol');
require('leaflet.locatecontrol/dist/L.Control.Locate.css');

const defaultOpt = { // For all configuration options refer to https://github.com/Norkart/Leaflet-MiniMap
    follow: true,  // follow with zoom and pan the user's location
    remainActive: true,
    stopFollowingOnDrag: true,
    locateOptions: {
        maximumAge: 2000,
        enableHighAccuracy: false,
        timeout: 10000,
        maxZoom: Infinity,
        watch: true  // if you overwrite this, visualization cannot be updated
    }
};

L.Control.MSLocate = L.Control.Locate.extend({
    setMap: function(map) {
        this._map = map;
        this._layer = this.options.layer || new L.LayerGroup();
        this._layer.addTo(map);
        this._event = undefined;
        this._prevBounds = null;

        // extend the follow marker style and circle from the normal style
        let tmp = {};
        L.extend(tmp, this.options.markerStyle, this.options.followMarkerStyle);
        this.options.followMarkerStyle = tmp;
        tmp = {};
        L.extend(tmp, this.options.circleStyle, this.options.followCircleStyle);
        this.options.followCircleStyle = tmp;
        this._resetVariables();
        this._map.on('unload', this._unload, this);
    },
    _setClasses: function(state) {
        this._map.fire('locatestatus', {state: state});
        return state;
    },
    _updateContainerStyle: function() {
        if (this._isFollowing()) {
            this._setClasses('following');
        } else if (this._active) {
            this._setClasses('active');
        }
    },
    _cleanClasses: function() {
        return null;
    },
    setStrings: function(newStrings) {
        this.options.strings = assign({}, this.options.strings, newStrings);
    }
});

class Locate extends React.Component {
    static displayName = 'Locate';

    static propTypes = {
        map: PropTypes.object,
        status: PropTypes.string,
        messages: PropTypes.object,
        changeLocateState: PropTypes.func,
        onLocateError: PropTypes.func
    };

    static defaultProps = {
        id: 'overview',
        status: "DISABLED",
        changeLocateState: () => {},
        onLocateError: () => {}
    };

    componentDidMount() {
        if (this.props.map ) {
            this.locate = new L.Control.MSLocate(defaultOpt);
            this.locate.setMap(this.props.map);
            this.props.map.on('locatestatus', this.locateControlState);
            this.locate.options.onLocationError = this.onLocationError;
            this.locate.options.onLocationOutsideMapBounds = this.onLocationError;
        }
        if (this.props.status.enabled) {
            this.locate.start();
        }
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        this.fol = false;
        if (newProps.status !== this.props.status) {
            if ( newProps.status === "ENABLED" && !this.locate._active) {
                this.locate.start();
            } else if (newProps.status === "FOLLOWING" && this.locate._active && !this.locate._following) {
                this.fol = true;
                this.locate.stop();
                this.locate.start();
            } else if ( newProps.status === "DISABLED") {
                this.locate._following = false;
                this.locate.stop();
            }
        }
        if (newProps.messages !== this.props.messages) {
            this.locate.setStrings(newProps.messages);
            if (newProps.status !== "DISABLED") {
                this.locate.drawMarker(this.locate._map);
            }
        }
    }

    onLocationError = (err) => {
        this.props.onLocateError(err.message);
        this.props.changeLocateState("DISABLED");
    };

    render() {
        return null;
    }

    locateControlState = (state) => {
        if (state.state === 'requesting' && this.props.status !== "LOCATING" ) {
            this.props.changeLocateState("LOCATING");
        } else if (state.state === 'following' && !this.fol ) {
            this.props.changeLocateState("FOLLOWING");
        } else if (state.state === 'active' && this.props.status !== "ENABLED" ) {
            this.props.changeLocateState("ENABLED");
        }
    };
}

module.exports = Locate;
