/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const handleResourceData = require('../handleResourceData');

describe('handleResourceData enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('handleResourceData rendering with defaults', (done) => {
        const Sink = handleResourceData(createSink( props => {
            expect(props.onSave).toExist();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('handleResourceData onUpdate', (done) => {
        const Sink = handleResourceData(createSink( props => {
            expect(props).toExist();
            expect(props.onUpdate).toExist();
            expect(props.metadata.name).toBe("TEST");
            if (props.resource.metadata.name === "TEST") {
                props.onUpdate("metadata.name", "NEW_VALUE");
            } else {
                expect(props.resource.metadata.name).toBe("NEW_VALUE");
                done();
            }

        }));
        ReactDOM.render(<Sink resource={{name: "TEST", description: "TEST"}}/>, document.getElementById("container"));
    });
    it('handleResourceData onUpdateLinkedResource', (done) => {
        const Sink = handleResourceData(createSink(props => {
            expect(props).toExist();
            expect(props.onUpdateLinkedResource).toExist();
            expect(props.metadata.name).toBe("TEST");
            if (!props.linkedResources) {
                props.onUpdateLinkedResource("thumbnail", "DATA", "CATEGORY", {tail: "TEST"});
            } else {
                const thumb = props.linkedResources.thumbnail;
                expect(thumb.category).toExist("CATEGORY");
                expect(thumb.data).toExist("DATA");
                expect(thumb.tail).toBe("TEST");
                done();
            }

        }));
        ReactDOM.render(<Sink resource={{ name: "TEST", description: "TEST" }} />, document.getElementById("container"));
    });
    it('handleResourceData confirm dialog', (done) => {
        const Sink = handleResourceData(createSink(props => {
            expect(props).toExist();
            expect(props.onClose).toExist();
            if (props.resource.metadata.name === "TEST") {
                props.onUpdate("metadata.name", "TEST");
                props.onClose();
                setTimeout(() => {
                    const m = document.querySelector('.modal-dialog');
                    expect(m).toExist();
                    done();
                }, 10);
            }


        }));
        ReactDOM.render(<Sink resource={{ name: "TEST", description: "TEST" }} />, document.getElementById("container"));
    });
});
