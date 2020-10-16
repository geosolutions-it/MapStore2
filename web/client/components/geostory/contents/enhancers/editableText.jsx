/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { EditorState, Modifier, RichUtils } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { branch, compose, renderComponent, withHandlers, withProps, withState, lifecycle } from "recompose";

import {
    EMPTY_CONTENT,
    SectionTypes,
    ContentTypes,
    DEFAULT_FONT_FAMILIES } from "../../../../utils/GeoStoryUtils";

import LayoutComponent from '../texteditor/CustomEditorLink';
import getLinkDecorator from '../texteditor/getLinkDecorator';
import { htmlToDraftJSEditorState, draftJSEditorStateToHtml } from '../../../../utils/EditorUtils';

/**
 * HOC that adds WYSIWYG editor to a content. The editor will replace the component when activated, and it will be activated again when
 * the user clicks out of the editor. This will automatically call an handler `save` passed as prop (if provided), with the new html as argument.
 * The new component will receive as props:
 * - `toggleEditing` handler with the following arguments, to call to activate editing.
 *    - `editing`: boolean flag to enable/disable editing
 *    - `html`: the html with the editing have to be initialized.
 *
 */
export const withEditorBase = compose(
    // default properties for editor
    withProps(({ storyFonts = [], placeholder, toolbarStyle = {}, className = "ms-text-editor", toolbar = {}}) => {
        const fonts = storyFonts.length > 0 ? storyFonts : DEFAULT_FONT_FAMILIES;
        return ({
            editorRef: ref => setTimeout(() => ref && ref.focus && ref.focus(), 100), // handle auto-focus on edit
            stripPastedStyles: true,
            placeholder,
            toolbarStyle,
            toolbar: {
                // [here](https://jpuri.github.io/react-draft-wysiwyg/#/docs) you can find some examples (hard to find them in the official draft-js doc)
                options: ['fontFamily', 'blockType', 'fontSize', 'inline', 'textAlign', 'colorPicker', 'list', 'link', 'remove'],
                fontFamily: {
                    options: fonts,
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
        });
    }),
    renderComponent(Editor)
);

export const withGeoStoryEditor = compose(
    lifecycle({
        componentWillUnmount() {
            const {editorState, save = () => {}} = this.props;
            // when text written inside editor is "" then return EMPTY_CONTENT to manage placeholder outside
            save(draftJSEditorStateToHtml(editorState, EMPTY_CONTENT));
        }
    }),
    withHandlers({
        onBlur: ({toggleEditing = () => {}}) => () => {
            toggleEditing(false);
        }
    }),
    withProps(({ sections = []}) => {
        // flatten out the story sections adding to them columns as if they were also sections such that
        // both sections and columns can be scrolled to
        const availableStorySections = sections.reduce((availableSections, section) => {
            const s = [];
            s.push(section);
            if (section.type === SectionTypes.PARAGRAPH || section.type === SectionTypes.IMMERSIVE) {
                const contents = section.contents;
                contents.forEach((c) => {
                    if (c.type === ContentTypes.COLUMN) {
                        s.push(c);
                    }
                });
            }

            return [...availableSections, ...s];

        }, []);
        return {
            availableStorySections
        };
    }),
    withProps(({ availableStorySections = [] }) => ({
        toolbar: {
            link: {
                inDropdown: false,
                className: undefined,
                component: (props) => <LayoutComponent {...props} availableStorySections={availableStorySections} />,
                popupClassName: undefined,
                dropdownClassName: undefined,
                showOpenOptionOnHover: true,
                defaultTargetOption: '_self',
                options: ['link', 'unlink'],
                link: { icon: undefined, className: undefined },
                unlink: { icon: undefined, className: undefined },
                linkCallback: undefined,
                getLinkDecorator
            }
        }
    })),
    withEditorBase
);

export default compose(
    withState('contentEditing', 'setContentEditing', false),
    withState('editorState', 'onEditorStateChange'),
    withHandlers({
        toggleEditing: ({ bubblingTextEditing = () => {}, sectionType, onEditorStateChange = () => {}, setContentEditing = () => {} }) => (editing, html) => {
            if (!editing) {
                setContentEditing(false);
                bubblingTextEditing(false);
            } else {
                let editorState = htmlToDraftJSEditorState(html);
                // Updating blockType for TITLES when opening an empty text editor
                if (sectionType === SectionTypes.TITLE && RichUtils.getCurrentBlockType(editorState) === "unstyled") {
                    let contentState = editorState.getCurrentContent();
                    contentState = Modifier.setBlockType(contentState, EditorState.createWithContent(contentState).getSelection(), "header-one");
                    editorState = EditorState.createWithContent(contentState);
                }
                onEditorStateChange(editorState);
                setContentEditing(true);
                bubblingTextEditing(true);
            }
        }
    }),
    branch(
        ({contentEditing}) => !!contentEditing,
        withGeoStoryEditor
    )
);
