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
import { Overlay } from 'ol';
import isString from 'lodash/isString';
import * as Utils from '../../../utils/PopupUtils';

import popupsComponents from '../popups';

const addMutationObserver = (popup, container, options = {}) => {
    let observer = new MutationObserver(() => {
        // force autoPan via position reset
        const map = popup.getMap();
        const mapSize = map.getSize();
        if (mapSize) {
            popup.setPosition(undefined);
            popup.setPosition(options.coordinates);
        }
    });
    observer.observe(container, {attributes: true, childList: true, subtree: true });
    return observer;
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
            // This prevent the pointermove to be sent event when stopevent is active. See:  https://github.com/openlayers/openlayers/issues/4953
            this.props.map.getOverlayContainerStopEvent().addEventListener('pointermove', this.stopPropagationOnPointerMove);
        }
    }
    shouldComponentUpdate({popups}) {
        return popups !== this.props.popups;
    }
    componentWillUnmount() {
        if (this.props.map) {
            this.props.map.getOverlayContainerStopEvent().removeEventListener('pointermove', this.stopPropagationOnPointerMove);
        }
    }
    onPopupClose = (id) => {
        this.props.onPopupClose(id);
    }
    renderPopups = () => {
        return this.preparePopups().map(({ popup, id, component, content, props, containerStyle}) => {
            const context = popup.getElement();
            const PopupContent = isString(component) && popupsComponents[component] || component;
            let El;
            if (!!PopupContent) {
                El = React.isValidElement(PopupContent) && PopupContent || <PopupContent {...props}/>;
            } else if (content) {
                El = Utils.isHTML(content) ? <div dangerouslySetInnerHTML={{__html: content}}/> : content;
            }
            return context && ReactDOM.createPortal(
                <div className="map-popup-ol" key={id} onMouseUp={this.convertToClick}>
                    <div className="ol-popup-content-wrapper" >
                        <div className="ol-popup-content" style={containerStyle}>
                            {El}
                        </div>
                    </div>
                    <div className="ol-popup-closer" onClick={() => this.onPopupClose(id)}>x</div>
                </div>,
                context
            );
        });
    }
    render() {
        return <div>{this.renderPopups()}</div>;
    }
    update = () => {
        (this._popups || []).map(({popup}) => {
            popup.setElement(popup.getElement());
        });
    }
    convertToClick = (e) => {
        const evt = new MouseEvent('click', { bubbles: true });
        evt.stopPropagation = () => {};
        e.target.dispatchEvent(evt);
    }

    preparePopups = () => {
        const {popups = [], map} = this.props;
        const size = map.getSize();
        (this._popups || []).forEach(({popup, observer}) => {
            !!observer && observer.disconnect();
            !!popup && map.removeOverlay(popup);
        });

        this._popups = popups.map((options) => {
            const margin = 20;
            const maxMapWidth = Math.round(size[0] * 0.9) - margin * 2;
            const maxMapHeight =  Math.round(size[1] * 0.9) - margin * 2;
            const { id, position: { coordinates }, className,
                maxWidth: maxWidthOption = maxMapWidth,
                maxHeight: maxHeightOption = maxMapHeight,
                autoPan = false,
                autoPanMargin = margin,
                offset = [0, 0],
                autoPanAnimation = {
                    duration: 200
                }} = options;

            // check if max sizes in options are greater then sizes of map
            const maxWidth = maxWidthOption > maxMapWidth ? maxMapWidth : maxWidthOption;
            const maxHeight = maxHeightOption > maxMapHeight ? maxMapHeight : maxHeightOption;

            const container = Utils.createContainer(id, className);
            const popup = new Overlay({
                id,
                element: container,
                autoPan,
                offset,
                autoPanMargin,
                autoPanAnimation,
                positioning: 'bottom-center',
                className: 'ol-overlay-container ol-unselectable',
                position: coordinates
            });
            map.addOverlay(popup);
            const observer = addMutationObserver(popup, container, { coordinates });
            const containerStyle = { maxWidth, maxHeight };
            return { popup, observer, containerStyle, ...options };
        });
        return this._popups;
    }
    stopPropagationOnPointerMove = (event) => {
        event.stopPropagation();
    }
}
