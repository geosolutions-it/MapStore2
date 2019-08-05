/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from "react";
import PropTypes from 'prop-types';
import stickySupport from '../../../misc/enhancers/stickySupport';
import Media from '../../media/index';
import { lists } from '../../../../utils/GeoStoryUtils';
/**
 * Background.
 * This component provides a sticky container inside the Sections.
 */

class Background extends Component {

    static propTypes = {
        height: PropTypes.number,
        width: PropTypes.number,
        style: PropTypes.object,
        type: PropTypes.oneOf(lists.MediaTypes)
    };

    static defaultProps = {
        height: 0,
        width: 0,
        style: {}
    };


    render() {
        const MediaType = Media[this.props.type];
        return (
            <div
                ref="div"
                className="ms-section-background"
                style={{ ...this.props.style }}>
                <div
                    className="ms-section-background-container"
                    style={{ height: this.props.height }}>
                    {MediaType && <MediaType { ...this.props } />}
                </div>
            </div>
        );
    }
}
export default stickySupport()(Background);
