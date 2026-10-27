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
    it('shows name or title and version of the plugins of each extension', () => {
        const extensions = [
            { name: 'Statistics', title: 'Statistics tools', plugins: [{ name: 'Statistics', title: 'Charts', version: '2.0.0' }, { name: 'StatisticsTable' }] },
            { name: 'Sample', title: 'Sample', plugins: [] }
        ];
        ReactDOM.render(<ExtensionsList extensions={extensions} />, document.getElementById('container'));
        const entries = document.querySelectorAll('.ms-extensions-list-entry');
        expect(entries.length).toBe(2);
        expect([...entries[0].querySelectorAll('.ms-extension-plugin-name')].map(node => node.textContent)).toEqual(['Charts', 'StatisticsTable']);
        expect([...entries[0].querySelectorAll('.ms-extension-plugin-version')].map(node => node.textContent)).toEqual(['2.0.0', '-']);
        expect(entries[1].querySelector('.ms-extension-plugins')).toNotExist();
    });
    it('renders the tools of each extension', () => {
        const extensions = [{ name: 'A', title: 'A' }, { name: 'B', title: 'B' }];
        ReactDOM.render(<ExtensionsList extensions={extensions} renderTools={extension => <button className="tool">{extension.name}</button>} />,
            document.getElementById('container'));
        expect(textsOf('button.tool')).toEqual(['A', 'B']);
    });
    it('shows whether the context creator lists each extension', () => {
        const extensions = [{ name: 'PrivacySettings', title: 'Privacy settings', hidden: true }, { name: 'Sample', title: 'Sample', hidden: false }];
        ReactDOM.render(<ExtensionsList extensions={extensions} />, document.getElementById('container'));
        expect(textsOf('.ms-extensions-list-entry .ms-extension-hidden, .ms-extensions-list-entry .ms-extension-listed'))
            .toEqual(['extensionsManager.hiddenInContextCreator', 'extensionsManager.listedInContextCreator']);
    });
});
