/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import axios from '../../../../../libs/ajax';
import PropertiesEditor from '../PropertiesEditor';

describe('PropertiesEditor', () => {
    let mockAxios;

    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
        document.body.innerHTML = '<div id="container"></div>';
    });

    afterEach(() => {
        mockAxios.restore();
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
    });

    it('loads non-geometry attributes and updates their visibility', (done) => {
        let attributes;
        mockAxios.onGet().reply(({ url }) => {
            const decodedUrl = decodeURIComponent(url);
            expect(decodedUrl).toContain('/properties-test/wfs');
            expect(decodedUrl).toContain('request=DescribeFeatureType');
            expect(decodedUrl).toContain('typeName=workspace:source');
            return [200, {
                featureTypes: [{
                    properties: [
                        { name: 'name', type: 'xsd:string', localType: 'string' },
                        { name: 'geom', type: 'gml:Point', localType: 'Point' }
                    ]
                }]
            }];
        });

        ReactDOM.render(
            <PropertiesEditor
                sourceLayer={{
                    name: 'workspace:source',
                    url: '/properties-test/wfs'
                }}
                onChange={(nextAttributes) => {
                    attributes = nextAttributes;
                }}/>,
            document.getElementById('container')
        );

        setTimeout(() => {
            try {
                const rows = document.querySelectorAll(
                    '.ms-properties-view-editor .layer-fields-row'
                );
                expect(rows.length).toBe(1);
                expect(rows[0].querySelector('.layer-field-name input').value).toBe('name');

                TestUtils.Simulate.change(
                    rows[0].querySelector('.layer-field-visibility input'),
                    { target: { checked: false } }
                );
                expect(attributes).toEqual([{
                    name: 'name',
                    type: 'string',
                    alias: '',
                    visible: false
                }]);
                done();
            } catch (error) {
                done(error);
            }
        }, 50);
    });
});
