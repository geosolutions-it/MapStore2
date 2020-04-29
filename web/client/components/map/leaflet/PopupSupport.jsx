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
import isString from 'lodash/isString';
import * as Utils from '../../../utils/PopupUtils';
import popupsComponents from '../popups';

// It adds a mutation observer to popup's container
// When react render inside it, the observer call an update on leaflet popup
// adjusting the popup size.
const addMutationObserver = (popup, container) => {
    let observer = new MutationObserver(() => {
        popup.update();
    });
    popup.once('remove', () => {
        observer && observer.disconnect();
        observer = null;
    });
    observer.observe(container, {attributes: true, childList: true, subtree: true });
};

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
    componentWillMount() {
        if (this.props.map) {
            // This prevent the pointermove to be sent event when stopevent is active.
            this.props.map.getContainer().querySelector('.leaflet-popup-pane').addEventListener('mousemove', this.stopPropagationOnMouseMove);
            this.props.map.getContainer().querySelector('.leaflet-popup-pane').addEventListener('mouseenter', this.fireMouseOutEvent);
        }
    }
    componentDidMount() {
        if (this.props.map) {
            this.props.map.on('resize', this.updatePopup);
        }
    }
    shouldComponentUpdate({popups}) {
        return popups !== this.props.popups;
    }
    componentWillUnmount() {
        // Clean old popups without throwing event
        (this._popups || []).forEach(({popup}) => {
            popup.off('remove', this.popupClose);
            popup && this.props.map?.removeLayer?.(popup);
        });
        if (this.props.map) {
            this.props.map.off('resize', this.updatePopup);
            this.props.map.getContainer().removeEventListener('mousemove', this.stopPropagationOnMouseMove);
            this.props.map.getContainer().removeEventListener('mouseenter', this.fireMouseOutEvent);
        }
    }
    renderPopups() {
        return  this.preparePopups()
            .filter(({component}) => !!component)
            .map(({popup, props = {}, component, id}) => {
                const context = popup.getContent();
                const PopupContent = isString(component) && popupsComponents[component] || component;
                const El = React.isValidElement(PopupContent) && PopupContent || <PopupContent {...props}/>;
                return context ? ReactDOM.createPortal(El, context, id) : null;
            });
    }
    render() {
        return <div>{this.renderPopups()}</div>;
    }
    updatePopup = () => {
        (this._popups || []).map(({popup}) => popup.update());
    }
    popupClose = ({target: {options: {id} = {}} = {}} = {}) => {
        if (id) {
            this.props.onPopupClose(id);
        }
    }
    preparePopups = () => {
        const {popups = [], map} = this.props;
        const size = this.props.map.getSize();
        // Clean old popups without throwing event
        (this._popups || []).forEach(({popup}) => {
            popup.off('remove', this.popupClose);
            popup && this.props.map.removeLayer(popup);
        });
        // Create popups
        this._popups = popups.map(( options = {}) => {

            const maxMapWidth = size.x * 0.9;
            const maxMapHeight =  size.y * 0.9;

            const { id, position: { coordinates }, component, content, className,
                maxWidth: maxWidthOption = maxMapWidth,
                maxHeight: maxHeightOption = maxMapHeight,
                autoPan = true,
                offset = [0, 7]} = options;

            // check if max sizes in options are greater then sizes of map
            const maxWidth = maxWidthOption > maxMapWidth ? maxMapWidth : maxWidthOption;
            const maxHeight = maxHeightOption > maxMapHeight ? maxMapHeight : maxHeightOption;

            const container = Utils.createContainer(id, className);
            container.setAttribute("style", `max-width: ${maxWidth}px; max-height: ${maxHeight}px`);
            Utils.append(container, content);
            // Always wrap the content in a div
            const popup = L.popup({id, autoClose: false, closeOnClick: false, autoPan, autoPanPadding: L.point(70, 70), maxWidth, maxHeight, className: "ms-leaflet-popup", offset}).setContent(container);
            popup.once('remove', this.popupClose);
            component && addMutationObserver(popup, container);

            popup.setLatLng(coordinates);
            map.addLayer(popup); // This is needed to manage multiple popup
            return { popup, ...options };
        });
        return this._popups;
    }
    stopPropagationOnMouseMove = (event) => {
        event.stopPropagation();
    }
    fireMouseOutEvent = () => {
        this.props.map.fireEvent('mouseout');
    }
}
