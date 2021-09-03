import L from 'leaflet';
import 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';
import 'leaflet-rotatedmarker';
import throttle from 'lodash/throttle';
import isNil from 'lodash/isNil';
import { getNavigationArrowSVG, getNavigationCircleSVG } from '../LocateUtils';
import { getQueryParams } from '../URLUtils';

L.Control.MSLocate = L.Control.Locate.extend({
    setMap: function(map) {
        this._map = map;
        this._layer = this.options.layer || new L.LayerGroup();
        this._layer.addTo(map);
        this._event = undefined;
        this._prevBounds = null;
        // extend the follow marker style and circle from the normal style
        let tmp = {};
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
    _drawMarker: function() {
        let { accuracy: radius, latlng, heading, speed } = this._event || {};
        if (radius === undefined) {
            radius = 0;
        }
        const isFollowing = this._isFollowing();
        // circle with the radius of the location's accuracy
        if (this.options.drawCircle) {
            const style = isFollowing ? this.options.followCircleStyle : this.options.circleStyle;
            if (!this._circle) {
                this._circle = L.circle(latlng, radius, style).addTo(this._layer);
            } else {
                this._circle.setLatLng(latlng).setRadius(radius).setStyle(style);
            }
        }

        let distance; let unit;
        if (this.options.metric) {
            distance = radius.toFixed(0);
            unit =  this.options.strings.metersUnit;
        } else {
            distance = (radius * 3.2808399).toFixed(0);
            unit = this.options.strings.feetUnit;
        }

        // Inner marker
        if (this.options.drawMarker) {
            this._marker && this._map.removeLayer(this._marker);
            this.setFollowMarkerStyle(latlng, heading, speed);
        }
        const t = this.options?.strings?.popup;
        if (this.options.showPopup && t && this._marker) {
            this._marker
                .bindPopup(L.Util.template(t, {distance: distance, unit: unit}))
                ._popup.setLatLng(latlng);
        }


        // DEBUG
        let params = getQueryParams(window.location.search);
        if (params.locateDebug === "true") {
            let div = document.getElementById("LEAFLET_LOCATION_DEBUG");
            if (!div) {
                div = document.createElement("div");
                div.setAttribute('id', "LEAFLET_LOCATION_DEBUG");
                div.setAttribute('style', "position: absolute; bottom: 0; width: 100%; height: 200px; z-index:100000; background: rgba(5,5,5,.5)");
                document.body.appendChild(div);
            }
            div.innerHTML = `<pre>
                Position: ${latlng},
                Heading: ${heading}
                speed: ${speed}
            </pre>`;
        }
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
    },
    removeMarker: function() {
        if (this._marker) {
            this._map.removeLayer(this._marker);
        }
    },
    setFollowMarkerStyle: function(latlng, heading, speed) {
        const color = "#2A93EE";
        this.removeMarker();
        const style = {
            icon: L.divIcon({
                className: 'div-heading-icon',
                opacity: 1,
                iconSize: 70,
                fillOpacity: 1,
                // inline svg as leaflet doesn't allow to set icon color
                html: !isNil(heading) && speed > this.options.locateOptions.speedThreshold ? getNavigationArrowSVG({color, strokeWidth: 2}) : getNavigationCircleSVG({color, strokeWidth: 2})
            }),
            rotationOrigin: 'center center'
        };
        this._marker = L.marker(latlng, {
            ...style,
            rotationAngle: heading
        }).addTo(this._layer);
    }
});

export default L.Control.MSLocate;
