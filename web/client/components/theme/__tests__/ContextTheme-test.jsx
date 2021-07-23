/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ContextTheme from '../ContextTheme';

describe('ContextTheme', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with default props', () => {
        ReactDOM.render(<ContextTheme />, document.getElementById("container"));
        const contextStyles = document.querySelectorAll('[data-ms-context-theme]');
        expect(contextStyles.length).toBe(0);
    });

    it('should render a link tag when a theme object is declared', () => {
        ReactDOM.render(
            <ContextTheme
                theme={
                    {
                        id: 'dark',
                        type: 'link',
                        href: 'path/to/dark.css'
                    }
                }
            />,
            document.getElementById("container")
        );
        const contextStyles = document.querySelectorAll('[data-ms-context-theme]');
        expect(contextStyles.length).toBe(1);
        expect(contextStyles[0].getAttribute('href')).toBe('path/to/dark.css');
    });

    it('should render a link tag with version', () => {
        ReactDOM.render(
            <ContextTheme
                version="DEV"
                theme={
                    {
                        id: 'dark',
                        type: 'link',
                        href: 'path/to/dark.css'
                    }
                }
            />,
            document.getElementById("container")
        );
        const contextStyles = document.querySelectorAll('[data-ms-context-theme]');
        expect(contextStyles.length).toBe(1);
        expect(contextStyles[0].getAttribute('href')).toBe('path/to/dark.css?DEV');

    });

});
