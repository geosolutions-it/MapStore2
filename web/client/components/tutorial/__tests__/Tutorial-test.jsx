/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const Tutorial = require('../Tutorial');
const I18N = require('../../I18N/I18N');

const presetList = {
    test: [
        {
            title: 'test',
            text: 'test',
            selector: '#intro-tutorial'
        }
    ]
};

const actions = {
    onSetup: () => {
        return true;
    },
    onStart: () => {
        return true;
    },
    onUpdate: () => {
        return true;
    },
    onDisable: () => {
        return true;
    },
    onReset: () => {
        return true;
    },
    onClose: () => {
        return true;
    }
};

describe("Test the Tutorial component", () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div><div id="container"></div><div id="target"></div></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        expect.restoreSpies();
        setTimeout(done);
    });

    it('test component default actions', () => {
        const cmp = ReactDOM.render(<Tutorial/>, document.getElementById("container"));
        expect(cmp).toExist();

        cmp.props.actions.onSetup();
        cmp.props.actions.onStart();
        cmp.props.actions.onUpdate();
        cmp.props.actions.onDisable();
        cmp.props.actions.onReset();
        cmp.props.actions.onClose();
    });

    it('test component with no steps', () => {
        const spySetup = expect.spyOn(actions, 'onSetup');
        const spyClose = expect.spyOn(actions, 'onClose');
        const spyStart = expect.spyOn(actions, 'onStart');
        const spyUpdate = expect.spyOn(actions, 'onUpdate');

        const cmp = ReactDOM.render(<Tutorial introStyle={{}} defaultStep={{}} showCheckbox={false} actions={actions}/>, document.getElementById("container"));
        expect(cmp).toExist();

        expect(spySetup).toHaveBeenCalled();
        expect(spySetup).toHaveBeenCalledWith('default', [], {}, <div id="tutorial-intro-checkbox-container"/>, {}, {default_tutorial: []});

        const domNode = ReactDOM.findDOMNode(cmp);
        expect(domNode).toExist();
        expect(domNode.children.length).toBe(2);

        const joyridePlaceholder = domNode.getElementsByClassName('tutorial-joyride-placeholder');
        expect(joyridePlaceholder).toExist();
        expect(joyridePlaceholder.length).toBe(1);

        const intro = domNode.getElementsByClassName('tutorial-presentation-position');
        expect(intro).toExist();
        expect(intro.length).toBe(1);

        ReactDOM.render(<Tutorial introStyle={{}} defaultStep={{}} showCheckbox={false} actions={actions}/>, document.getElementById("container"));

        expect(spyClose).toNotHaveBeenCalled();
        expect(spyStart).toNotHaveBeenCalled();

        cmp.onTour();
        expect(spyUpdate).toNotHaveBeenCalled();
    });

    it('test component with preset steps', () => {
        const spySetup = expect.spyOn(actions, 'onSetup');
        const spyClose = expect.spyOn(actions, 'onClose');
        const spyStart = expect.spyOn(actions, 'onStart');
        const spyUpdate = expect.spyOn(actions, 'onUpdate');
        const spyReset = expect.spyOn(actions, 'onReset');

        const cmp = ReactDOM.render(<Tutorial introStyle={{}} error={{}} steps={presetList.test} preset={'test'} presetList={presetList} defaultStep={{}} showCheckbox actions={actions}/>, document.getElementById("container"));
        expect(cmp).toExist();

        expect(spySetup).toHaveBeenCalled();
        expect(spySetup).toHaveBeenCalledWith('default', presetList.test, {}, <div id="tutorial-intro-checkbox-container"><input type="checkbox" id="tutorial-intro-checkbox" className="tutorial-tooltip-intro-checkbox" onChange={cmp.props.actions.onDisable}/><span><I18N.Message msgId={"tutorial.checkbox"}/></span></div>, {}, {default_tutorial: presetList.test, test: presetList.test});

        const domNode = ReactDOM.findDOMNode(cmp);
        expect(domNode).toExist();
        expect(domNode.children.length).toBe(2);

        const joyride = domNode.getElementsByClassName('joyride');
        expect(joyride).toExist();
        expect(joyride.length).toBe(1);

        const intro = domNode.getElementsByClassName('tutorial-presentation-position');
        expect(intro).toExist();
        expect(intro.length).toBe(1);

        ReactDOM.render(<Tutorial toggle introStyle={{}} error={{}} steps={presetList.test} preset={'test'} presetList={presetList} defaultStep={{}} showCheckbox actions={actions}/>, document.getElementById("container"));
        expect(spyStart).toHaveBeenCalled();

        ReactDOM.render(<Tutorial status={'close'} introStyle={{}} error={{}} steps={presetList.test} preset={'test'} presetList={presetList} defaultStep={{}} showCheckbox actions={actions}/>, document.getElementById("container"));
        expect(spyClose).toHaveBeenCalled();

        cmp.onTour({type: 'step:before'});
        expect(spyUpdate).toHaveBeenCalled();
        expect(spyUpdate).toHaveBeenCalledWith({type: 'step:before'}, presetList.test);

        ReactDOM.render(<span/>, document.getElementById("container"));
        expect(spyReset).toHaveBeenCalled();

        const next = cmp.checkFirstValidStep(0, 'next');
        expect(next).toBe(-1);

        const back = cmp.checkFirstValidStep(0, 'back');
        expect(back).toBe(-1);
    });

    it('test component with error on update', () => {
        const spyClose = expect.spyOn(actions, 'onClose');
        const spyStart = expect.spyOn(actions, 'onStart');

        const cmp = ReactDOM.render(<Tutorial status={'error'} steps={presetList.test} preset={'test'} presetList={presetList} defaultStep={{}} showCheckbox actions={actions}/>, document.getElementById("container"));
        expect(cmp).toExist();

        ReactDOM.render(<Tutorial status={'error'} steps={presetList.test} stepIndex={1} preset={'test'} presetList={presetList} defaultStep={{}} showCheckbox actions={actions}/>, document.getElementById("container"));

        expect(spyStart).toNotHaveBeenCalled();
        expect(spyClose).toHaveBeenCalled();
    });

    it('test component with no data on update', () => {
        const spyClose = expect.spyOn(actions, 'onClose');
        const spyStart = expect.spyOn(actions, 'onStart');

        const cmp = ReactDOM.render(<Tutorial steps={presetList.test} preset={'test'} presetList={presetList} defaultStep={{}} showCheckbox actions={actions}/>, document.getElementById("container"));
        expect(cmp).toExist();

        ReactDOM.render(<Tutorial steps={presetList.test} preset={'test'} presetList={presetList} defaultStep={{}} showCheckbox actions={actions}/>, document.getElementById("container"));

        expect(spyStart).toNotHaveBeenCalled();
        expect(spyClose).toNotHaveBeenCalled();
    });

    it('test component with error on update with action', () => {
        const spyStart = expect.spyOn(actions, 'onStart');
        const actionPreset = [
            {
                title: 'test',
                text: 'test',
                selector: '#intro-tutorial'
            },
            {
                title: 'test',
                text: 'test',
                selector: '#target',
                action: {
                    start: {
                        type: 'ACTION'
                    }
                }
            }
        ];

        const cmp = ReactDOM.render(<Tutorial status={'error'} stepIndex={0} steps={actionPreset} preset={'actionPreset'} presetList={{actionPreset}} defaultStep={{}} showCheckbox actions={actions}/>, document.getElementById("container"));
        expect(cmp).toExist();
        ReactDOM.render(<Tutorial status={'error'} steps={actionPreset} stepIndex={1} preset={'actionPreset'} presetList={{actionPreset}} defaultStep={{}} showCheckbox actions={actions}/>, document.getElementById("container"));

        expect(spyStart).toHaveBeenCalled();

        expect(cmp.joyride.state.index).toBe(1);
    });

    it('test component with error on update with action', () => {
        const spyStart = expect.spyOn(actions, 'onStart');
        const actionPreset = [
            {
                title: 'test',
                text: 'test',
                selector: '#intro-tutorial'
            },
            {
                title: 'test',
                text: 'test',
                selector: '#targe',
                action: {
                    start: {
                        type: 'ACTION'
                    }
                }
            },
            {
                title: 'test',
                text: 'test',
                selector: '#target'
            }
        ];

        const cmp = ReactDOM.render(<Tutorial status={'error'} stepIndex={0} steps={actionPreset} preset={'actionPreset'} presetList={{actionPreset}} defaultStep={{}} showCheckbox actions={actions}/>, document.getElementById("container"));
        expect(cmp).toExist();
        ReactDOM.render(<Tutorial status={'error'} steps={actionPreset} stepIndex={1} preset={'actionPreset'} presetList={{actionPreset}} defaultStep={{}} showCheckbox actions={actions}/>, document.getElementById("container"));

        expect(spyStart).toHaveBeenCalled();

    });
});
