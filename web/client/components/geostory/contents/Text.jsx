/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import editableText from './enhancers/editableText';
import { withHandlers, compose, branch} from 'recompose';
import { Modes } from '../../../utils/GeoStoryUtils';

const Text = ({ toggleEditing = () => {}, html }) => {
    return (
        <div className="ms-content"
            onClick={() => toggleEditing(true, html)}
            dangerouslySetInnerHTML={{ __html: html }} />
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
    )


)(Text);
