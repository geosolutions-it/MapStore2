/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useEffect } from 'react';
import Message from '../../I18N/Message';

import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';
import 'codemirror/mode/javascript/javascript';

export default ({onValid, onError, json = {}}) => {
    const [code, setCode] = useState(JSON.stringify(json, true, 2));
    const [error, setError] = useState();
    // parse code and set options
    useEffect(() => {
        try {
            const config = JSON.parse(code);
            setError();
            onValid(config);
        } catch (e) {
            setError(e);
            onError(e);

        }
    }, [code]);
    return (<div className="code-editor">
        <CodeMirror
            value={code}
            onBeforeChange={(_, __, value) => {
                setCode(value);
            }}
            options={{
                theme: 'lesser-dark',
                mode: 'application/json',
                lineNumbers: true,
                styleSelectedText: true,
                indentUnit: 2,
                tabSize: 2
            }} />
        {error && <div className="error-area">
            <div className="error-area-header">
                <Message msgId="contextCreator.configurePlugins.cfgParsingError.title" />
            </div>
            <div className="error-area-body">
                <Message msgId="contextCreator.configurePlugins.cfgParsingError.body" msgParams={{ error: error.message }}>
                    {msg => <pre className="error-msg">{msg}</pre>}
                </Message>
            </div>
        </div>}
    </div>);
};
