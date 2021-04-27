/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import SharePanel from '../SharePanel';
import ReactTestUtils from 'react-dom/test-utils';

describe("The SharePanel component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('is created with defaults', () => {
        const cmp = ReactDOM.render(<SharePanel getCount={()=>0} shareUrl="www.geo-solutions.it"/>, document.getElementById("container"));
        expect(cmp).toExist();
    });

    it('should be visible', () => {
        const cmpSharePanel = ReactDOM.render(<SharePanel getCount={()=>0} shareUrl="www.geo-solutions.it" isVisible />, document.getElementById("container"));
        expect(cmpSharePanel).toExist();

        const cmpSharePanelDom = ReactDOM.findDOMNode(cmpSharePanel);
        expect(cmpSharePanelDom).toExist();
        expect(cmpSharePanelDom.id).toEqual("share-panel-dialog");

    });

    it('should not be visible', () => {
        const cmpSharePanel = ReactDOM.render(<SharePanel getCount={()=>0} shareUrl="www.geo-solutions.it" isVisible={false} />, document.getElementById("container"));
        expect(cmpSharePanel).toExist();
        const cmpSharePanelDom = ReactDOM.findDOMNode(cmpSharePanel);
        expect(cmpSharePanelDom).toBeFalsy();
    });
    it('test regex parsing for shareEmbeddedUrl generation', () => {
        const cmpSharePanel = ReactDOM.render(<SharePanel selectedTab="embed" getCount={()=>0} shareUrlRegex=".*" shareUrlReplaceString="ABC" shareUrl="www.geo-solutions.it" isVisible={false} />, document.getElementById("container"));
        expect(cmpSharePanel).toExist();
        const parsed = cmpSharePanel.generateUrl("TEST", "(TE)ST", "$1");
        expect(parsed).toBe("TE");
    });
    it('test showAPI flag', () => {
        let cmpSharePanel = ReactDOM.render(<SharePanel selectedTab="embed" showAPI={false} getCount={()=>0} shareUrl="www.geo-solutions.it" isVisible />, document.getElementById("container"));
        expect(cmpSharePanel).toExist();
        let codeEmbed = ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "code");
        expect(codeEmbed.length).toBe(1);
        cmpSharePanel = ReactDOM.render(<SharePanel showAPI getCount={()=>0} shareUrl="www.geo-solutions.it" isVisible />, document.getElementById("container"));
        codeEmbed = ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "code");
        expect(codeEmbed.length).toBe(2);
    });
    it('test hide embedPanel option remove the panel', () => {
        let panel = ReactDOM.render(<SharePanel showAPI={false} getCount={() => 0} shareUrl="www.geo-solutions.it" isVisible />, document.getElementById("container"));
        const thirdTab = document.getElementById('sharePanel-tabs-tab-3');
        ReactTestUtils.Simulate.click(thirdTab);
        expect(panel.state.eventKey).toBe(3);
        let liTags = document.querySelectorAll('li');

        expect(liTags.length).toBe(3);
        expect(document.querySelector('h4').innerHTML).toBe("<span>share.embeddedLinkTitle</span>");

        panel = ReactDOM.render(<SharePanel embedPanel={false} showAPI={false} getCount={() => 0} shareUrl="www.geo-solutions.it" isVisible />, document.getElementById("container"));
        expect(document.getElementById('sharePanel-tabs-tab-3')).toNotExist();
        expect(panel.state.eventKey).toBe(3);
        liTags = document.querySelectorAll('li');
        expect(document.querySelector('h4').innerHTML).toBe("<span>share.directLinkTitle</span>");

    });
    it('test hide advancedSettings in specific tab', () => {
        const advancedSettings = {
            homeButton: true,
            hideInTab: 'embed'
        };
        let panel = ReactDOM.render(<SharePanel showAPI={false} advancedSettings={advancedSettings} getCount={() => 2} shareUrl="www.geo-solutions.it" isVisible />, document.getElementById("container"));
        let liTags = document.querySelectorAll('li');
        expect(liTags.length).toBe(3);
        expect(panel.state.eventKey).toBe(1);
        expect(document.querySelector('h4').innerHTML).toBe("<span>share.directLinkTitle</span>");

        let advancedSettingsPanel = document.querySelector('.mapstore-switch-panel');
        expect(advancedSettingsPanel).toBeTruthy();

        const embedTab = document.getElementById('sharePanel-tabs-tab-3');
        ReactTestUtils.Simulate.click(embedTab);
        expect(panel.state.eventKey).toBe(3);
        expect(document.querySelector('h4').innerHTML).toBe("<span>share.embeddedLinkTitle</span>");
        advancedSettingsPanel = document.querySelector('.mapstore-switch-panel');
        expect(advancedSettingsPanel).toBeFalsy();
    });
    it('test centerAndZoom and marker options in the panel', () => {
        const actions = {
            onUpdateSettings: () => {},
            hideMarker: () => {}
        };
        const spyOnUpdateSettings = expect.spyOn(actions, "onUpdateSettings");
        const spyOnHideMarker = expect.spyOn(actions, "hideMarker");
        let panel = ReactDOM.render(<SharePanel hideMarker={actions.hideMarker} onUpdateSettings={actions.onUpdateSettings} settings={{markerEnabled: false, centerAndZoomEnabled: true}} advancedSettings={{centerAndZoom: true, defaultEnabled: "centerAndZoom"}} shareUrl="www.geo-solutions.it" isVisible />, document.getElementById("container"));
        expect(panel).toBeTruthy();
        const cmpDom = ReactDOM.findDOMNode(panel);
        expect(cmpDom).toBeTruthy();
        const checkBoxes = document.querySelectorAll("input[type=checkbox]");
        const checkBoxCenterAndZoom = checkBoxes[1];
        const checkBoxAddMarker = checkBoxes[2];
        expect(checkBoxCenterAndZoom).toBeTruthy();
        expect(checkBoxCenterAndZoom.checked).toBe(true);
        expect(checkBoxAddMarker).toBeTruthy();
        expect(checkBoxAddMarker.checked).toBe(false);
        ReactTestUtils.Simulate.change(checkBoxAddMarker);
        expect(spyOnUpdateSettings.calls[0].arguments[0]).toEqual({markerEnabled: true, centerAndZoomEnabled: true});
        ReactTestUtils.Simulate.change(checkBoxCenterAndZoom);
        expect(spyOnUpdateSettings).toHaveBeenCalled();
        expect(spyOnUpdateSettings.calls[1].arguments[0]).toEqual({markerEnabled: false, centerAndZoomEnabled: false, bboxEnabled: false});
        expect(spyOnHideMarker).toHaveBeenCalled();
    });
    it('test panel with enable default ', () => {
        const actions = {
            onUpdateSettings: () => {},
            addMarker: () => {}
        };
        const spyOnUpdateSettings = expect.spyOn(actions, "onUpdateSettings");
        const spyAddMarker = expect.spyOn(actions, "addMarker");
        let panel = ReactDOM.render(
            <SharePanel onUpdateSettings={actions.onUpdateSettings} settings={{markerEnabled: false}} shareUrl="www.geo-solutions.it" isVisible={false} />, document.getElementById("container"));
        expect(panel).toBeTruthy();
        panel = ReactDOM.render(<SharePanel settings={{markerEnabled: true}} advancedSettings={{centerAndZoom: true, defaultEnabled: "markerAndZoom"}} onUpdateSettings={actions.onUpdateSettings} addMarker={actions.addMarker} shareUrl="www.geo-solutions.it" isVisible />, document.getElementById("container"));
        expect(panel).toBeTruthy();
        const cmpDom = ReactDOM.findDOMNode(panel);
        expect(cmpDom).toBeTruthy();
        expect(spyOnUpdateSettings).toHaveBeenCalled();
        expect(spyOnUpdateSettings.calls[0].arguments[0]).toEqual({ markerEnabled: true, centerAndZoomEnabled: true, bboxEnabled: false });
        expect(spyAddMarker).toHaveBeenCalled();
    });
});
