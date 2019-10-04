/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const I18N = require('../../I18N/I18N');

const MouseLeft = require('./assets/img/MouseLeft.svg');
const MouseRight = require('./assets/img/MouseRight.svg');
const MouseMiddle = require('./assets/img/MouseMiddle.svg');

const TouchDrag = require('./assets/img/TouchDrag.svg');
const TouchZoom = require('./assets/img/TouchZoom.svg');
const TouchTilt = require('./assets/img/TouchTilt.svg');
const TouchRotate = require('./assets/img/TouchRotate.svg');
const PropTypes = require('prop-types');

class CesiumTooltip extends React.Component {
    static propTypes = {
        touch: PropTypes.bool
    };

    static defaultProps = {
        touch: false
    };

    render() {
        return this.props.touch ? (
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <img src={TouchDrag} width="70" height="48"/>
                            </td>
                            <td>
                                <div style={{color: '#66ccff'}}><I18N.Message msgId="tutorial.cesium.pan"/></div>
                                <div><I18N.Message msgId="tutorial.cesium.oneDrag"/></div>
                            </td>
                        </tr>
                        <tr style={{height: 10}}/>
                        <tr>
                            <td>
                                <img src={TouchZoom} width="70" height="48"/>
                            </td>
                            <td>
                                <div style={{color: '#65fd00'}}><I18N.Message msgId="tutorial.cesium.zoom"/></div>
                                <div><I18N.Message msgId="tutorial.cesium.twoPinch"/></div>
                            </td>
                        </tr>
                        <tr style={{height: 10}}/>
                        <tr>
                            <td>
                                <img src={TouchTilt} width="70" height="48"/>
                            </td>
                            <td>
                                <div style={{color: '#ffd800'}}><I18N.Message msgId="tutorial.cesium.tilt"/></div>
                                <div><I18N.Message msgId="tutorial.cesium.twoDragSame"/></div>
                            </td>
                        </tr>
                        <tr style={{height: 10}}/>
                        <tr>
                            <td>
                                <img src={TouchRotate} width="70" height="48"/>
                            </td>
                            <td>
                                <div style={{color: '#d800d8'}}><I18N.Message msgId="tutorial.cesium.rotate"/></div>
                                <div><I18N.Message msgId="tutorial.cesium.twoDragOpposite"/></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        ) : (
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <img src={MouseLeft} width="48" height="48"/>
                            </td>
                            <td>
                                <div style={{color: '#66ccff'}}><I18N.Message msgId="tutorial.cesium.pan"/></div>
                                <div><I18N.Message msgId="tutorial.cesium.leftClick"/></div>
                            </td>
                        </tr>
                        <tr style={{height: 10}}/>
                        <tr>
                            <td>
                                <img src={MouseRight} width="48" height="48"/>
                            </td>
                            <td>
                                <div style={{color: '#65fd00'}}><I18N.Message msgId="tutorial.cesium.zoom"/></div>
                                <div><I18N.Message msgId="tutorial.cesium.rightClick"/></div>
                            </td>
                        </tr>
                        <tr style={{height: 10}}/>
                        <tr>
                            <td>
                                <img src={MouseMiddle} width="48" height="48"/>
                            </td>
                            <td>
                                <div style={{color: '#ffd800'}}><I18N.Message msgId="tutorial.cesium.rotate"/></div>
                                <div><I18N.Message msgId="tutorial.cesium.middleClick"/></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

module.exports = CesiumTooltip;
