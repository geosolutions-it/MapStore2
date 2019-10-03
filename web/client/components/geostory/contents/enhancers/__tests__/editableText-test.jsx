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
import editableText from '../editableText';
import { EMPTY_CONTENT } from '../../../../../utils/GeoStoryUtils';

describe('editableText enhancer', () => {
    let check;

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
        if (check) {
            clearInterval(check);
            check = undefined;
        }
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('rendering with defaults', (done) => {
        const Sink = editableText(createSink( props => {
            expect(props).toExist();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('editor appears when toggleEditing is called', (done) => {
        const Sink = editableText(createSink(props => {
            props.toggleEditing(true, '<p>test</p>');
            check = setInterval(() => {
                const isFocus = document.activeElement && document.activeElement.contentEditable && document.activeElement.className.indexOf("DraftEditor") >= 0;
                if (document.querySelector('.ms-text-editor-wrapper') && isFocus) {
                    clearInterval(check);
                    done();
                }
            }, 20);
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it.skip('save is called and editor is called when blur', (done) => {
        const actions = {
            save: (html) => {
                expect(html.indexOf('<p>test</p>')).toBeGreaterThanOrEqualTo(0);
                done();
            }
        };
        const Sink = editableText(createSink(props => {
            if (!check) {
                props.toggleEditing(true, '<p>test</p>');
            }

            check = setInterval(() => {
                const isFocus = document.activeElement && document.activeElement.contentEditable && document.activeElement.className.indexOf("DraftEditor") >= 0;
                if (document.querySelector('.ms-text-editor-wrapper') && isFocus) {
                    clearInterval(check);
                    document.activeElement.dispatchEvent(new Event('blur'));
                }
            }, 20);
        }));
        ReactDOM.render(<Sink save={actions.save} />, document.getElementById("container"));
    });


    it('when editor is called on blur with empty content', (done) => {
        const actions = {
            save: (html) => {
                expect(html.indexOf(EMPTY_CONTENT)).toBeGreaterThanOrEqualTo(0);
                done();
            }
        };
        const Sink = editableText(createSink(props => {
            if (!check) {
                props.toggleEditing(true, EMPTY_CONTENT);
            }

            check = setInterval(() => {
                const isFocus = document.activeElement && document.activeElement.contentEditable && document.activeElement.className.indexOf("DraftEditor") >= 0;
                if (document.querySelector('.ms-text-editor-wrapper') && isFocus) {
                    clearInterval(check);
                    document.activeElement.dispatchEvent(new Event('blur'));
                }
            }, 20);
        }));
        ReactDOM.render(<Sink save={actions.save} />, document.getElementById("container"));
    });
});
