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
        const el = container.querySelector('.ms-geo-carousel');
        expect(el).toExist();
    });
    it('Carousel render items in view mode', () => {
        ReactDOM.render(<Comp sectionId={'SomeID_carousel'} contentId={'ccol1'}
            contents={contents} mode={'view'} isMapBackground/>, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-geo-carousel');
        expect(el).toExist();
        const items = container.querySelectorAll('.ms-geo-carousel-item');
        expect(items.length).toBeTruthy();
        expect(items[0].classList.contains('ms-geo-carousel-item-selected')).toBeTruthy();
        const [card] = container.querySelectorAll('.ms-geo-carousel-item-inner-wrapper');
        const title = card.getElementsByClassName('ms-geo-carousel-item-inner').item(0);
        const index = card.getElementsByClassName('ms-geo-carousel-item-inner-index').item(0);
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
        const el = container.querySelector('.ms-geo-carousel');
        expect(el).toExist();
        const items = container.querySelectorAll('.ms-geo-carousel-item');
        expect(items.length).toBeTruthy();

        // Carousel toolbar
        const [toolbar] = el.getElementsByClassName('ms-content-toolbar');
        expect(toolbar).toExist();
        const buttons = toolbar.querySelectorAll('.btn-group span button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].querySelector('.glyphicon-plus')).toExist();
        expect(buttons[1].querySelector('.glyphicon-trash')).toExist();

        // Carousel item toolbar
        const itemToolbar = container.querySelector('.ms-geo-carousel-item-wrapper .ms-content-toolbar');
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
        const el = container.querySelector('.ms-geo-carousel');
        expect(el).toExist();
        const items = container.querySelectorAll('.ms-geo-carousel-item');
        expect(items.length).toBeTruthy();

        // Carousel toolbar
        const [toolbar] = el.getElementsByClassName('ms-content-toolbar');
        expect(toolbar).toExist();
        const buttons = toolbar.querySelectorAll('.btn-group span button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].classList.contains('disabled')).toBeTruthy();
        expect(buttons[1].classList.contains('disabled')).toBeFalsy();

        // Carousel item toolbar
        const itemToolbar = container.querySelector('.ms-geo-carousel-item-wrapper .ms-content-toolbar');
        expect(itemToolbar).toBeTruthy();
        const itemButtons = itemToolbar.querySelectorAll('.btn-group span button');
        expect(itemButtons.length).toBe(3);
        expect(itemButtons[0].classList.contains('disabled')).toBeFalsy();
        expect(itemButtons[1].classList.contains('disabled')).toBeTruthy();
        expect(itemButtons[2].classList.contains('disabled')).toBeTruthy();

    });

    it('Carousel item on add', () => {
        const _contents = [
            {
                "id": "ccol1",
                "type": "column",
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {type: 'Point', coordinates: [0, 0]}
                }],
                "contents": [
                    {
                        "id": "car1_col1_content1",
                        "type": "text",
                        "html": "<p>this is some html content</p>"
                    },
                    {
                        "id": "car1_col1_content2",
                        "type": "media",
                        "lazy": false
                    }
                ],
                "thumbnail": {
                    "data": "img1.png",
                    "title": "Card one"
                }
            }, {
                "id": "ccol2",
                "type": "column",
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {type: 'Point', coordinates: [0, 0]}
                }],
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
            }];
        const action = { add: ()=>{} };
        const spyAdd = expect.spyOn(action, 'add');
        ReactDOM.render(<Comp
            sectionId={'SomeID_carousel'}
            contentId={'ccol1'}
            contents={_contents}
            mode={'edit'}
            isMapBackground
            contentToolbar={DefaultContentToolbar}
            add={action.add}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-geo-carousel');
        expect(el).toExist();
        const items = container.querySelectorAll('.ms-geo-carousel-item');
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
        const el = container.querySelector('.ms-geo-carousel');
        expect(el).toExist();
        const items = container.querySelectorAll('.ms-geo-carousel-item');
        expect(items.length).toBeTruthy();

        // Carousel toolbar
        const [toolbar] = el.getElementsByClassName('ms-content-toolbar');
        expect(toolbar).toExist();
        const buttons = toolbar.querySelectorAll('.btn-group span button');
        expect(buttons.length).toBe(2);
        const removeButton = buttons[1];
        expect(removeButton.querySelector('.glyphicon-trash')).toExist();
        TestUtils.Simulate.click(removeButton);
        const confirmDialog = document.querySelector('[role="dialog"]');
        expect(confirmDialog).toExist();
        const buttons_ = confirmDialog.querySelectorAll('.btn');
        expect(buttons_.length).toBe(2);
        TestUtils.Simulate.click(buttons_[1]);
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
        const el = container.querySelector('.ms-geo-carousel');
        expect(el).toExist();
        const items = container.querySelectorAll('.ms-geo-carousel-item');
        expect(items.length).toBeTruthy();

        // Carousel item toolbar
        const itemToolbar = container.querySelectorAll('.ms-geo-carousel-item-wrapper .ms-content-toolbar');
        expect(itemToolbar.length).toBeTruthy();
        const itemButtons = itemToolbar[1].querySelectorAll('.btn-group span button');
        expect(itemButtons.length).toBe(3);
        const removeButton = itemButtons[1];
        TestUtils.Simulate.click(removeButton);
        const confirmDialog = document.querySelector('[role="dialog"]');
        expect(confirmDialog).toExist();
        const buttons_ = confirmDialog.querySelectorAll('.btn');
        expect(buttons_.length).toBe(2);
        TestUtils.Simulate.click(buttons_[1]);
        expect(spyRemove).toHaveBeenCalled();
        expect(spyRemove.calls[0].arguments[0]).toEqual('sections[{"id":"SomeID_carousel"}].contents[{"id":"ccol2"}]');
    });
    it('Carousel item on toggle map marker', () => {
        const action = { onEnableDraw: ()=>{} };
        const spyOnEnableDraw = expect.spyOn(action, 'onEnableDraw');
        ReactDOM.render(<Comp
            sectionId={'SomeID_carousel'} contentId={'ccol1'}
            contents={contents} mode={'edit'} isMapBackground
            contentToolbar={DefaultContentToolbar}
            onEnableDraw={action.onEnableDraw}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-geo-carousel');
        expect(el).toExist();
        const items = container.querySelectorAll('.ms-geo-carousel-item');
        expect(items.length).toBeTruthy();

        // Carousel item toolbar
        const itemToolbar = container.querySelector('.ms-geo-carousel-item-wrapper .ms-content-toolbar');
        expect(itemToolbar).toBeTruthy();
        const itemButtons = itemToolbar.querySelectorAll('.btn-group span button');
        expect(itemButtons.length).toBe(3);
        const markerButton = itemButtons[2];
        TestUtils.Simulate.click(markerButton);
        expect(spyOnEnableDraw).toHaveBeenCalled();
    });
    it('Carousel render section default with helper tooltips', () => {

        let content = {
            "id": "ccol2",
            "type": "column",
            "background": {},
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

        ReactDOM.render(<Comp
            sectionId={'SomeID_carousel'} contentId={'ccol1'}
            contents={[content]} mode={'edit'}
            contentToolbar={DefaultContentToolbar}
        />, document.getElementById("container"));
        let container = document.getElementById("container");
        let el = container.querySelector('.ms-geo-carousel');
        expect(el).toExist();
        const items = container.querySelectorAll('.ms-geo-carousel-item');
        expect(items.length).toBeTruthy();

        // Default helper tooltip on add button
        const [addButtonInfo] = el.getElementsByClassName('ms-carousel-add-info');
        expect(addButtonInfo).toBeTruthy();
        expect(addButtonInfo.textContent).toBe('geostory.carouselAddItemInfo');

        content = {
            "id": "ccol2",
            "type": "column",
            "background": {},
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
        ReactDOM.render(<Comp
            sectionId={'SomeID_carousel'} contentId={'ccol2'}
            contents={[content]} mode={'edit'}
            contentToolbar={DefaultContentToolbar}
            isEditMap
            isDrawEnabled
        />, document.getElementById("container"));
        container = document.getElementById("container");
        el = container.querySelector('.ms-geo-carousel');
        expect(el).toExist();

        // Default helper tooltip on edit map background
        const [mediaButtonInfo] = el.getElementsByClassName('ms-carousel-marker-info');
        expect(mediaButtonInfo).toBeTruthy();
        expect(mediaButtonInfo.textContent).toBe('geostory.carouselPlaceMarkerInfo');
    });
});
