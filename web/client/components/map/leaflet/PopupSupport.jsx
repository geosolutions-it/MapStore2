/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
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
        popups: [],
        onPopupClose: () => {}
    }

    constructor(props) {
        super(props);
        this.preparePopups(props.popups, props.map, true);
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

    componentDidUpdate() {
        this.state.popups.map(p => p.update());
    }

    renderPopups() {
        const { popups } = this.props;
        return popups.map(({ id, content: PopupContent }) => {
            const context = document.getElementById(id);
            return context ? ReactDOM.createPortal(
                <div key={id}>
                    <PopupContent showInMapPopup/>
                </div>,
                context
            ) : null;
        });
    }

    render() {
        return <div>{this.renderPopups()}</div>;
    }

    preparePopups = (popups, map, onInit) => {
        const popupList = [];
        popups.map(({ id, position: { coordinates }}) => {
            const element = document.createElement('div');
            element.id = id;
            const popup = L.popup({ maxWidth: window.innerWidth }).setContent(element);
            popup.on('remove', () => {
                this.props.onPopupClose(id);
            });
            popup.setLatLng(coordinates).openOn(map);
            popupList.push(popup);
        });
        onInit
            ? this.state.popups = popupList
            : this.setState({ popups: popupList });
    }

    rerenderPopups = (popups, map) => {
        this.setState({ popups: [] }, () => this.preparePopups(popups, map));
    }
}
