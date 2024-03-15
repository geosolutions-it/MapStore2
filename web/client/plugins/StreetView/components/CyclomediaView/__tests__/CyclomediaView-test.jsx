import React from 'react';
import { act } from 'react-dom/test-utils';
import expect from 'expect';
import { CYCLOMEDIA_CREDENTIALS_REFERENCE } from '../../../constants';

import ReactDOM from 'react-dom';
import CyclomediaView from '../CyclomediaView';
import { setCredentials } from '../../../../../utils/SecurityUtils';

// mock iframe API
const mockProviderSettings = {
    // with scripts, instead of including CDN scripts, we can mock the API
    scripts: `
        <script>
        var StreetSmartApi = {
            ViewerType: {
                PANORAMA: 'PANORAMA'
            },
            init: function (initParams) {
                return window.parent.__cyclomedia__mock__.init(initParams);
            },
            open: function (query, options) {
                return window.parent.__cyclomedia__mock__.open(query, options)
            }
        };
        </script>
    `,
    // here we put empty URL, because we are mocking the API from scripts
    StreetSmartApiURL: ''
};
const testAPIKey = 'test';

describe('Cyclomedia CyclomediaView', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        // set mock credentials
        setCredentials(CYCLOMEDIA_CREDENTIALS_REFERENCE, {username: 'test', password: 'password'});
        // set a default mock
        window.__cyclomedia__mock__ = {
            init: () => new Promise((resolve) => { resolve(); }),
            open: () => new Promise((resolve) => { resolve(); })
        };
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setCredentials(CYCLOMEDIA_CREDENTIALS_REFERENCE, null); // clean credentials
        window.__cyclomedia__mock__ = undefined; // clean mock
        setTimeout(done);
    });

    const emptyStreetView = () => {
        return document.getElementsByClassName('empty-street-view')[0];
    };
    const getIframe = () => {
        return document.getElementsByTagName('iframe')[0];
    };
    it('Test the main lifecycle', (done) => {
        window.__cyclomedia__mock__ = {
            init: (initParams) => {
                // test init params are passed correctly
                expect(initParams.targetElement).toExist();
                expect(initParams.apiKey).toBe(testAPIKey);
                expect(initParams.username).toBe('test');
                expect(initParams.password).toBe('password');

                return new Promise((resolve) => {
                    act(() => {
                        ReactDOM.render(<CyclomediaView location={{properties: {imageId: "TEST_ID"}}} apiKey={testAPIKey} providerSettings={mockProviderSettings}/>, document.getElementById("container"));
                    });
                    // iframe should not be visible until open
                    const iframe = getIframe();
                    expect(iframe).toExist();
                    expect(iframe.style.display).toBe('none');
                    resolve();
                });
            },
            open: (query, options) => {
                // check parameters
                expect(query).toBe('TEST_ID');
                expect(options).toExist();
                expect(options.viewerType).toBe('PANORAMA');
                // iframe should be visible
                const iframe = getIframe();
                expect(iframe.style.display).toBe('block');
                return new Promise((resolve) => {
                    resolve();
                    done();
                });

            }
        };

        const props = {
            apiKey: testAPIKey
        };

        ReactDOM.render(<CyclomediaView {...props} providerSettings={mockProviderSettings}/>, document.getElementById("container"));
        const div = emptyStreetView();
        expect(div).toExist();

    });
    it('srs check for existing projection', () => {
        const props = {
            apiKey: testAPIKey
        };
        ReactDOM.render(<CyclomediaView {...props} providerSettings={{...mockProviderSettings, srs: "EPSG:4326"}}/>, document.getElementById("container"));
        // no error shown.
        const div = emptyStreetView();
        expect(div).toExist();
    });
    it('srs not defined error handling', () => {
        const props = {
            apiKey: testAPIKey
        };
        ReactDOM.render(<CyclomediaView {...props} providerSettings={{...mockProviderSettings, srs: "UNKNOWN"}}/>, document.getElementById("container"));
        // no error shown.
        const div = emptyStreetView();
        expect(div).toNotExist();
        // check alert to exist
        expect(document.querySelector('.alert-danger')).toExist();
    });
});
