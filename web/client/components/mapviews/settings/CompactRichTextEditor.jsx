/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Editor } from 'react-draft-wysiwyg';
import embed from 'embed-video';
import { DEFAULT_FONT_FAMILIES } from '../../../utils/GeoStoryUtils';

export const resizeBase64Image = (src, options) => {
    return new Promise((resolve, reject) => {
        const {
            size,
            type = 'image/png',
            quality = 0.9
        } = options || {};
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const { naturalWidth, naturalHeight } = img;
            const imgResolution = naturalWidth / naturalHeight;
            const width = size;
            const height = size / imgResolution;
            const canvas = document.createElement('canvas');
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const dataURL = canvas.toDataURL(type, quality);
            resolve(dataURL);
        };
        img.onerror = (error) => {
            reject(error);
        };
        img.src = src;
    });
};

function CompactRichTextEditor({
    wrapperClassName = 'ms-compact-text-editor',
    toolbarOptions,
    ...props
}) {

    return (
        <Editor
            {...props}
            editorStyle={{ minHeight: 200 }}
            wrapperClassName={wrapperClassName}
            toolbar={{
                options: toolbarOptions || ['fontFamily', 'blockType', 'inline', 'textAlign', 'list', 'link', 'colorPicker', 'remove', 'image', 'embedded'],
                image: {
                    urlEnabled: true,
                    // disable the upload at the moment
                    // it will increase the size of the map too much
                    uploadEnabled: false,
                    alignmentEnabled: false,
                    uploadCallback: (file) => new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.addEventListener('load', () => {
                            resizeBase64Image(reader.result, {
                                size: 500,
                                type: 'image/jpeg',
                                quality: 0.8
                            }).then((linkBase64) => {
                                resolve({ data: { link: linkBase64 } });
                            });
                        });
                        if (file) {
                            reader.readAsDataURL(file);
                        } else {
                            reject();
                        }
                    }),
                    previewImage: true,
                    inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                    alt: props.alt || { present: false, mandatory: false },
                    defaultSize: {
                        height: 'auto',
                        width: '100%'
                    }
                },
                fontFamily: {
                    options: DEFAULT_FONT_FAMILIES
                },
                link: {
                    inDropdown: false,
                    showOpenOptionOnHover: true,
                    defaultTargetOption: '_self',
                    options: ['link', 'unlink']
                },
                blockType: {
                    inDropdown: true,
                    options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code']
                },
                inline: {
                    inDropdown: true,
                    options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace']
                },
                textAlign: {
                    inDropdown: true
                },
                list: {
                    inDropdown: true
                },
                embedded: {
                    embedCallback: link => {
                        const detectedSrc = /<iframe.*? src="(.*?)"/.exec(embed(link));
                        return (detectedSrc && detectedSrc[1]) || link;
                    },
                    defaultSize: {
                        height: 'auto',
                        width: '100%'
                    }
                }
            }}
        />
    );
}

export default CompactRichTextEditor;
