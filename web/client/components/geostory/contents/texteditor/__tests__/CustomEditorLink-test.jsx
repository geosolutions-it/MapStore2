/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import CustomEditorLink from '../CustomEditorLink';

describe('CustomEditorLink', () => {
    let config;
    let translations;
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        config = {
            link: {icon: "", className: "link-class"},
            unlink: {icon: ""},
            options: ['link'],
            inDropdown: true
        };

        translations = {
            "components.controls.link.linkTitle": "",
            "components.controls.link.link": "",
            "components.controls.link.unlink": ""
        };
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render component in dropdown', () => {
        ReactDOM.render(<CustomEditorLink config = {config} translations={translations} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const wrapper = container.querySelector('.rdw-link-wrapper');
        expect(wrapper).toExist();
        expect(wrapper.getAttribute("aria-haspopup")).toBe("true");

        const dropdown = container.querySelector('.rdw-link-dropdown');
        expect(dropdown).toExist();
    });
});
