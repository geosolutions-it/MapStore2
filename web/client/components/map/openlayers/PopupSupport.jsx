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
    shouldComponentUpdate({popups}) {
        return popups !== this.props.popups;
    }
    onPopupClose = (id) => {
        this.props.onPopupClose(id);
    }
    renderPopups = () => {
        return this.preparePopups().map(({ popup, id, component, content, props, compStyle, containerStyle}) => {
            const context = popup.getElement();
            const PopupContent = isString(component) && popupsComponents[component] || component;
            let El;
            if (!!PopupContent) {
                El = React.isValidElement(PopupContent) && PopupContent || <PopupContent style={compStyle} {...props}/>;
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
        const margin = 20;
        this._popups = popups.map((options) => {
            const { id, position: { coordinates }, className,
                maxWidth = Math.round(size[0] * 0.9) - margin * 2,
                maxHeight = Math.round(size[1] * 0.5) - margin * 2,
                autoPan = true,
                autoPanMargin = margin,
                offset = [0, 0],
                autoPanAnimation = {
                    duration: 200
                }} = options;

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
            const containerStyle = {maxWidth, maxHeight: maxHeight};
            const compStyle = {maxWidth: maxWidth - 30, maxHeight: maxHeight - 20};
            return {popup, observer, compStyle, containerStyle, ...options};
        });
        return this._popups;
    }
}
