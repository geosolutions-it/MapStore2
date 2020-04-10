/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import CatalogServiceEditor from '../CatalogServiceEditor';

describe('Test CatalogServiceEditor', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('test service format', () => {
        const formatOptions = [{
            label: "image/png8",
            value: "image/png8"
        }, {
            label: "image/jpeg",
            value: "image/jpeg"
        }];
        ReactDOM.render(<CatalogServiceEditor
            services={{
                "csw": {
                    type: "csw",
                    url: "url",
                    title: "csw",
                    format: "image/png8"
                }
            }}
            selectedService="csw"
            formatOptions={formatOptions}
            mode="edit"
            service={{
                url: "url",
                type: "csw",
                title: "csw",
                oldService: "csw",
                showAdvancedSettings: true,
                format: "image/png8"
            }}
        />, document.getElementById("container"));

        const formatFormGroups = [...document.querySelectorAll('.form-group')].filter(fg => {
            const labels = [...fg.querySelectorAll('label')];
            return labels.length === 1 && labels[0].textContent === 'Format';
        });
        expect(formatFormGroups.length).toBe(1);
        const formatSelect = formatFormGroups[0].querySelector('.Select-value-label');
        expect(formatSelect).toExist();
        expect(formatSelect.textContent).toBe('image/png8');
        // expect(formatSelect.props.options).toEqual(formatOptions); TODO: test properties are passed to select
    });
});
