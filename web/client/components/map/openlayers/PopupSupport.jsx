import React from 'react';
import PropTypes from 'prop-types';
import { Overlay } from 'ol';
import {isEqual} from 'lodash';

export default class PopupSupport extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        popups: PropTypes.arrayOf(PropTypes.object)
    }

    static defaultProps = {
        popups: []
    }

    state = {
        overlay: null
    }

    componentDidMount() {
        const { popups, map } = this.props;
        this.preparePopups(popups, map);
    }

    componentDidUpdate(prevProps) {
        const prevPopups = prevProps.popups.map(({id, position}) => ({id, position}));
        const newPopups = this.props.popups.map(({id, position}) => ({id, position}));
        if (!isEqual(prevPopups, newPopups)) {
            const { popups, map } = this.props;
            this.rerenderPopups(popups, map);
        }
    }

    renderPopups() {
        const { popups } = this.props;
        return popups.map(({ id, content: PopupContent }) => {
            if (!PopupContent) {
                this.popupWrapperRefs[id] = document.getElementById(id);
                return null;
            }

            return (
                <div className="ol-popup" ref={(ref) => { this.popupWrapperRefs[id] = ref; return true; }} key={id}>
                    <PopupContent {...this.props}/>
                </div>
            );
        });
    }

    render() {
        return <div className="popup-wrapper">{this.renderPopups()}</div>;
    }

    popupWrapperRefs = {};

    preparePopups = (popups, map) => {
        popups.map(({ id, position: { coordinates } }) => {
            const element = this.popupWrapperRefs[id];
            const overlay = new Overlay({
                element,
                autoPan: true,
                autoPanAnimation: {
                    duration: 200
                },
                positioning: "center-center"
            });

            map.addOverlay(overlay);
            overlay.setPosition(coordinates);
            this.setState((state) => ({ popups: [...state.popups, overlay]}));
        });
    }

    rerenderPopups = (popups, map) => {
        this.state.popups.map((popup) => {
            map.removeOverlay(popup);
        });
        this.setState({ popups: [] }, () => this.preparePopups(popups, map));
    }
}
