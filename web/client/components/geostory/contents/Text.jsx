/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import editableText from './enhancers/editableText';
import {withHandlers, compose} from 'recompose';
const Text = ({ toggleEditing = () => {}, html }) => {
    return (
        <div
            onClick={() => toggleEditing(true, html)}
            dangerouslySetInnerHTML={{ __html: html }} />
    );
};
export default compose(
    withHandlers({
        save: ({update = () => {}}) => (html) => update('html', html)
    }),
    editableText
)(Text);
