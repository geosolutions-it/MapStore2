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


});
