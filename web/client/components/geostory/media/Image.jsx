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
import { compose, withState } from 'recompose';

/**
 * Image media component
 * @class
 * @name Image
 * @prop {string} src source of the image
 * @prop {string} fit one of 'cover' or 'contain'
 * @prop {boolean} enableFullscreen enable fullscreen preview with pan and zoom options
 * @prop {string} description description of media resource
 * @prop {string} caption caption of current content
 * @prop {boolean} showCaption display/hide caption
 * @prop {element} loaderComponent render loader component
 * @prop {element} errorComponent render error component
 */
class Image extends Component {

    static propTypes = {
        src: PropTypes.string,
        id: PropTypes.string,
        fit: PropTypes.string,
        description: PropTypes.string,
        showCaption: PropTypes.bool,
        credits: PropTypes.string,
        altText: PropTypes.string,
        enableFullscreen: PropTypes.bool,
        fullscreen: PropTypes.bool,
        onClick: PropTypes.func,
        onChangeStatus: PropTypes.func,
        status: PropTypes.string,
        loaderComponent: PropTypes.element,
        errorComponent: PropTypes.element,
        caption: PropTypes.string,
        loaderStyle: PropTypes.object
    };

    componentDidMount() {
        objectFitImages(this._node);
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.src !== this.props.src) {
            objectFitImages(this._node);
        }
    }

    render() {
        const {
            id,
            src,
            fit = 'cover',
            enableFullscreen = true,
            fullscreen,
            onClick,
            description,
            showCaption,
            caption = description,
            credits,
            loaderStyle
        } = this.props;

        const LoaderComponent = this.props.loaderComponent;
        const ErrorComponent = this.props.errorComponent;

        return (
            <div
                id={id}
                className="ms-media ms-media-image">
                {src && this.props.status !== 'error' && <img
                    ref={node => { this._node = node; }}
                    src={src}
                    onLoad={() => this.props.onChangeStatus('loaded')}
                    onError={() => this.props.onChangeStatus('error')}
                    onClick={enableFullscreen ? () => onClick(true) : undefined}
                    style={{
                        objectFit: fit,
                        // polyfill ie11
                        fontFamily: `object-fit: ${fit}`,
                        cursor: enableFullscreen ? 'pointer' : 'default'
                    }}/>}
                {(src && !this.props.status) && LoaderComponent && <LoaderComponent style={{...loaderStyle}} />}
                {(this.props.status === 'error') && ErrorComponent && <ErrorComponent />}
                {credits && <div className="ms-media-credits">
                    <small>
                        {credits}
                    </small>
                </div>}
                {showCaption && caption && <div className="ms-media-caption">
                    <small>
                        {caption}
                    </small>
                </div>}
                {enableFullscreen && fullscreen ?
                    <Lightbox
                        mainSrc={src}
                        onCloseRequest={() => onClick(false)}/>
                    : null}
            </div>
        );
    }
}

export default compose(
    withState('fullscreen', 'onClick', false),
    withState('status', 'onChangeStatus', '')
)(Image);
