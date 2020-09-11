/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import Rule from '../Rule';
import expect from 'expect';

describe('Rule', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with defaults', () => {
        const RuleCard = Rule.DecoratedComponent;
        ReactDOM.render(<RuleCard />, document.getElementById('container'));
        const ruleNode = document.querySelector('.ms-style-rule');
        expect(ruleNode).toBeTruthy();
    });
    it('should add class on drag', () => {
        const RuleCard = Rule.DecoratedComponent;
        ReactDOM.render(<RuleCard isDragging />, document.getElementById('container'));
        const ruleNode = document.querySelector('.ms-style-rule.ms-drop-target');
        expect(ruleNode).toBeTruthy();
    });
    it('should show an alert error with errorId prop', () => {
        const RuleCard = Rule.DecoratedComponent;
        ReactDOM.render(<RuleCard errorId="styleeditor.errorId" />, document.getElementById('container'));
        const alertNode = document.querySelector('.alert');
        expect(alertNode).toBeTruthy();
    });
    it('should show grab handler if draggable is true', () => {
        const RuleCard = Rule.DecoratedComponent;
        ReactDOM.render(<RuleCard draggable />, document.getElementById('container'));
        const grabHandlerNode = document.querySelector('.ms-style-rule-grab-handle');
        expect(grabHandlerNode).toBeTruthy();
    });
});
