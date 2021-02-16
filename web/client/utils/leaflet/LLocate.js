import L from 'leaflet';
import 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';
import throttle from 'lodash/throttle';

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
    setLocateOptions: function(options) {
        this.options.locateOptions = {...options};
    },

    _activate: function() {
        if (!this._active) {
            this._map.locate(this.options.locateOptions);
            this._active = true;

            // bind event listeners
            this._map.on('locationfound', this.onLocationChange(), this);
            this._map.on('locationerror', this._onLocationError, this);
            this._map.on('dragstart', this._onDrag, this);
        }
    },
    onLocationChange: function() {
        return (this.options.locateOptions.rateControl) ?
            throttle(this._onLocationFound, this.options.locateOptions.rateControl)
            : this._onLocationFound;
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
        this.options.strings = { ...this.options.strings, ...newStrings };
    }
});

export default L.Control.MSLocate;
