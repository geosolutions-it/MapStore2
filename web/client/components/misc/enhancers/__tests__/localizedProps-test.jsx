/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {createSink, withContext, compose} from 'recompose';

import expect from 'expect';
import localizedProps from '../localizedProps';

describe('localizedProps enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('localizedProps for a single message', () => {

        const Sink = compose(
            withContext(
                {messages: {}},
                () => ({
                    messages: { path: { to: { message: "localized" } } }
                })
            ),
            localizedProps("placeholder")
        )(createSink( props => {
            expect(props).toExist();
            expect(props.placeholder).toExist();
            expect(props.placeholder).toBe("localized");
        }));
        ReactDOM.render((<Sink placeholder={"path.to.message"}/>), document.getElementById("container"));
    });

    it('localizedProps for an array of objects', () => {

        const Sink = compose(
            withContext(
                {messages: {}},
                () => ({
                    messages: { path: { to: { msg1: "localized", msg2: "localized2" } } }
                })
            ),
            localizedProps("options")
        )(createSink( props => {
            expect(props).toExist();
            expect(props.options).toExist();
            expect(props.options[0].label).toBe("localized");
            expect(props.options[1].label).toBe("localized2");
        }));
        ReactDOM.render((<Sink options={[{label: "path.to.msg1"}, {label: "path.to.msg2"}]}/>), document.getElementById("container"));
    });

    it('localizedProps for an array of objects with custom property key', () => {

        const Sink = compose(
            withContext(
                {messages: {}},
                () => ({
                    messages: { path: { to: { msg1: "localized", msg2: "localized2" } } }
                })
            ),
            localizedProps("options", "myCustomlabel")
        )(createSink( props => {
            expect(props).toExist();
            expect(props.options).toExist();
            expect(props.options[0].myCustomlabel).toBe("localized");
            expect(props.options[1].myCustomlabel).toBe("localized2");
        }));
        ReactDOM.render((<Sink options={[{myCustomlabel: "path.to.msg1"}, {myCustomlabel: "path.to.msg2"}]}/>), document.getElementById("container"));
    });


    it('localizedProps for an array of messages with wrong name', () => {

        const Sink = compose(
            withContext(
                {messages: {}},
                () => ({
                    messages: { path: { to: { msg1: "localized", msg2: "localized2" } } }
                })
            ),
            localizedProps("options")
        )(createSink( props => {
            expect(props).toExist();
            expect(props.options).toExist();
            expect(props.options[0].label).toBe("");
            expect(props.options[1].label).toBe("");
        }));
        ReactDOM.render((<Sink options={[{wrongName: "path.to.msg1"}, {wrongName: "path.to.msg2"}]}/>), document.getElementById("container"));
    });

    it('localizedProps for an array of messages of type string', () => {

        const Sink = compose(
            withContext(
                {messages: {}, locale: "it-IT"},
                () => ({
                    locale: "it-IT",
                    messages: { path: { to: { msg1: "localized", msg2: "localized2" } } }
                })
            ),
            localizedProps("options")
        )(createSink( props => {
            expect(props).toExist();
            expect(props.options).toExist();
            expect(props.options[0].label).toBe("localized");
            expect(props.options[1].label).toBe("localized2");
        }));
        ReactDOM.render((<Sink options={["path.to.msg1", "path.to.msg2"]}/>), document.getElementById("container"));
    });
    describe('object mode', () => {
        it('localize normal string (render the string)', () => {
            const Sink = compose(
                withContext(
                    {messages: {}, locale: "it-IT"},
                    () => ({
                        locale: "it-IT",
                        messages: { }
                    })
                ),
                localizedProps("options", undefined, "object")
            )(createSink( props => {
                expect(props).toExist();
                expect(props.options).toExist();
                expect(props.options).toBe("localized");
            }));
            ReactDOM.render((<Sink options={"localized"}/>), document.getElementById("container"));
        });
        it('localize with a valid rect element (render the element)', () => {
            const EL = <div>localized</div>;
            const Sink = compose(
                withContext(
                    {messages: {}, locale: "it-IT"},
                    () => ({
                        locale: "it-IT",
                        messages: { }
                    })
                ),
                localizedProps("options", undefined, "object")
            )(createSink( props => {
                expect(props).toExist();
                expect(props.options).toExist();
                expect(props.options).toBe(EL);
            }));
            ReactDOM.render((<Sink options={EL}/>), document.getElementById("container"));
        });
        it('localize object with locale present', () => {
            const localizedString = {
                "en-US": "localized",
                "it-IT": "localized-IT"
            };
            const Sink = compose(
                withContext(
                    {locale: "it-IT", messages: {}},
                    () => ({
                        locale: "it-IT",
                        messages: { }
                    })
                ),
                localizedProps("options", undefined, "object")
            )(createSink( props => {
                expect(props).toExist();
                expect(props.options).toExist();
                expect(props.options).toBe("localized-IT");
            }));
            ReactDOM.render((<Sink options={localizedString}/>), document.getElementById("container"));
        });
        it('localizedProps with mode "object" and default', () => {
            const localizedString = {
                "default": "default",
                "en-US": "localized"
            };
            const Sink = compose(
                withContext(
                    {messages: {}, locale: "it-IT"},
                    () => ({
                        locale: "it-IT",
                        messages: { }
                    })
                ),
                localizedProps("options", undefined, "object")
            )(createSink( props => {
                expect(props).toExist();
                expect(props.options).toExist();
                expect(props.options).toBe("default");
            }));
            ReactDOM.render((<Sink options={localizedString}/>), document.getElementById("container"));
        });
        it('localizedProps with mode "object" using an array', () => {
            const localizedString = {
                "en-US": "localized",
                "it-IT": "localized-IT"
            };
            const localizedString2 = {
                "en-US": "localized2",
                "it-IT": "localized-IT2"
            };
            const options = [{label: localizedString}, {label: localizedString2}];
            const Sink = compose(
                withContext(
                    {locale: "it-IT", messages: {}},
                    () => ({
                        locale: "it-IT",
                        messages: {}
                    })
                ),
                localizedProps("options", "label", "object")
            )(createSink( props => {
                expect(props).toExist();
                expect(props.options).toExist();
                expect(props.options[0].label).toBe("localized-IT");
                expect(props.options[1].label).toBe("localized-IT2");

            }));
            ReactDOM.render((<Sink options={options}/>), document.getElementById("container"));
        });
    });

});
