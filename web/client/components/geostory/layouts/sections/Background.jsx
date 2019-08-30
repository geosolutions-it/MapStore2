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
import { lists, getClassNameFromProps, Modes } from '../../../../utils/GeoStoryUtils';
import ContentToolbar from '../../contents/ContentToolbar';

/**
 * Background.
 * This component provides a sticky container inside the Sections.
 */

class Background extends Component {

    static propTypes = {
        mode: PropTypes.string,
        fit: PropTypes.string,
        size: PropTypes.string,
        path: PropTypes.string,
        height: PropTypes.number,
        width: PropTypes.number,
        tools: PropTypes.array,
        style: PropTypes.object,
        add: PropTypes.func,
        editMedia: PropTypes.func,
        update: PropTypes.func,
        type: PropTypes.oneOf(lists.MediaTypes)
    };

    static defaultProps = {
        height: 0,
        type: "image",
        size: "full",
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
                    className={`ms-section-background-container${getClassNameFromProps(this.props)}`}
                    style={{ height: this.props.height }}>
                    {MediaType && <MediaType { ...this.props } />}
                >
                { this.props.mode === Modes.EDIT &&
                <ContentToolbar
                    {...this.props}
                    tools={this.props.tools && this.props.tools[this.props.type]}
                    />}
                </div>

            </div>
        );
    }
}

export default stickySupport()(Background);

