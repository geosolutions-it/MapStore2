import React, { forwardRef } from 'react';
import { Controlled } from 'react-codemirror2';

import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/sql/sql';
import "codemirror/theme/material.css";
import "codemirror/mode/xml/xml";
import "codemirror/addon/display/autorefresh";

import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/selection/mark-selection';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint';

import cm from 'codemirror/lib/codemirror';

import geoCssMode from './mode/geocss';
import geoCssHint from './hint/geocss';

geoCssMode(cm);
geoCssHint(cm);

function CodeMirror({ editorDidMount = () => {}, ...props}, ref) {
    return (
        <Controlled
            ref={ref}
            {...props}
            editorDidMount={(...args) => editorDidMount(...args, cm)}
        />
    );
}

export default forwardRef(CodeMirror);
