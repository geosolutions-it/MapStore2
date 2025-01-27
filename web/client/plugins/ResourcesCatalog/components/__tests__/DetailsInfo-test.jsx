
/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import DetailsInfo from '../DetailsInfo';
import { waitFor } from '@testing-library/react';
import { Simulate } from 'react-dom/test-utils';

describe('DetailsInfo component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<DetailsInfo />, document.getElementById('container'));
        const detailsInfo = document.querySelector('.ms-details-info');
        expect(detailsInfo).toBeTruthy();
    });
    it('should render tabs items', (done) => {
        ReactDOM.render(<DetailsInfo
            tabs={[
                {
                    type: 'tab',
                    id: 'info',
                    labelId: 'Info',
                    items: [
                        {
                            type: 'text',
                            labelId: 'Name',
                            value: 'Resource Name'
                        }
                    ]
                }
            ]}
        />, document.getElementById('container'));
        const detailsInfo = document.querySelector('.ms-details-info');
        expect(detailsInfo).toBeTruthy();
        waitFor(() => document.querySelector('.ms-details-info-fields'))
            .then(() => {
                const detailsInfoFields = document.querySelectorAll('.ms-details-info-fields');
                expect(detailsInfoFields.length).toBe(1);
                expect(detailsInfoFields[0].innerText).toBe('Name\nResource Name');
                done();
            })
            .catch(done);
    });
    it('should allow editing of editable fields and trigger onChange (text)', (done) => {
        ReactDOM.render(<DetailsInfo
            editing
            tabs={[
                {
                    type: 'tab',
                    id: 'info',
                    labelId: 'Info',
                    items: [
                        {
                            type: 'text',
                            editable: true,
                            labelId: 'Name',
                            path: 'name',
                            value: 'Resource Name'
                        }
                    ]
                }
            ]}
            onChange={(value) => {
                try {
                    expect(value).toEqual({ name: 'Resource' });
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById('container'));
        const detailsInfo = document.querySelector('.ms-details-info');
        expect(detailsInfo).toBeTruthy();
        waitFor(() => document.querySelector('.ms-details-info-fields'))
            .then(() => {
                const input = document.querySelector('input');
                Simulate.change(input, { target: { value: 'Resource' }});
            })
            .catch(done);
    });
    it('should allow editing of editable fields and trigger onChange (boolean)', (done) => {
        ReactDOM.render(<DetailsInfo
            editing
            tabs={[
                {
                    type: 'tab',
                    id: 'info',
                    labelId: 'Info',
                    items: [
                        {
                            type: 'boolean',
                            editable: true,
                            labelId: 'Advertised',
                            path: 'advertised',
                            value: false
                        }
                    ]
                }
            ]}
            onChange={(value) => {
                try {
                    expect(value).toEqual({ advertised: true });
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById('container'));
        const detailsInfo = document.querySelector('.ms-details-info');
        expect(detailsInfo).toBeTruthy();
        waitFor(() => document.querySelector('.ms-details-info-fields'))
            .then(() => {
                const input = document.querySelector('input');
                Simulate.change(input, { target: { checked: true }});
            })
            .catch(done);
    });
});
