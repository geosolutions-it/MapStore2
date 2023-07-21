/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';
import expect from 'expect';
import withShareTool, { addSharePanel } from '../withShareTool';

describe('withShareTool enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('withShareTool rendering with defaults', (done) => {
        const Sink = withShareTool(createSink( props => {
            expect(props).toExist();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });

    describe('addSharePanel', () => {
        const FAKE_RESOURCE_PATH = "FAKE_RESOURCE_PATH";
        const FAKE_PATH = "/mapstore/";
        const FAKE_ORIGIN = "http://some-location";
        // "http://some-location/mapstore/#/FAKE_RESOURCE_PATH"
        const FAKE_RESOURCE_URL = `${FAKE_ORIGIN}${FAKE_PATH}#/${FAKE_RESOURCE_PATH}`;
        it('render panel with current window URL', () => {
            const Sink = addSharePanel(createSink(props => {
                expect(props).toExist();
                expect(props.onShare).toExist(true);
            }));
            ReactDOM.render(<Sink
                showShareModal
                editedResource={{}}
                getShareUrl={() => FAKE_RESOURCE_PATH}
            />, document.getElementById("container"));
            const sharePanel = document.querySelector('#sharePanel-tabs');
            expect(sharePanel).toExist('Share panel doesn\'t exist');
            const directLink = sharePanel.querySelector('#sharePanel-tabs-pane-1 .input-link input');
            expect(directLink).toExist('directLink doesn\'t exist');
            expect(directLink.value).toBe(window.location.origin + window.location.pathname + "#/" + FAKE_RESOURCE_PATH);
        });
        it('URL is generated using application path', () => {
            const Sink = addSharePanel(createSink(() => {}));
            ReactDOM.render(<Sink
                showShareModal
                shareApi
                editedResource={{}}
                getShareUrl={() => FAKE_RESOURCE_PATH}
                getLocationObject={() => ({
                    origin: FAKE_ORIGIN,
                    pathname: FAKE_PATH
                })}
            />, document.getElementById("container"));
            const sharePanel = document.querySelector('#sharePanel-tabs');
            expect(sharePanel).toExist('Share panel doesn\'t exist');
            const directLink = sharePanel.querySelector('#sharePanel-tabs-pane-1 .input-link input');
            expect(directLink).toExist('directLink doesn\'t exist');
            expect(directLink.value).toBe(FAKE_RESOURCE_URL);
            expect(directLink.value).toBe("http://some-location/mapstore/#/FAKE_RESOURCE_PATH"); // double check
            document.getElementById('sharePanel-tabs-tab-3').click();
            const codeBlock = document.getElementsByTagName('code')[0];
            expect(codeBlock).toExist();
            const iframeCode = codeBlock.innerText;
            // normal behaviour has the URL (without embedded)
            expect(iframeCode.indexOf(FAKE_RESOURCE_URL)).toBeGreaterThan(0);
        });
        it('Check shareOptions (embedOptions.showTOCToggle)', () => {
            const Sink = addSharePanel(createSink(() => { }));
            ReactDOM.render(<Sink
                showShareModal
                shareApi
                editedResource={{}}
                getShareUrl={() => FAKE_RESOURCE_PATH}
            />, document.getElementById("container"));
            const sharePanel = document.querySelector('#sharePanel-tabs');
            expect(sharePanel).toExist('Share panel doesn\'t exist');
            document.getElementById('sharePanel-tabs-tab-3').click();
            // check if the showTOC is enabled by deafult
            let showTOC = document.querySelector('#sharePanel-tabs .input-link-tools input[type=checkbox]');
            expect(showTOC).toExist();
            ReactDOM.render(<Sink
                shareOptions={{ embedOptions: { showTOCToggle: false } }}
                showShareModal
                shareApi
                editedResource={{}}
                getShareUrl={() => FAKE_RESOURCE_PATH}
            />, document.getElementById("container"));
            document.getElementById('sharePanel-tabs-tab-3').click();
            showTOC = document.querySelector('#sharePanel-tabs .input-link-tools input[type=checkbox]');
            // verify the embedOptions.showTOCToggle has effect on "show TOC" checkbox hiding it
            expect(showTOC).toNotExist();
        });
        it('tests correct shareApiUrl when share api is visible)', () => {
            const VERSION = "VERSION";
            const Sink = addSharePanel(createSink(() => { }));
            ReactDOM.render(<Sink
                showShareModal
                shareApi
                version={VERSION}
                editedResource={{}}
                getShareUrl={() => FAKE_RESOURCE_PATH}
            />, document.getElementById("container"));
            const sharePanel = document.querySelector('#sharePanel-tabs');
            expect(sharePanel).toExist('Share panel doesn\'t exist');
            document.getElementById('sharePanel-tabs-tab-3').click();
            // check if the showTOC is enabled by deafult
            let showTOC = document.querySelector('#sharePanel-tabs .input-link-tools input[type=checkbox]');
            expect(showTOC).toExist();
            ReactDOM.render(<Sink
                showShareModal
                shareApi
                version={VERSION}
                editedResource={{}}
                getShareUrl={() => FAKE_RESOURCE_PATH}
            />, document.getElementById("container"));
            document.getElementById('sharePanel-tabs-tab-3').click();
            const codeAPI = document.querySelectorAll("code")[1];
            const code = codeAPI.innerText;
            const index = code.indexOf("dist/ms2-api.js?VERSION");
            expect(index).toBeGreaterThan(-1);
        });
    });

});
