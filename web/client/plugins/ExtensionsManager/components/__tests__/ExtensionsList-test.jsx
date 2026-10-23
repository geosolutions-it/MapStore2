/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import ExtensionsList from '../ExtensionsList';

const textsOf = selector => [...document.querySelectorAll(selector)].map(node => node.textContent);

describe('ExtensionsList component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('shows an empty state without extensions', () => {
        ReactDOM.render(<ExtensionsList />, document.getElementById('container'));
        expect(document.querySelectorAll('.ms-extensions-list-entry').length).toBe(0);
        expect(document.querySelector('.glyphicon-plug')).toExist();
    });
    it('shows title, name, description and version of each extension, in order', () => {
        const extensions = [
            { name: 'PrivacySettings', title: 'Privacy settings', description: 'Policy pages', version: '1.0.0' },
            { name: 'Sample', title: 'Sample', description: '', version: '' }
        ];
        ReactDOM.render(<ExtensionsList extensions={extensions} />, document.getElementById('container'));
        expect(document.querySelectorAll('.ms-extensions-list-entry').length).toBe(2);
        expect(textsOf('.ms-extension-title')).toEqual(['Privacy settings', 'Sample']);
        expect(textsOf('.ms-extension-name')).toEqual(['PrivacySettings', 'Sample']);
        expect(textsOf('.ms-extension-description')).toEqual(['Policy pages', '']);
        expect(textsOf('.ms-extension-version')).toEqual(['1.0.0', '']);
    });
    it('renders the tools of each extension', () => {
        const extensions = [{ name: 'A', title: 'A' }, { name: 'B', title: 'B' }];
        ReactDOM.render(<ExtensionsList extensions={extensions} renderTools={extension => <button className="tool">{extension.name}</button>} />,
            document.getElementById('container'));
        expect(textsOf('button.tool')).toEqual(['A', 'B']);
    });
});
