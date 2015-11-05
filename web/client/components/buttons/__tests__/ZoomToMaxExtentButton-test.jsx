/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var ZoomToMaxExtentButton = require('../ZoomToMaxExtentButton');
var expect = require('expect');

// initializes Redux store
var Provider = require('react-redux').Provider;
var store = require('./../../../examples/myapp/stores/myappstore');

describe('This test for ZoomToMaxExtentButton', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    // test DEFAULTS
    it('test default properties', () => {
        const actions = {};
        const zmeBtn = React.render(
            <Provider store={store}>
                {() => <ZoomToMaxExtentButton actions={actions}/>}
            </Provider>,
            document.body);
        expect(zmeBtn).toExist();

        const zmeBtnNode = React.findDOMNode(zmeBtn);
        expect(zmeBtnNode).toExist();
        expect(zmeBtnNode.id).toBe("mapstore-zoomtomaxextent");

        const buttonMarkup = zmeBtnNode.getElementsByTagName('button');
        expect(buttonMarkup.length > 0).toBe(true);
        expect(buttonMarkup[0].className.indexOf('default') >= 0).toBe(true);
        expect(buttonMarkup[0].innerHTML).toExist();
    });

    it('test glyphicon property', () => {
        const actions = {};
        const zmeBtn = React.render(
            <Provider store={store}>
                {() => <ZoomToMaxExtentButton actions={actions}/>}
            </Provider>,
            document.body);
        expect(zmeBtn).toExist();

        const zmeBtnNode = React.findDOMNode(zmeBtn);
        expect(zmeBtnNode).toExist();
        expect(zmeBtnNode).toExist();
        const icons = zmeBtnNode.getElementsByTagName('span');
        expect(icons.length).toBe(2);
    });

    it('test glyphicon property with text', () => {
        const actions = {};
        const zmeBtn = React.render(
            <Provider store={store}>
                {() => <ZoomToMaxExtentButton glyphicon="info-sign" text="button" actions={actions}/>}
            </Provider>,
            document.body);
        expect(zmeBtn).toExist();

        const zmeBtnNode = React.findDOMNode(zmeBtn);
        expect(zmeBtnNode).toExist();
        expect(zmeBtnNode).toExist();

        const btnItems = zmeBtnNode.getElementsByTagName('span');
        expect(btnItems.length).toBe(4);

        expect(btnItems[0].innerHTML).toBe("");
        expect(btnItems[1].innerHTML).toBe("&nbsp;");
        expect(btnItems[2].innerHTML).toBe("button");
    });

    it('test if click on button launches the proper action', () => {

        let genericTest = function(btnType) {
            let actions = {
                changeMapView: (c, z, mb, ms) => {
                    return {c, z, mb, ms};
                }
            };
            let spy = expect.spyOn(actions, "changeMapView");
            var cmp = React.render(
                <ZoomToMaxExtentButton
                    actions={actions} btnType={btnType}
                    mapConfig={{
                        maxExtent: [-110, -110, 90, 90],
                        zoom: 10,
                        bbox: {
                            crs: 'EPSG:4326',
                            bounds: {
                                minx: "-15",
                                miny: "-15",
                                maxx: "5",
                                maxy: "5"
                            }
                        },
                        size: {
                            height: 100,
                            width: 100
                        }
                    }}
                />
            , document.body);
            expect(cmp).toExist();

            const cmpDom = document.getElementById("mapstore-zoomtomaxextent");
            expect(cmpDom).toExist();

            const buttonMarkup = cmpDom.childNodes[0];
            expect(buttonMarkup).toExist();

            buttonMarkup.click();
            expect(spy.calls.length).toBe(1);
            expect(spy.calls[0].arguments.length).toBe(4);
        };

        genericTest("normal");
        genericTest("image");
    });

    it('creates the component with a ImageButton', () => {
        const actions = {};
        const zmeBtn = React.render(<ZoomToMaxExtentButton btnType="image" actions={actions}/>, document.body);
        expect(zmeBtn).toExist();
        const zmeBtnNode = React.findDOMNode(zmeBtn);
        expect(zmeBtnNode).toExist();

        const buttonMarkup = zmeBtnNode.childNodes[0];
        expect(buttonMarkup).toExist();

        expect(buttonMarkup.localName).toBe("img");
    });
});
