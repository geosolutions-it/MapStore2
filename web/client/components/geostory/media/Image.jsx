/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Lightbox from 'react-image-lightbox';
import objectFitImages from 'object-fit-images';
import { withState } from 'recompose';

class Image extends Component {

    static propTypes = {
        src: PropTypes.string,
        fit: PropTypes.string,
        enableFullscreen: PropTypes.bool,
        fullscreen: PropTypes.bool,
        onClick: PropTypes.func
    };

    componentDidMount() {
        objectFitImages(this._node);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.src !== this.props.src) {
            objectFitImages(this._node);
        }
    }

    render() {
        const {
            src,
            fit = 'cover',
            enableFullscreen,
            fullscreen,
            onClick
        } = this.props;
        return (
            <div
                className="ms-media ms-media-image">
                <img
                    ref={node => { this._node = node; }}
                    src={src}
                    onClick={enableFullscreen ? () => onClick(true) : undefined}
                    style={{
                        objectFit: fit,
                        // polyfill ie11
                        fontFamily: `object-fit: ${fit};`,

                        cursor: enableFullscreen ? 'pointer' : 'default'
                    }}/>
                {enableFullscreen && fullscreen ?
                    <Lightbox
                        mainSrc={src}
                        onCloseRequest={() => onClick(false)}/>
                : null}
            </div>
        );
    }
}

export default withState('fullscreen', 'onClick', false)(Image);
