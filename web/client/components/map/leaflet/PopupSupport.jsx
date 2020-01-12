import React from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import {isEqual} from 'lodash';

export default class PopupSupport extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        popups: PropTypes.arrayOf(PropTypes.object),
        onPopupClose: PropTypes.func
    }

    static defaultProps = {
        popups: []
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

    renderPopups() {
        const { popups } = this.props;
        return popups.map(({ id, content: PopupContent }) => {
            if (!PopupContent) {
                this.popupWrapperRefs[id] = document.getElementById(id);
                return null;
            }
            return (
                <div key={id} ref={(ref) => { this.popupWrapperRefs[id] = ref; return true; }}>
                    <PopupContent />
                </div>
            );
        });
    }

    render() {
        return <div>{this.renderPopups()}</div>;
    }


    popupWrapperRefs = {};

    preparePopups = (popups, map) => {
        popups.map(({ id, position: { coordinates }}) => {
            const element = this.popupWrapperRefs[id];
            const popup = L.popup({ keepInView: true, className: 'test' }).setContent(element);
            popup.setLatLng(coordinates).openOn(map);
            this.setState((state) => ({ popups: [...state.popups, popup]}));
        });
    }

    rerenderPopups = (popups, map) => {
        // this.state && this.state.popups && this.state.popups.map((popup) => {
        //     popup.closePopup();
        // });
        this.setState({ popups: [] }, () => this.preparePopups(popups, map));
    }
}
