/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ContentEditable from 'react-contenteditable';
import {withState, compose} from 'recompose';

const manageUpdates = compose(
    withState("text", "setText", ({title}) => title)
);


/**
 * Component used for editing inline a tag html (default div)
 */

const TitleEditable = manageUpdates(({
    text,
    className = "ms-story-title-editable",
    onUpdate = () =>  {},
    setText = () => {}} = {}
) => {
    return (<ContentEditable
        className={className}
        html={text}
        onClick={evt => {
            // avoid trigger select state
            evt.stopPropagation();
        }}
        onChange={evt => {
            setText(evt.target.value);
        }}
        onBlur={(evt) => {
            // this event has no value property
            onUpdate(evt.target.innerText);
        }}
    />);
});


export default TitleEditable;
