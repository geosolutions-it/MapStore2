/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import editableText from './enhancers/editableText';
import { withHandlers, withProps, compose, branch} from 'recompose';
import localizedProps from '../../misc/enhancers/localizedProps';

import { Modes, SectionTypes, EMPTY_CONTENT } from '../../../utils/GeoStoryUtils';


const Text = ({ placeholder, id, toggleEditing = () => {}, html, contentEditing, mode}) => {
    return (
        <div style={{
            minWidth: "200px",
            minHeight: "40px"
        }}>
            {   // content => render it
                html !== EMPTY_CONTENT && <div
                id={id}
                onClick={() => toggleEditing(true, html)}
                dangerouslySetInnerHTML={{ __html: html }} />}
            {   // no content => render a placeholder
                !contentEditing && (!html || html === EMPTY_CONTENT) && mode === Modes.EDIT &&
            <div
                style={{color: "#cccccc"}}
                id={"placeholder" + id}
                // when opening an empty content by clicking the placeholder, then the "html" should be empty
                onClick={() => toggleEditing(true, html === EMPTY_CONTENT ? "" : html)}
                dangerouslySetInnerHTML={{ __html: `<h1>${placeholder}</h1>` }}
            />
            }
        </div>
    );
};

/**
 * Text Content, editable when mode is 'edit'
 */
export default compose(
    withHandlers({
        save: ({update = () => {}}) => (html) => update('html', html)
    }),
    branch(
        ({ mode }) => mode === Modes.EDIT,
        editableText
    ),
    /*
     * pass the placeholder localized to the text component
     * when contentEditing is false (the only case the placeholder is visible)
    */
    branch(
        ({contentEditing}) => !contentEditing,
        compose(
            withProps(
                ({sectionType, contentEditing}) => {
                    return contentEditing ? {
                        placeholder: ""
                    } : {
                        placeholder: SectionTypes.TITLE === sectionType ? "geostory.builder.defaults.htmlTitlePlaceholder" : "geostory.builder.defaults.htmlPlaceholder"
                    };
                }
            ),
            localizedProps("placeholder")
        )
    ),
)(Text);
