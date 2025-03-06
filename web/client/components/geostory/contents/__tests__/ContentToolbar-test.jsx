/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import ReactTestUtils from 'react-dom/test-utils';
import {includes, castArray} from 'lodash';

import ContentToolbar from '../ContentToolbar';

describe('ContentToolbar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ContentToolbar rendering with defaults', () => {
        ReactDOM.render(<ContentToolbar />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-content-toolbar');
        expect(el).toExist();
    });
    it('ContentToolbar rendering all supported items', () => {
        ReactDOM.render(<ContentToolbar tools={["align", "size", "theme"]}/>, document.getElementById("container"));
        const buttons = document.getElementsByTagName('button');
        expect(buttons).toExist();
        expect(buttons.length).toEqual(3);
    });
    const testItems = [{
        name: "align",
        length: 3,
        totButtons: 1,
        aTag: ["left", "center", "right"]
    },
    {
        name: "size",
        length: 4,
        totButtons: 1,
        aTag: ["small", "medium", "large", "full"]
    },
    {
        name: "theme",
        length: 4,
        totButtons: 1,
        aTag: ["", "bright", "dark", "custom"]
    }];
    testItems.forEach(tool => {
        it(`ContentToolbar rendering ${tool.name} item and click event`, (done) => {
            ReactDOM.render(<ContentToolbar
                tools={[tool.name]}
                update={(t, selected) => {
                    expect(t).toEqual(tool.name);
                    if (tool.name === 'theme') {
                        expect(includes(tool.aTag, selected.value)).toEqual(true);
                    } else {
                        expect(includes(tool.aTag, selected)).toEqual(true);
                    }
                    done();
                }}
            />, document.getElementById("container"));
            const buttons = document.getElementsByTagName('button');
            expect(buttons).toExist();
            expect(buttons.length).toEqual(tool.totButtons);

            const list = document.getElementsByTagName('li');
            expect(list).toExist();
            expect(list.length).toEqual(tool.length, `the ${tool.name} had wrong number of li tags, expect ${list.length} toEqual ${tool.length}`);

            const aTags = document.getElementsByTagName('a');
            expect(aTags).toExist();
            castArray(aTags).forEach((a, i) => {
                ReactTestUtils.Simulate.click(aTags[i]);
            });
        });
    });
    it(`ContentToolbar rendering fit item and handling click event`, (done) => {
        ReactDOM.render(<ContentToolbar
            tools={["fit"]}
            fit="contain"
            update={(t, fitValue) => {
                expect(t).toEqual("fit");
                expect(fitValue).toEqual("cover");
                done();
            }}
        />, document.getElementById("container"));
        const buttons = document.getElementsByTagName('button');
        expect(buttons).toExist();
        expect(buttons.length).toEqual(1);
        ReactTestUtils.Simulate.click(buttons[0]);
    });
    it('should accept object tool', () => {
        const filterOptions = ({ value }) => value !== 'full';
        ReactDOM.render(<ContentToolbar
            tools={[{ id: 'size', filterOptions }]}
        />, document.getElementById('container'));
        const buttons = document.getElementsByTagName('button');
        expect(buttons).toBeTruthy();
        expect(buttons.length).toEqual(1);
        ReactTestUtils.Simulate.click(buttons[0]);
        const menuItems = document.querySelectorAll('.dropdown-menu > li');
        expect(menuItems.length).toBe(3);
    });
    describe('tools', () => {
        // TODO: align, theme, size...
        it(`align`, (done) => {
            ReactDOM.render(<ContentToolbar
                tools={["align"]}
                fit="contain"
                align="center"
                path="TEST_PATH"
            />, document.getElementById("container"));
            const list = document.querySelectorAll('.ms-content-toolbar li a span');
            expect(list).toExist();
            expect(list.length).toBe(3);
            expect(list[0].innerText).toBe("geostory.contentToolbar.leftAlignLabel");
            expect(list[1].innerText).toBe("geostory.contentToolbar.centerAlignLabel");
            expect(list[2].innerText).toBe("geostory.contentToolbar.rightAlignLabel");
            done();
        });
        it(`size`, (done) => {
            ReactDOM.render(<ContentToolbar
                tools={["size"]}
                fit="contain"
                size="full"
                align="center"
                path="TEST_PATH"
            />, document.getElementById("container"));
            const list = document.querySelectorAll('.ms-content-toolbar li a span');
            expect(list).toExist();
            expect(list.length).toBe(4);
            expect(list[0].innerText).toBe("geostory.contentToolbar.smallSizeLabel");
            expect(list[1].innerText).toBe("geostory.contentToolbar.mediumSizeLabel");
            expect(list[2].innerText).toBe("geostory.contentToolbar.largeSizeLabel");
            expect(list[3].innerText).toBe("geostory.contentToolbar.fullSizeLabel");
            done();
        });
        it(`theme`, (done) => {
            ReactDOM.render(<ContentToolbar
                tools={["theme"]}
                fit="contain"
                size="full"
                align="center"
                theme="bright"
                path="TEST_PATH"
            />, document.getElementById("container"));
            const list = document.querySelectorAll('.ms-content-toolbar li a span');
            expect(list).toExist();
            expect(list.length).toBe(4);
            expect(list[0].innerText).toBe("geostory.contentToolbar.defaultThemeLabel");
            expect(list[1].innerText).toBe("geostory.contentToolbar.brightThemeLabel");
            expect(list[2].innerText).toBe("geostory.contentToolbar.darkThemeLabel");
            expect(list[3].innerText).toBe("geostory.contentToolbar.customizeThemeLabel");
            done();
        });
        it(`remove func`, (done) => {
            ReactDOM.render(<ContentToolbar
                tools={["remove"]}
                fit="contain"
                path="TEST_PATH"
                remove={(path) => {
                    expect(path).toEqual("TEST_PATH"); // check remove handler is called with proper path argument
                    done();
                }}
            />, document.getElementById("container"));
            const removeButton = document.querySelector('.ms-content-toolbar button');
            expect(removeButton).toExist();
            ReactTestUtils.Simulate.click(removeButton);
            const confirmDialog = document.querySelector('[role="dialog"]');
            expect(confirmDialog).toExist();

            const buttons = confirmDialog.querySelectorAll('.btn');
            expect(buttons.length).toBe(2);

            ReactTestUtils.Simulate.click(buttons[1]);
        });
        it(`editMedia`, (done) => {
            ReactDOM.render(<ContentToolbar
                tools={["editMedia"]}
                fit="contain"
                path="TEST_PATH"
                editMedia={({path}) => {
                    expect(path).toEqual("TEST_PATH");
                    done();
                }}
            />, document.getElementById("container"));
            const buttons = document.getElementsByTagName('button');
            expect(buttons).toExist();
            expect(buttons.length).toEqual(1);
            ReactTestUtils.Simulate.click(buttons[0]);
        });
        it('showCaption', (done) => {
            ReactDOM.render(<ContentToolbar
                tools={["showCaption"]}
                showCaption
                caption="Caption"
                update={(key, value) => {
                    try {
                        expect(key).toBe('showCaption');
                        expect(value).toBe(false);
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById("container"));
            const buttons = document.getElementsByTagName('button');
            expect(buttons).toBeTruthy();
            expect(buttons.length).toBe(1);
            ReactTestUtils.Simulate.click(buttons[0]);
        });
        it('showCaption disabled on edit map', () => {
            ReactDOM.render(<ContentToolbar
                tools={["showCaption"]}
                editMap
                showCaption
                caption="Caption"
            />, document.getElementById("container"));
            const buttons = document.getElementsByTagName('button');
            expect(buttons).toBeTruthy();
            expect(buttons.length).toBe(1);
            expect(buttons[0].classList.contains('disabled')).toBe(true);
        });
        it('add', (done) => {
            const action = {
                onAdd() { }
            };
            const spyAdd = expect.spyOn(action, 'onAdd');
            ReactDOM.render(<ContentToolbar
                tools={["add"]}
                add={action.onAdd}
            />, document.getElementById("container"));
            const buttons = document.getElementsByTagName('button');
            expect(buttons).toBeTruthy();
            expect(buttons.length).toBe(1);
            ReactTestUtils.Simulate.click(buttons[0]);
            expect(spyAdd).toHaveBeenCalled();
            const buttonIcon = document.getElementsByClassName('glyphicon-plus');
            expect(buttonIcon.length).toBe(1);
            done();
        });
        it('add disable on editMap or force disabled', (done) => {
            ReactDOM.render(<ContentToolbar
                tools={["add"]}
                editMap
            />, document.getElementById("container"));
            let buttons = document.getElementsByTagName('button');
            expect(buttons).toBeTruthy();
            expect(buttons.length).toBe(1);
            expect(buttons[0].classList.contains('disabled')).toBe(true);

            ReactDOM.render(<ContentToolbar
                tools={["add"]}
                addDisabled
            />, document.getElementById("container"));
            buttons = document.getElementsByTagName('button');
            expect(buttons).toBeTruthy();
            expect(buttons.length).toBe(1);
            expect(buttons[0].classList.contains('disabled')).toBe(true);
            done();
        });
        it('edit', (done) => {
            const action = {
                onEdit() { }
            };
            const spyEdit = expect.spyOn(action, 'onEdit');
            ReactDOM.render(<ContentToolbar
                tools={["edit"]}
                edit={action.onEdit}
            />, document.getElementById("container"));
            const buttons = document.getElementsByTagName('button');
            expect(buttons).toBeTruthy();
            expect(buttons.length).toBe(1);
            ReactTestUtils.Simulate.click(buttons[0]);
            expect(spyEdit).toHaveBeenCalled();
            expect(spyEdit).toHaveBeenCalled();
            const buttonIcon = document.getElementsByClassName('glyphicon-pencil');
            expect(buttonIcon.length).toBe(1);
            done();
        });
        it('edit disable on editMap', (done) => {
            ReactDOM.render(<ContentToolbar
                tools={["edit"]}
                editMap
            />, document.getElementById("container"));
            let buttons = document.getElementsByTagName('button');
            expect(buttons).toBeTruthy();
            expect(buttons.length).toBe(1);
            expect(buttons[0].classList.contains('disabled')).toBe(true);
            done();
        });
        it('marker', (done) => {
            const action = {
                onMarker() { }
            };
            const spyMarker = expect.spyOn(action, 'onMarker');
            ReactDOM.render(<ContentToolbar
                tools={["marker"]}
                marker={action.onMarker}
            />, document.getElementById("container"));
            const buttons = document.getElementsByTagName('button');
            expect(buttons).toBeTruthy();
            expect(buttons.length).toBe(1);
            ReactTestUtils.Simulate.click(buttons[0]);
            expect(spyMarker).toHaveBeenCalled();
            expect(spyMarker).toHaveBeenCalled();
            const buttonIcon = document.getElementsByClassName('glyphicon-map-marker');
            expect(buttonIcon.length).toBe(1);
            done();
        });
        it('marker disable on editMap or force disabled', (done) => {
            ReactDOM.render(<ContentToolbar
                tools={["marker"]}
                editMap
            />, document.getElementById("container"));
            let buttons = document.getElementsByTagName('button');
            expect(buttons).toBeTruthy();
            expect(buttons.length).toBe(1);
            expect(buttons[0].classList.contains('disabled')).toBe(true);

            ReactDOM.render(<ContentToolbar
                tools={["marker"]}
                markerDisabled
            />, document.getElementById("container"));
            buttons = document.getElementsByTagName('button');
            expect(buttons).toBeTruthy();
            expect(buttons.length).toBe(1);
            expect(buttons[0].classList.contains('disabled')).toBe(true);
            done();
        });
        it('closeDraw', (done) => {
            const action = {
                update() { }
            };
            const spyUpdate = expect.spyOn(action, 'update');
            ReactDOM.render(<ContentToolbar
                tools={["closeDraw"]}
                update={action.update}
                editMap
                map ={{resetMapInfo: true}}
            />, document.getElementById("container"));
            const buttons = document.getElementsByTagName('button');
            expect(buttons).toBeTruthy();
            expect(buttons.length).toBe(1);
            ReactTestUtils.Simulate.click(buttons[0]);
            expect(spyUpdate).toHaveBeenCalled();
            expect(spyUpdate.calls.length).toBe(1);
            expect(spyUpdate.calls[0].arguments).toEqual(["editMap", false]);
            const buttonIcon = document.getElementsByClassName('glyphicon-1-close');
            expect(buttonIcon.length).toBe(1);
            done();
        });
        it('closeDraw disable on editMap', (done) => {
            ReactDOM.render(<ContentToolbar
                tools={["closeDraw"]}
            />, document.getElementById("container"));
            let buttons = document.getElementsByTagName('button');
            expect(buttons).toBeTruthy();
            expect(buttons.length).toBe(1);
            expect(buttons[0].classList.contains('disabled')).toBe(true);
            done();
        });
    });

});
