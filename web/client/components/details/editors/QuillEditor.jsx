/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css';

export default ({
    detailsText,
    modules = {
        toolbar: [
            [{ 'size': ['small', false, 'large', 'huge'] }, 'bold', 'italic', 'underline', 'blockquote'],
            [{ 'list': 'bullet' }, { 'align': [] }],
            [{ 'color': [] }, { 'background': [] }, 'clean'], ['image', 'link']
        ]
    },
    editorState,
    onUpdate = () => {},
    setContentChanged = () => {}
}) => {
    const [initialUpdate, setInitialUpdate] = React.useState(false);

    React.useEffect(() => {
        onUpdate(detailsText);
        setInitialUpdate(true);
    }, [detailsText]);

    return (
        <div className="ms-quill-details-editor">
            <ReactQuill
                bounds=".ms-quill-details-editor"
                value={editorState || detailsText}
                modules={modules}
                onChange={(details) => {
                    if (initialUpdate && details && details !== '<p><br></p>') {
                        onUpdate(details);
                        setContentChanged(true);
                    }
                }}/>
        </div>
    );
};
