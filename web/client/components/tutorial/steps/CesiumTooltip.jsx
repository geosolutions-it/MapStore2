/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';

import * as I18N from '../../I18N/I18N';
import MouseLeft from './assets/img/MouseLeft.svg';
import MouseMiddle from './assets/img/MouseMiddle.svg';
import MouseRight from './assets/img/MouseRight.svg';
import TouchDrag from './assets/img/TouchDrag.svg';
import TouchRotate from './assets/img/TouchRotate.svg';
import TouchTilt from './assets/img/TouchTilt.svg';
import TouchZoom from './assets/img/TouchZoom.svg';

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

export default CesiumTooltip;
