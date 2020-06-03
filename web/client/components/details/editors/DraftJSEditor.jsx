/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { lifecycle, withProps, compose } from 'recompose';

import { withEditorBase } from '../../geostory/contents/enhancers/editableText';
import { htmlToDraftJSEditorState } from '../../../utils/EditorUtils';

export default compose(
    lifecycle({
        componentDidMount() {
            const {onUpdate = () => {}, detailsText = '', setContentChanged = () => {}} = this.props;

            onUpdate(htmlToDraftJSEditorState(detailsText));
            setContentChanged(true);
        }
    }),
    withProps(({editorState, onUpdate = () => {}}) => ({
        onEditorStateChange: (newEditorState) => {
            onUpdate(newEditorState);
        },
        editorState,
        toolbar: {
            options: ['fontFamily', 'blockType', 'inline', 'textAlign', 'colorPicker', 'list', 'link', 'remove', 'image'],
            image: {
                className: undefined,
                component: undefined,
                popupClassName: undefined,
                urlEnabled: true,
                uploadEnabled: true,
                alignmentEnabled: true,
                uploadCallback: (file) => new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.addEventListener('load', () => {
                        resolve({data: {link: reader.result}});
                    });

                    if (file) {
                        reader.readAsDataURL(file);
                    } else {
                        reject();
                    }
                }),
                previewImage: true,
                inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                alt: { present: false, mandatory: false },
                defaultSize: {
                    height: 'auto',
                    width: 'auto'
                }
            }
        }
    })),
    withEditorBase
)();
