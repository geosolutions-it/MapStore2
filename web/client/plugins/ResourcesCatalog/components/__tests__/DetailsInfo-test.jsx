
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
    it('should render tabs items and test onSelectTab', (done) => {
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
                },
                {
                    type: 'tab',
                    id: 'info2',
                    labelId: 'Info2',
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
            onSelectTab={(tab) => {
                try {
                    expect(tab).toEqual('info');
                } catch (e) {
                    done(e);
                }
                done();
            }}
            selectedTab="info2"
        />, document.getElementById('container'));
        const detailsInfo = document.querySelector('.ms-details-info');
        expect(detailsInfo).toBeTruthy();
        const tabLink = document.querySelector('.ms-details-info li a');
        Simulate.click(tabLink);
    });

    it('should not render an href that can not be used as a link target', () => {
        ReactDOM.render(<DetailsInfo
            tabs={[{ type: 'tab', id: 'info', labelId: 'Info', items: [
                // eslint-disable-next-line no-script-url
                { type: 'link', label: 'Label', href: 'javascript:void(0)', value: 'value' }
            ] }]}
            selectedTab="info"
        />, document.getElementById('container'));
        expect(document.querySelectorAll('a[href^="javascript:"]').length).toBe(0);
    });
    describe('sanitization', () => {
        it('removes script tags from an html field value', () => {
            window.__detailsInfoScript = undefined;
            ReactDOM.render(<DetailsInfo
                tabs={[{ type: 'tab', id: 'info', labelId: 'Info', items: [
                    { type: 'html', value: '<p>content</p><script>window.__detailsInfoScript = true</script>' }
                ] }]}
                selectedTab="info"
            />, document.getElementById('container'));
            expect(window.__detailsInfoScript).toBe(undefined);
            expect(document.body.innerHTML.indexOf('<script')).toBe(-1);
        });
    });
});

