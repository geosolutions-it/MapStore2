/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import buttonTooltip from '../buttonTooltip';


describe("buttonTooltip enhancer", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates component with defaults', () => {
        const CMP = buttonTooltip(({id}) => <div id={id} />);
        ReactDOM.render(<CMP id="text-cmp"/>, document.getElementById("container"));
        const el = document.getElementById("text-cmp");
        expect(el).toBeTruthy();
    });
    it('creates component with buttonTooltip and disabled props', () => {
        const CMP = buttonTooltip((props) => <div {...props}/>);
        ReactDOM.render(<CMP tooltipShowDelay={0} disabled tooltip={<div>Hello</div>} tooltipTrigger={['click', 'focus', 'hover']} id="text-cmp">TEXT</CMP>, document.getElementById("container"));
        const el = document.getElementById("text-cmp");
        expect(el).toBeTruthy();
        el.click();
        expect(el.getAttribute('aria-describedby')).toBeTruthy();
    });
    it('creates component with buttonTooltip disabled props and noTooltipWhenDisabled', () => {
        const CMP = buttonTooltip((props) => <div {...props}/>);
        ReactDOM.render(<CMP tooltipShowDelay={0} disabled noTooltipWhenDisabled tooltip={<div>Hello</div>} tooltipTrigger={['click', 'focus', 'hover']} id="text-cmp">TEXT</CMP>, document.getElementById("container"));
        const el = document.getElementById("text-cmp");
        expect(el).toBeTruthy();
        el.click();
        expect(el.getAttribute('aria-describedby')).toBeFalsy();
    });

});
