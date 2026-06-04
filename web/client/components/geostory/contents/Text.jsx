/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { branch, compose, withHandlers, withPropsOnChange } from 'recompose';
import SafeHtml from '../../misc/SafeHtml';

import { EMPTY_CONTENT, Modes, SectionTypes } from '../../../utils/GeoStoryUtils';
import localizedProps from '../../misc/enhancers/localizedProps';
import editableText from './enhancers/editableText';

const Text = ({ placeholder, placeholderTag = 'p', id, toggleEditing = () => {}, html, mode}) => {
    const handleClick = (e) => {
        // GeoStory interaction links store navigation data in data-attributes.
        // The inline onclick is stripped by DOMPurify, so we delegate here instead.
        const interactionType = e.target?.dataset?.geostoryInteractionType;
        const interactionParams = e.target?.dataset?.geostoryInteractionParams;
        if (interactionType) {
            window.__geostory_interaction && window.__geostory_interaction(interactionType, interactionParams);
            return;
        }
        toggleEditing(true, html);
    };
    return (
        <div className="ms-text-wrapper">
            {   // content => render it
                html !== EMPTY_CONTENT && <SafeHtml
                    id={id}
                    onClick={handleClick}
                    html={html} />}
            {   // no content => render a placeholder
                (!html || html === EMPTY_CONTENT) && mode === Modes.EDIT &&
            <div
                className="ms-text-placeholder"
                id={"placeholder" + id}
                // when opening an empty content by clicking the placeholder, then the "html" should be empty
                onClick={() => toggleEditing(true, html === EMPTY_CONTENT ? "" : html)}
                /* eslint-disable-next-line react/no-danger -- tag is hardcoded h1/p, placeholder is an i18n string */
                dangerouslySetInnerHTML={{ __html: `<${placeholderTag}>${placeholder}</${placeholderTag}>` }}
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
    compose(
        // this is not rendered if editor is opened, i.e. contentEditing = true
        withPropsOnChange(
            ["sectionType"],
            ({sectionType}) => {
                return {
                    placeholder: SectionTypes.TITLE === sectionType ? "geostory.builder.defaults.htmlTitlePlaceholder" : "geostory.builder.defaults.htmlPlaceholder",
                    placeholderTag: SectionTypes.TITLE === sectionType ? 'h1' : 'p'
                };
            }
        ),
        localizedProps("placeholder")
    )
)(Text);
