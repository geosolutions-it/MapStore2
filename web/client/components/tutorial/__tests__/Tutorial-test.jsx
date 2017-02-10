/**
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
const {defaultStyle, introStyle} = require('../style/style');
const assign = require('object-assign');

const rawSteps = [
    {
        title: 'test',
        text: 'test',
        selector: '#test',
        isFixed: false
    },
    {
        title: 'test',
        text: 'test',
        selector: ''
    }
];

const presetList = {
    test: [
        {
            title: 'test',
            text: 'test',
            selector: '#intro-tutorial',
            isFixed: true
        },
        {
            title: 'test',
            text: 'test',
            selector: '#test',
            isFixed: false
        },
        {
            translation: 'test',
            selector: ''
        },
        {
            translation: 'test',
            selector: 'test'
        }
    ],
    noT: [
        {
            selector: '#intro-tutorial',
            isFixed: true
        },
        {
            title: 'test',
            text: 'test',
            selector: '#test',
            isFixed: false
        }
    ]
};

describe("Test the Tutorial component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test component with default', () => {
        const cmp = ReactDOM.render(
            <Tutorial/>, document.getElementById("container"));
        expect(cmp).toExist();

    });

    it('test component on update toggle true', () => {

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
            onReset: () => {
                return true;
            }
        };
        const spyStart = expect.spyOn(actions, 'onStart');

        const cmp = ReactDOM.render(
            <Tutorial actions={actions}/>, document.getElementById("container"));
        expect(cmp).toExist();
        cmp.componentWillUpdate({toggle: true});
        expect(spyStart).toHaveBeenCalled();

    });

    it('test component on update toggle false', () => {

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
            onReset: () => {
                return true;
            }
        };
        const spyStart = expect.spyOn(actions, 'onStart');

        const cmp = ReactDOM.render(
            <Tutorial actions={actions}/>, document.getElementById("container"));
        expect(cmp).toExist();
        cmp.componentWillUpdate({toggle: false});
        expect(spyStart).toNotHaveBeenCalled();

    });

    it('test component on unmounth', () => {

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
            onReset: () => {
                return true;
            }
        };
        const spyReset = expect.spyOn(actions, 'onReset');

        const cmp = ReactDOM.render(
            <Tutorial actions={actions}/>, document.getElementById("container"));
        expect(cmp).toExist();
        cmp.componentWillUnmount();
        expect(spyReset).toHaveBeenCalled();

    });

    it('test component function onTour with a valid object', () => {

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
            onReset: () => {
                return true;
            }
        };

        let tourStep = {
            type: 'test:after',
            action: 'test'
        };

        const error = {
            style: {},
            text: ''
        };

        const spySetup = expect.spyOn(actions, 'onSetup');
        const spyUpdate = expect.spyOn(actions, 'onUpdate');
        const spyStart = expect.spyOn(actions, 'onStart');

        const cmp = ReactDOM.render(
            <Tutorial error={error} actions={actions}/>, document.getElementById("container"));
        expect(cmp).toExist();

        expect(spySetup).toHaveBeenCalled();
        expect(spySetup).toHaveBeenCalledWith([]);

        cmp.onTour(tourStep);
        expect(spyUpdate).toHaveBeenCalled();
        expect(spyUpdate).toHaveBeenCalledWith(tourStep, [], error);

        expect(spyStart).toNotHaveBeenCalled();
    });

    it('test component function onTour without a valid object', () => {

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
            onReset: () => {
                return true;
            }
        };

        let tourStep = {
            type: 'test:before',
            action: 'test'
        };

        const spySetup = expect.spyOn(actions, 'onSetup');
        const spyUpdate = expect.spyOn(actions, 'onUpdate');
        const spyStart = expect.spyOn(actions, 'onStart');

        const cmp = ReactDOM.render(
            <Tutorial actions={actions}/>, document.getElementById("container"));
        expect(cmp).toExist();

        expect(spySetup).toHaveBeenCalled();
        expect(spySetup).toHaveBeenCalledWith([]);

        cmp.onTour(tourStep);
        expect(spyUpdate).toNotHaveBeenCalled();

        cmp.onTour(null);
        expect(spyUpdate).toNotHaveBeenCalled();

        cmp.onTour({});
        expect(spyUpdate).toNotHaveBeenCalled();

        expect(spyStart).toNotHaveBeenCalled();

    });

    it('test component with preset and no selector', () => {
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
            onReset: () => {
                return true;
            }
        };

        const spySetup = expect.spyOn(actions, 'onSetup');

        const cmp = ReactDOM.render(
            <Tutorial showCheckbox={false} preset={'test'} presetList={presetList} actions={actions}/>, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spySetup).toHaveBeenCalled();
        let introText = <div><div>{'test'}</div><div id="tutorial-intro-checkbox-container"/></div>;
        expect(spySetup).toHaveBeenCalledWith([
            assign({}, cmp.props.defaultStep, presetList.test[0], {text: introText, style: introStyle}),
            assign({}, cmp.props.defaultStep, presetList.test[1], {style: defaultStyle})
        ]);

    });

    it('test component with raw steps, preset and no selector', () => {
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
            onReset: () => {
                return true;
            }
        };

        const spySetup = expect.spyOn(actions, 'onSetup');

        const cmp = ReactDOM.render(
            <Tutorial rawSteps={rawSteps} showCheckbox={false} preset={'test'} presetList={presetList} actions={actions}/>, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spySetup).toHaveBeenCalled();
        expect(spySetup).toHaveBeenCalledWith([assign({}, cmp.props.defaultStep, rawSteps[0], {style: defaultStyle})]);

    });

    it('test component with preset, no title and no text', () => {
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
            onReset: () => {
                return true;
            }
        };

        const spySetup = expect.spyOn(actions, 'onSetup');

        const cmp = ReactDOM.render(
            <Tutorial showCheckbox={false} preset={'noT'} presetList={presetList} actions={actions}/>, document.getElementById("container"));
        expect(cmp).toExist();
        expect(spySetup).toHaveBeenCalled();
        let introText = <div><div>{''}</div><div id="tutorial-intro-checkbox-container"/></div>;
        expect(spySetup).toHaveBeenCalledWith([
            assign({}, cmp.props.defaultStep, presetList.test[0], {title: '', text: introText, style: introStyle}),
            assign({}, cmp.props.defaultStep, presetList.test[1], {style: defaultStyle})
        ]);

    });
});
