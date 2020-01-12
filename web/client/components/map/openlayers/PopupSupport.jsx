import React from 'react';
import PropTypes from 'prop-types';
import { Overlay } from 'ol';
import {isEqual} from 'lodash';

export default class PopupSupport extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        popups: PropTypes.arrayOf(PropTypes.object),
        onPopupClose: PropTypes.func
    }

    static defaultProps = {
        popups: [],
        onPopupClose: () => {}
    }

    state = {
        popups: []
    }

    componentDidMount() {
        const { popups, map } = this.props;
        this.preparePopups(popups, map);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const newPopups = nextProps.popups.map(({id, position}) => ({id, position}));
        const currentPopups = this.props.popups.map(({id, position}) => ({id, position}));
        if (!isEqual(currentPopups, newPopups)) {
            this.rerenderPopups(nextProps.popups, nextProps.map);
        }
    }

    componentWillUnmount() {
        this.popupWrapperRefs = {};
    }

    onPopupClose = (id) => {
        this.state.popups.map(p => {
            if (p.getId() === id) p.setPosition(undefined, undefined);
        });
        this.props.onPopupClose(id);
    }

    renderPopups() {

        const { popups } = this.props;
        return popups.map(({ id, content: PopupContent }) => {
            if (!PopupContent) {
                this.popupWrapperRefs[id] = document.getElementById(id);
                return null;
            }
            return (
                <div className="map-popup-ol" ref={(ref) => { this.popupWrapperRefs[id] = ref; return true; }} key={id} onMouseUp={this.convertToClick}>
                    <div>
                        <div className="ol-popup-closer" onClick={() => this.onPopupClose(id)}></div>
                        <PopupContent showInMapPopup />
                    </div>
                </div>
            );
        });
    }

    render() {
        return <div className="popup-wrapper" ref={(ref) => { this.globalWrapperRef = ref; }}>{this.renderPopups()}</div>;
    }

    convertToClick = (e) => {
        const evt = new MouseEvent('click', { bubbles: true });
        evt.stopPropagation = () => {};
        e.target.dispatchEvent(evt);
    }

    popupWrapperRefs = {};

    preparePopups = (popups, map) => {
        popups.map(({ id, position: { coordinates } }) => {
            const element = this.popupWrapperRefs[id];
            const overlay = new Overlay({
                id,
                element,
                autoPan: true,
                autoPanAnimation: {
                    duration: 200
                },
                positioning: 'top-center',
                className: 'ol-overlay-container ol-unselectable'
            });

            map.addOverlay(overlay);
            overlay.setPosition(coordinates);
            this.setState((state) => ({ popups: [...state.popups, overlay] }));
        });
    }

    rerenderPopups = (popups, map) => {
        this.state && this.state.popups && this.state.popups.map((popup) => {
            map.removeOverlay(popup);
        });
        this.setState({ popups: [] }, () => this.preparePopups(popups, map));
    }
}
