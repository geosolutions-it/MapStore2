/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withState, withHandlers, branch, renderComponent } from "recompose";

import '../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import TextEditor from "../TextEditor";

export default compose(
    withState('editorState', 'onEditorStateChange'),
    withHandlers({
        setTextEditing: ({ textProp = 'html', setTextEditing = () => {}}) => (editing, text) => {
            // TODO: set editing state.
        }
    }),
    branch(({editorState}) => editorState,
        compose(
            withHandlers({
                onBlur: ({ updateText = () => { }, onEditorStateChange = () => {}}) =>  (evt, editorState) => {
                    updateText(editorState.getCurrentContent());
                    onEditorStateChange();
                }
            }),
            renderComponent(TextEditor)
        )
    ) // assume editorState is the flag to trigger editorState
);
