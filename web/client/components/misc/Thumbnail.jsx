/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import Dropzone from 'react-dropzone';
import Loader from './Loader';
import { createBase64Thumbnail } from '../../utils/ThumbnailUtils';
import Toolbar from './toolbar/Toolbar';

const getThumbnail = (files, options) => {
    return new Promise((resolve) => {
        let filesSelected = files;
        if (filesSelected?.[0]) {
            let fileToLoad = filesSelected[0];
            let fileReader = new FileReader();
            fileReader.onload = (event) => {
                if (!options) {
                    return resolve({
                        data: event.target.result,
                        size: fileToLoad.size
                    });
                }
                return resolve(
                    createBase64Thumbnail(event.target.result, options)
                        .then((data) => ({ data, size: data.length }))
                );
            };
            return fileReader.readAsDataURL(fileToLoad);
        }
        return resolve({ data: null });
    });
};

/**
 * @memberof components.misc
 * @name Thumbnail
 * @class
 * @prop {string} className class name of the component
 * @prop {boolean} loading display loading spinner
 * @prop {node} message display node message inside thumbnail
 * @prop {string} thumbnail source of thumbnail
 * @prop {number} maxFileSize max size of file
 * @prop {array} supportedImageTypes array of images supported mime types
 * @prop {options} thumbnailOptions options to scale the thumbnail to fit a specific size
 * @prop {object} dropZoneProps props for dropzone component
 * @prop {function} onUpdate return updated data after add/drop an image
 * @prop {function} onError return errors after add/drop an image
 * @prop {function} onRemove callback on removing thumbnail
 * @prop {array} toolbarButtons array of buttons objects (see Toolbar)
 */
const Thumbnail = forwardRef(({
    className = 'ms-thumbnail',
    label,
    loading,
    message,
    error,
    thumbnail,
    removeGlyph = 'trash',
    removeTooltipId = 'removeThumbnail',
    style = {},
    maxFileSize = 500000,
    supportedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'],
    thumbnailOptions,
    dropZoneProps = {
        className: 'ms-thumbnail-dropzone',
        activeClassName: 'ms-thumbnail-dropzone-active',
        rejectClassName: 'ms-thumbnail-dropzone-reject'
    },
    onUpdate = () => {},
    onError = () => {},
    onRemove,
    toolbarButtons
}, ref) => {

    const mounted = useRef();
    const [pending, setPending] = useState();

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const handleDrop = (files) => {
        const imageType = files?.[0]?.type;
        const isASupportedImage = supportedImageTypes.indexOf(imageType) !== -1;
        setPending(true);
        getThumbnail(files, thumbnailOptions)
            .then(({ data, size }) => {
                if (!mounted.current) {
                    return null;
                }
                setPending(false);
                if (isASupportedImage && data && size < maxFileSize) {
                    return onUpdate(data, files);
                }
                return onError([
                    ...(!isASupportedImage ? ['FORMAT'] : []),
                    ...(data && size >= maxFileSize ? ['SIZE'] : [])
                ], files);
            })
            .catch((e) => {
                if (!mounted.current) {
                    return null;
                }
                setPending(false);
                return onError(e);
            });
    };

    const handleRemove = (event) => {
        event?.stopPropagation?.();
        onRemove?.();
    };

    if (loading || pending) {
        return (
            <div className={`dropzone-thumbnail-container${className ? ` ${className}` : ''} ms-loading`}>
                <Loader size={70}/>
            </div>
        );
    }

    const toolbar = (
        <Toolbar
            btnDefaultProps={{
                className: 'square-button-md no-border'
            }}
            buttons={toolbarButtons
                ? toolbarButtons
                : [
                    {
                        glyph: removeGlyph,
                        visible: !!(onRemove && thumbnail),
                        tooltipId: removeTooltipId,
                        onClick: handleRemove
                    }
                ]}
        />
    );

    return (
        <div
            className={`dropzone-thumbnail-container${className ? ` ${className}` : ''}`}
            style={style}>
            {label}
            <Dropzone
                { ...dropZoneProps }
                multiple={false}
                onDrop={handleDrop}>
                {thumbnail
                    ? (
                        <div
                            style={{
                                position: 'relative',
                                width: '100%',
                                height: '100%'
                            }}>
                            <div
                                ref={ref}
                                style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    backgroundImage: `url(${thumbnail})`,
                                    backgroundSize: thumbnailOptions?.contain ? 'contain' : 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            />
                            <div className="dropzone-content-image-added">{message}</div>
                            {toolbar}
                        </div>
                    )
                    : (
                        <div className="dropzone-content-image">
                            {message}
                            {toolbar}
                            {error && <div className="dropzone-errors">
                                {error}
                            </div>}
                        </div>
                    )}
            </Dropzone>
        </div>
    );
});

export default Thumbnail;
