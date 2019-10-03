import PropTypes from 'prop-types';
import React from 'react';
import OlLocate from '../../../utils/openlayers/OlLocate';

const defaultOpt = {
    follow: true, // follow with zoom and pan the user's location
    remainActive: true,
    metric: true,
    stopFollowingOnDrag: true,
    keepCurrentZoomLevel: false,
    locateOptions: {
        maximumAge: 2000,
        enableHighAccuracy: false,
        timeout: 10000,
        maxZoom: 18
    }
};

export default class Locate extends React.Component {
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
        if (this.props.map) {
            this.locate = new OlLocate(this.props.map, defaultOpt);
            this.locate.setStrings(this.props.messages);
            this.locate.options.onLocationError = this.onLocationError;
            this.locate.on("propertychange", (e) => {this.onStateChange(e.target.get(e.key)); });
            this.configureLocate(this.props.status);
        }
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.status !== this.props.status) {
            this.configureLocate(newProps.status);
        }
        if (newProps.messages !== this.props.messages) {
            this.locate.setStrings(newProps.messages);
        }
    }

    onStateChange = (state) => {
        if (this.props.status !== state) {
            this.props.changeLocateState(state);
        }
    };

    onLocationError = (err) => {
        this.props.onLocateError(err.message);
        this.props.changeLocateState("DISABLED");
    };

    render() {
        return null;
    }

    configureLocate = (newStatus) => {
        let state = this.locate.get("state");
        if ( newStatus === "ENABLED" && state === "DISABLED") {
            this.locate.start();
        } else if (newStatus === "FOLLOWING" && state === "ENABLED") {
            this.locate.startFollow();
        } else if (newStatus === "DISABLED") {
            this.locate.stop();
        }
    };
}

