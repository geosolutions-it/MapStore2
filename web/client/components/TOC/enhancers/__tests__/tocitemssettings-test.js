/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import expect from 'expect';
import ReactDOM from 'react-dom';
import { settingsLifecycle } from '../tocItemsSettings';
import TestUtils from 'react-dom/test-utils';

describe("test updateSettingsLifecycle", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test mounted component', () => {
        const testHandlers = {
            onUpdateOriginalSettings: () => {},
            onUpdateInitialSettings: () => {}
        };

        const spyOnUpdateOriginalSettings = expect.spyOn(testHandlers, 'onUpdateOriginalSettings');
        const spyOnUpdateInitialSettings = expect.spyOn(testHandlers, 'onUpdateInitialSettings');

        const Component = settingsLifecycle(() => <div></div>);
        ReactDOM.render(<Component
            element={{}}
            onUpdateOriginalSettings={testHandlers.onUpdateOriginalSettings}
            onUpdateInitialSettings={testHandlers.onUpdateInitialSettings}
        />, document.getElementById("container"));

        expect(spyOnUpdateOriginalSettings).toHaveBeenCalled();
        expect(spyOnUpdateInitialSettings).toHaveBeenCalled();
    });

    it('test mounted retrieve data layer', () => {
        const testHandlers = {
            onRetrieveLayerData: () => {}
        };
        const spyOnRetrieveLayerData = expect.spyOn(testHandlers, 'onRetrieveLayerData');

        const Component = settingsLifecycle(() => <div></div>);

        ReactDOM.render(<Component
            element={{}}
            settings={{expanded: false}}
            onRetrieveLayerData={testHandlers.onRetrieveLayerData}
        />, document.getElementById("container"));

        ReactDOM.render(<Component
            element={{type: 'wms'}}
            settings={{expanded: true}}
            onRetrieveLayerData={testHandlers.onRetrieveLayerData}
        />, document.getElementById("container"));

        expect(spyOnRetrieveLayerData).toHaveBeenCalled();
    });

    it('test mounted retrieve data layer not expanded', () => {
        const testHandlers = {
            onRetrieveLayerData: () => {}
        };
        const spyOnRetrieveLayerData = expect.spyOn(testHandlers, 'onRetrieveLayerData');

        const Component = settingsLifecycle(() => <div></div>);

        ReactDOM.render(<Component
            element={{}}
            settings={{expanded: true}}
            onRetrieveLayerData={testHandlers.onRetrieveLayerData}
        />, document.getElementById("container"));

        ReactDOM.render(<Component
            element={{type: 'wms'}}
            settings={{expanded: true}}
            onRetrieveLayerData={testHandlers.onRetrieveLayerData}
        />, document.getElementById("container"));

        expect(spyOnRetrieveLayerData).toNotHaveBeenCalled();
    });

    it('test mounted retrieve data layer with desc', () => {
        const testHandlers = {
            onRetrieveLayerData: () => {}
        };
        const spyOnRetrieveLayerData = expect.spyOn(testHandlers, 'onRetrieveLayerData');

        const Component = settingsLifecycle(() => <div></div>);

        ReactDOM.render(<Component
            element={{}}
            settings={{expanded: false}}
            onRetrieveLayerData={testHandlers.onRetrieveLayerData}
        />, document.getElementById("container"));

        ReactDOM.render(<Component
            element={{type: 'wms', description: 'description'}}
            settings={{expanded: true}}
            onRetrieveLayerData={testHandlers.onRetrieveLayerData}
        />, document.getElementById("container"));

        expect(spyOnRetrieveLayerData).toNotHaveBeenCalled();
    });

    it('test component update', () => {
        const testHandlers = {
            onUpdateOriginalSettings: () => {},
            onUpdateInitialSettings: () => {},
            onSetTab: () => {}
        };
        const spyOnUpdateOriginalSettings = expect.spyOn(testHandlers, 'onUpdateOriginalSettings');
        const spyOnUpdateInitialSettings = expect.spyOn(testHandlers, 'onUpdateInitialSettings');
        const spyOnSetTab = expect.spyOn(testHandlers, 'onSetTab');

        const Component = settingsLifecycle(() => <div></div>);

        ReactDOM.render(<Component
            initialActiveTab="display"
            settings={{expanded: false}}
            onUpdateOriginalSettings={testHandlers.onUpdateOriginalSettings}
            onUpdateInitialSettings={testHandlers.onUpdateInitialSettings}
            onSetTab={testHandlers.onSetTab}
        />, document.getElementById("container"));

        ReactDOM.render(<Component
            initialActiveTab="display"
            element={{type: 'wms', description: 'description'}}
            settings={{expanded: true}}
            onUpdateOriginalSettings={testHandlers.onUpdateOriginalSettings}
            onUpdateInitialSettings={testHandlers.onUpdateInitialSettings}
            onSetTab={testHandlers.onSetTab}
        />, document.getElementById("container"));

        expect(spyOnUpdateOriginalSettings).toHaveBeenCalled();
        expect(spyOnUpdateInitialSettings).toHaveBeenCalled();
        expect(spyOnSetTab).toHaveBeenCalled();
        expect(spyOnSetTab).toHaveBeenCalledWith("display");
    });

    it('test component on close equal options', () => {
        const testHandlers = {
            onHideSettings: () => {}
        };
        const spyOnHideSettings = expect.spyOn(testHandlers, 'onHideSettings');

        const Component = settingsLifecycle(({onClose}) => <div id="test-close" onClick={() => onClose()}></div>);
        ReactDOM.render(<Component
            onUpdateNode={testHandlers.onUpdateNode}
            originalSettings={{}}
            settings={{node: '0', nodeType: 'layer', options: {}}}
            onHideSettings={testHandlers.onHideSettings}/>, document.getElementById("container"));

        const testClose = document.getElementById('test-close');
        TestUtils.Simulate.click(testClose);

        expect(spyOnHideSettings).toHaveBeenCalled();
    });

    it('test component on close opacity 1.0', () => {
        // opacity 1.0 and opacity undefined are interpreted as equal
        const testHandlers = {
            onHideSettings: () => {}
        };
        const spyOnHideSettings = expect.spyOn(testHandlers, 'onHideSettings');

        const Component = settingsLifecycle(({onClose}) => <div id="test-close" onClick={() => onClose()}></div>);
        ReactDOM.render(<Component
            originalSettings={{}}
            settings={{node: '0', nodeType: 'layer', options: { opacity: 1.0 }}}
            onHideSettings={testHandlers.onHideSettings} />, document.getElementById("container"));

        const testClose = document.getElementById('test-close');
        TestUtils.Simulate.click(testClose);

        expect(spyOnHideSettings).toHaveBeenCalled();
    });

    it('test component hideSettings on new style params', () => {
        const testHandlers = {
            onHideSettings: () => {}
        };
        const spyOnHideSettings = expect.spyOn(testHandlers, 'onHideSettings');

        const Component = settingsLifecycle(({onClose}) => <div id="test-close" onClick={() => onClose()}></div>);
        ReactDOM.render(<Component
            originalSettings={{}}
            settings={{node: '0', nodeType: 'layer', options: { style: 'new-style' }}}
            onHideSettings={testHandlers.onHideSettings} />, document.getElementById("container"));

        const testClose = document.getElementById('test-close');
        TestUtils.Simulate.click(testClose);
        expect(spyOnHideSettings).toHaveBeenCalled();
    });

    it('test component on close with tabCloseActions (forced close)', () => {
        const testHandlers = {
            tabCloseAction: () => {}
        };

        const spyTabCloseAction = expect.spyOn(testHandlers, 'tabCloseAction');

        const tabCloseActions = [
            testHandlers.tabCloseAction
        ];

        const Component = settingsLifecycle(({onClose}) => <div id="test-close" onClick={() => onClose(tabCloseActions)}></div>);
        ReactDOM.render(<Component
            originalSettings={{}}
            settings={{node: '0', nodeType: 'layer', options: { style: 'new-style' }}}
        />, document.getElementById("container"));

        const testClose = document.getElementById('test-close');
        TestUtils.Simulate.click(testClose);
        expect(spyTabCloseAction).toHaveBeenCalled();
    });

    it('test component on close with tabCloseActions but not function (forced close)', () => {
        const testHandlers = {
            tabCloseAction: () => {}
        };

        const spyTabCloseAction = expect.spyOn(testHandlers, 'tabCloseAction');

        const tabCloseActions = [
            "not a function"
        ];

        const Component = settingsLifecycle(({onClose}) => <div id="test-close" onClick={() => onClose(tabCloseActions)}></div>);
        ReactDOM.render(<Component
            originalSettings={{}}
            settings={{node: '0', nodeType: 'layer', options: { style: 'new-style' }}}
        />, document.getElementById("container"));

        const testClose = document.getElementById('test-close');
        TestUtils.Simulate.click(testClose);
        expect(spyTabCloseAction).toNotHaveBeenCalled();
    });

    it('test component on close with arg different from array (forced close)', () => {
        const testHandlers = {
            tabCloseAction: () => {}
        };

        const spyTabCloseAction = expect.spyOn(testHandlers, 'tabCloseAction');

        const tabCloseActions = {
            tabCloseAction: testHandlers.tabCloseAction
        };

        const Component = settingsLifecycle(({onClose}) => <div id="test-close" onClick={() => onClose(tabCloseActions)}></div>);
        ReactDOM.render(<Component
            originalSettings={{}}
            settings={{node: '0', nodeType: 'layer', options: { style: 'new-style' }}}
        />, document.getElementById("container"));

        const testClose = document.getElementById('test-close');
        TestUtils.Simulate.click(testClose);
        expect(spyTabCloseAction).toNotHaveBeenCalled();
    });


});
