/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withProps, withState, withHandlers, branch, renderComponent } from "recompose";

import htmlToDraft from 'html-to-draftjs';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

/**
 * HOC that adds WYSIWYG editor to a content. The editor will replace the component when activated, and it will be activated again when
 * the user clicks out of the editor. This will automatically call an handler `save` passed as prop (if provided), with the new html as argument.
 * The new component will receive as props:
 * - `toggleEditing` handler with the following arguments, to call to activate editing.
 *    - `editing`: boolean flag to enable/disable editing
 *    - `html`: the html with the editing have to be initialized.
 *
 */
export default compose(
    withState('contentEditing', 'setContentEditing', false),
    withState('editorState', 'onEditorStateChange'),
    withHandlers({
        toggleEditing: ({ onEditorStateChange = () => {}, setContentEditing = () => {}, save = () => {} }) => (editing, html) => {
            if (!editing) {
                save(html);
                setContentEditing(false);
            } else if (html) {
                const contentBlock = htmlToDraft(html);
                const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                onEditorStateChange(EditorState.createWithContent(contentState));
                setContentEditing(true);
            } else {
                onEditorStateChange(EditorState.createEmpty());
            }
        }
    }),
    branch(
        ({contentEditing}) => !!contentEditing,
        compose(
            withHandlers({
                onBlur: ({toggleEditing = () => {}, editorState}) => () => {
                    const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
                    toggleEditing(false, html);
                }
            }),
            // default properties for editor
            withProps(({ placeholder, toolbarStyle = {}, className = "ms-text-editor"}) => ({
                editorRef: ref => setTimeout(() => ref && ref.focus && ref.focus(), 100), // handle auto-focus on edit
                stripPastedStyles: true,
                placeholder,
                toolbarStyle,
                toolbar: {
                    options: ['fontFamily', 'blockType', 'inline', 'textAlign', 'colorPicker', 'link', 'remove'],
                    fontFamily: {
                        options: ['inherit', 'Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'],
                        className: undefined,
                        component: undefined,
                        dropdownClassName: undefined
                    },
                    link: {
                        inDropdown: false,
                        className: undefined,
                        component: undefined,
                        popupClassName: undefined,
                        dropdownClassName: undefined,
                        showOpenOptionOnHover: true,
                        defaultTargetOption: '_self',
                        options: ['link', 'unlink'],
                        link: { icon: undefined, className: undefined },
                        unlink: { icon: undefined, className: undefined },
                        linkCallback: undefined
                    },
                    blockType: {
                        inDropdown: true,
                        options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
                        className: undefined,
                        component: undefined,
                        dropdownClassName: undefined
                    },
                    inline: {
                        options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
                        bold: { className: `${className}-toolbar-btn` },
                        italic: { className: `${className}-toolbar-btn` },
                        underline: { className: `${className}-toolbar-btn` },
                        strikethrough: { className: `${className}-toolbar-btn` },
                        code: { className: `${className}-toolbar-btn` }
                    },
                    textAlign: {
                        left: { className: `${className}-toolbar-btn` },
                        center: { className: `${className}-toolbar-btn` },
                        right: { className: `${className}-toolbar-btn` },
                        justify: { className: `${className}-toolbar-btn` }
                    },
                    colorPicker: { className: `${className}-toolbar-btn` },
                    remove: { className: `${className}-toolbar-btn` },
                    ...toolbar
                },
                toolbarClassName: `${className}-toolbar`,
                wrapperClassName: `${className}-wrapper`,
                editorClassName: `${className}-main`
            })),
            renderComponent(Editor)
        )
    )
);
