/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import ReactDOM from "react-dom";
import Carousel from "../Carousel";
import DefaultContentToolbar from '../../../contents/ContentToolbar';
import expect from "expect";
import TEST_STORY from "../../../../../test-resources/geostory/sampleStory_1.json";
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext as dragDropContext } from 'react-dnd';
import TestUtils from 'react-dom/test-utils';

const Comp = dragDropContext(HTML5Backend)(Carousel);
const [{contents}] = TEST_STORY.sections.filter(({type})=> type === 'carousel');
describe('Carousel component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Carousel rendering with defaults', () => {
        ReactDOM.render(<Comp/>, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-section-carousel');
        expect(el).toExist();
    });
    it('Carousel render items in view mode', () => {
        ReactDOM.render(<Comp sectionId={'SomeID_carousel'} contentId={'ccol1'}
            contents={contents} mode={'view'} isMapBackground/>, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-section-carousel');
        expect(el).toExist();
        const items = container.querySelectorAll('.carousel-item');
        expect(items.length).toBeTruthy();
        expect(items[0].classList.contains('carousel-item-selected')).toBeTruthy();
        const [card] = container.querySelectorAll('.carousel-item-inner-wrapper');
        const title = card.getElementsByClassName('carousel-item-inner').item(0);
        const index = card.getElementsByClassName('carousel-item-inner-index').item(0);
        expect(title.textContent).toBe('Card one');
        expect(index.textContent).toBe('1');
    });
    it('Carousel render items in edit mode', () => {
        ReactDOM.render(<Comp
            sectionId={'SomeID_carousel'} contentId={'ccol1'}
            contents={contents} mode={'edit'} isMapBackground
            contentToolbar={DefaultContentToolbar}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-section-carousel');
        expect(el).toExist();
        const items = container.querySelectorAll('.carousel-item');
        expect(items.length).toBeTruthy();

        // Carousel toolbar
        const [toolbar] = el.getElementsByClassName('ms-content-toolbar');
        expect(toolbar).toExist();
        const buttons = toolbar.querySelectorAll('.btn-group span button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].querySelector('.glyphicon-plus')).toExist();
        expect(buttons[1].querySelector('.glyphicon-trash')).toExist();

        // Carousel item toolbar
        const itemToolbar = container.querySelector('.items-inner-wrapper .ms-content-toolbar');
        expect(itemToolbar).toBeTruthy();
        const itemButtons = itemToolbar.querySelectorAll('.btn-group span button');
        expect(itemButtons.length).toBe(3);
        expect(itemButtons[0].querySelector('.glyphicon-pencil')).toExist();
        expect(itemButtons[1].querySelector('.glyphicon-trash')).toExist();
        expect(itemButtons[2].querySelector('.glyphicon-map-marker')).toExist();

    });
    it('Carousel render with no map background', () => {
        ReactDOM.render(<Comp
            sectionId={'SomeID_carousel'} contentId={'ccol1'}
            contents={contents} mode={'edit'} isMapBackground={false}
            contentToolbar={DefaultContentToolbar}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-section-carousel');
        expect(el).toExist();
        const items = container.querySelectorAll('.carousel-item');
        expect(items.length).toBeTruthy();

        // Carousel toolbar
        const [toolbar] = el.getElementsByClassName('ms-content-toolbar');
        expect(toolbar).toExist();
        const buttons = toolbar.querySelectorAll('.btn-group span button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].classList.contains('disabled')).toBeTruthy();
        expect(buttons[1].classList.contains('disabled')).toBeFalsy();

        // Carousel item toolbar
        const itemToolbar = container.querySelector('.items-inner-wrapper .ms-content-toolbar');
        expect(itemToolbar).toBeTruthy();
        const itemButtons = itemToolbar.querySelectorAll('.btn-group span button');
        expect(itemButtons.length).toBe(3);
        expect(itemButtons[0].classList.contains('disabled')).toBeFalsy();
        expect(itemButtons[1].classList.contains('disabled')).toBeTruthy();
        expect(itemButtons[2].classList.contains('disabled')).toBeTruthy();

    });

    it('Carousel item on add', () => {
        const secondContent = {
            "id": "ccol2",
            "type": "column",
            "background": {
                "resourceId": "resource_id",
                "type": "map",
                "map": {
                    "layers": [{
                        "type": "vector",
                        "id": "geostory",
                        "features": [
                            {
                                "type": "FeatureCollection",
                                "features": [{
                                    "type": "Feature",
                                    "geometry": null,
                                    "properties": "1",
                                    "style": [{
                                        "id": "2",
                                        "highlight": true,
                                        "iconColor": "cyan",
                                        "iconText": "2",
                                        "iconShape": "circle"
                                    }]
                                }],
                                "contentRefId": "ccol1"
                            },
                            {
                                "type": "FeatureCollection",
                                "features": [],
                                "contentRefId": "ccol2"
                            }
                        ]
                    }]
                }
            },
            "contents": [
                {
                    "id": "car1_col2_content1",
                    "type": "text",
                    "html": "<p>this is some html content</p>"
                },
                {
                    "id": "car1_col2_content2",
                    "type": "media",
                    "lazy": false
                }
            ]
        };
        const _contents = [contents[0], secondContent];
        const action = { add: ()=>{} };
        const spyAdd = expect.spyOn(action, 'add');
        ReactDOM.render(<Comp
            sectionId={'SomeID_carousel'} contentId={'ccol1'}
            contents={_contents} mode={'edit'} isMapBackground
            contentToolbar={DefaultContentToolbar}
            add={action.add}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-section-carousel');
        expect(el).toExist();
        const items = container.querySelectorAll('.carousel-item');
        expect(items.length).toBeTruthy();

        // Carousel toolbar
        const [toolbar] = el.getElementsByClassName('ms-content-toolbar');
        expect(toolbar).toExist();
        const buttons = toolbar.querySelectorAll('.btn-group span button');
        expect(buttons.length).toBe(2);
        const [addButton] = buttons;
        expect(addButton.querySelector('.glyphicon-plus')).toExist();
        TestUtils.Simulate.click(addButton);
        expect(spyAdd).toHaveBeenCalled();
    });
    it('Carousel section on remove', () => {
        const action = { remove: ()=>{} };
        const spyRemove = expect.spyOn(action, 'remove');
        ReactDOM.render(<Comp
            sectionId={'SomeID_carousel'} contentId={'ccol1'}
            contents={contents} mode={'edit'} isMapBackground
            contentToolbar={DefaultContentToolbar}
            remove={action.remove}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-section-carousel');
        expect(el).toExist();
        const items = container.querySelectorAll('.carousel-item');
        expect(items.length).toBeTruthy();

        // Carousel toolbar
        const [toolbar] = el.getElementsByClassName('ms-content-toolbar');
        expect(toolbar).toExist();
        const buttons = toolbar.querySelectorAll('.btn-group span button');
        expect(buttons.length).toBe(2);
        const removeButton = buttons[1];
        expect(removeButton.querySelector('.glyphicon-trash')).toExist();
        TestUtils.Simulate.click(removeButton);
        const confirmDialog = document.querySelector('.modal-dialog');
        expect(confirmDialog.style.display).toNotBe("none");
        const confirmButton = confirmDialog.querySelector('.btn-group .btn');
        TestUtils.Simulate.click(confirmButton);
        expect(spyRemove).toHaveBeenCalled();
        expect(spyRemove.calls[0].arguments[0]).toEqual('sections[{"id":"SomeID_carousel"}]');
    });
    it('Carousel item on remove', () => {
        const action = { remove: ()=>{} };
        const spyRemove = expect.spyOn(action, 'remove');
        ReactDOM.render(<Comp
            sectionId={'SomeID_carousel'} contentId={'ccol1'}
            contents={contents} mode={'edit'} isMapBackground
            contentToolbar={DefaultContentToolbar}
            remove={action.remove}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-section-carousel');
        expect(el).toExist();
        const items = container.querySelectorAll('.carousel-item');
        expect(items.length).toBeTruthy();

        // Carousel item toolbar
        const itemToolbar = container.querySelectorAll('.items-inner-wrapper .ms-content-toolbar');
        expect(itemToolbar.length).toBeTruthy();
        const itemButtons = itemToolbar[1].querySelectorAll('.btn-group span button');
        expect(itemButtons.length).toBe(3);
        const removeButton = itemButtons[1];
        TestUtils.Simulate.click(removeButton);
        const confirmDialog = document.querySelector('.modal-dialog');
        expect(confirmDialog.style.display).toNotBe("none");
        const confirmButton = confirmDialog.querySelector('.btn-group .btn');
        TestUtils.Simulate.click(confirmButton);
        expect(spyRemove).toHaveBeenCalled();
        expect(spyRemove.calls[0].arguments[0]).toEqual('sections[{"id":"SomeID_carousel"}].contents[{"id":"ccol2"}]');
    });
    it('Carousel item on toggle map marker', () => {
        const action = { update: ()=>{} };
        const spyUpdate = expect.spyOn(action, 'update');
        ReactDOM.render(<Comp
            sectionId={'SomeID_carousel'} contentId={'ccol1'}
            contents={contents} mode={'edit'} isMapBackground
            contentToolbar={DefaultContentToolbar}
            update={action.update}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-section-carousel');
        expect(el).toExist();
        const items = container.querySelectorAll('.carousel-item');
        expect(items.length).toBeTruthy();

        // Carousel item toolbar
        const itemToolbar = container.querySelector('.items-inner-wrapper .ms-content-toolbar');
        expect(itemToolbar).toBeTruthy();
        const itemButtons = itemToolbar.querySelectorAll('.btn-group span button');
        expect(itemButtons.length).toBe(3);
        const markerButton = itemButtons[2];
        TestUtils.Simulate.click(markerButton);
        expect(spyUpdate).toHaveBeenCalled();
        const [path1, element1, mode1] = spyUpdate.calls[0].arguments;
        const [path2, element2, mode2] = spyUpdate.calls[1].arguments;
        expect(path1).toEqual('sections[{"id":"SomeID_carousel"}].contents[{"id":"ccol1"}].background.map.mapDrawControl');
        expect(element1).toBeTruthy();
        expect(mode1).toBe('replace');
        expect(path2).toEqual('sections[{"id":"SomeID_carousel"}].contents[{"id":"ccol1"}].background.editMap');
        expect(element2).toBeTruthy();
        expect(mode2).toBe('replace');
    });
    it('Carousel render section default with helper tooltips', () => {
        ReactDOM.render(<Comp
            sectionId={'SomeID_carousel'} contentId={'ccol1'}
            contents={[contents[1]]} mode={'edit'}
            contentToolbar={DefaultContentToolbar}
        />, document.getElementById("container"));
        let container = document.getElementById("container");
        let el = container.querySelector('.ms-section-carousel');
        expect(el).toExist();
        const items = container.querySelectorAll('.carousel-item');
        expect(items.length).toBeTruthy();

        // Default helper tooltip on add button
        const [addButtonInfo] = el.getElementsByClassName('ms-carousel-add-info');
        expect(addButtonInfo).toBeTruthy();
        expect(addButtonInfo.textContent).toBe('geostory.carouselAddItemInfo');

        const _contents = {...contents[1], background: { editMap: true, map: {mapDrawControl: true}}};
        ReactDOM.render(<Comp
            sectionId={'SomeID_carousel'} contentId={'ccol2'}
            contents={[_contents]} mode={'edit'}
            contentToolbar={DefaultContentToolbar}
        />, document.getElementById("container"));
        container = document.getElementById("container");
        el = container.querySelector('.ms-section-carousel');
        expect(el).toExist();

        // Default helper tooltip on edit map background
        const [mediaButtonInfo] = el.getElementsByClassName('ms-carousel-marker-info');
        expect(mediaButtonInfo).toBeTruthy();
        expect(mediaButtonInfo.textContent).toBe('geostory.carouselPlaceMarkerInfo');
    });
});
