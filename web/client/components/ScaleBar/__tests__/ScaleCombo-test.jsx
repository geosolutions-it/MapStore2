/**
 * Copyright 2015, Marko Polovina
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons'),
ScaleCombo = require('../ScaleCombo.jsx'),
expect = require('expect');

describe('This test for ScaleCombo', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    // test DEFAULTS
    it('creates the component with defaults', () => {
        const scalecombo = React.render(<ScaleCombo/>, document.body);
        expect(scalecombo).toExist();

        const scalecomboDom = React.findDOMNode(scalecombo);
        expect(scalecomboDom).toExist();
        expect(scalecomboDom.id).toNotExist();

        const scalecomboMain = scalecomboDom.getElementsByClassName('mapstore-scalebox-combo-main');
        expect(scalecomboMain).toExist();

        const scalecomboMainBtn = scalecomboMain.getElementsByTagName('button');
        expect(scalecomboMainBtn).toExist();

        const scalecomboMainUl = scalecomboMain.getElementsByTagName('ul');
        expect(scalecomboMainUl).toExist();

        const scalecomboMainLi = scalecomboMainUl.getElementsByTagName('li');
        expect(scalecomboMainLi.length).toBeGreaterThan(5);

        const scalecomboBtn = scalecomboDom.getElementsByTagName('button');
        expect(scalecomboBtn).toExist();
        expect(scalecomboBtn.className).toBe('mapstore-scalebox-combo-trigger');
    });

    it('checks if a zoom in on map changes scalecombo value', () => {
        const scalecombo = React.render(<ScaleCombo/>, document.body);
        const scalecomboDom = React.findDOMNode(scalecombo);
        const scalecomboMain = scalecomboDom.getElementsByClassName('mapstore-scalebox-combo-main');
        const scalecomboMainBtn = scalecomboMain.getElementsByTagName('button');
        const scalecomboMainSpan = scalecomboMainBtn.getElementsByTagName('span').item(0);
        
        const firstState = scalecomboMainSpan.innerHTML;
        
        if (leafMap.getMaxZoom() !== leafMap.getZoom())
            leafMap.zoomIn();
        else
            leafMap.zoomOut();

        const secondState = scalecomboMainSpan.innerHTML;
        expect(firstState).not.toBe(secondState);
    });

    it('checks if a click on scalecombo item zooms on a map', () => {
        const scalecombo = React.render(<ScaleCombo/>, document.body);
        const scalecomboDom = React.findDOMNode(scalecombo);
        const scalecomboMain = scalecomboDom.getElementsByClassName('mapstore-scalebox-combo-main');
        const scalecomboMainUl = scalecomboMain.getElementsByTagName('ul');
        const scalecomboMainLi = scalecomboMainUl.getElementsByTagName('li');
        
        var firstItem = scalecomboMainLi.item(0);
        const zoomLevelFirst = leafMap.getZoom();

        if (parseInt(firstItem.getAttribute("data")) === zoomLevelFirst)
            firstItem = scalecomboMainLi.item(1);

        firstItem.click();
        const zoomLevelSecond = leafMap.getZoom();
        
        expect(zoomLevelFirst).not.toBe(zoomLevelSecond);
    });

    // test CUSTOM
    it('checks the custom scalecombo visibility, title, item and glyph', () => {
        const scalebox = {
            getComboItems: function () {
                    var items =  [[15,'1:15'], [14,'1:14'], [13,'1:13'], [12,'1:12']];
                    return items;
            }
        };

        const scalecombo = React.render(<ScaleCombo scalebox={scalebox}/>, document.body);
        const scalecomboDom = React.findDOMNode(scalecombo);
        const scalecomboMain = scalecomboDom.getElementsByClassName('mapstore-scalebox-combo-main');
        const scalecomboMainUl = scalecomboMain.getElementsByTagName('ul');
        const scalecomboMainLi = scalecomboMainUl.getElementsByTagName('li');

        const firstItemData = scalecomboMainLi.item(0).getAttribute("data");
        const firstItemText = scalecomboMainLi.item(0).getElementsByTagName('a')[0].innerHTML;

        expect(firstItemData).toBe("15");
        expect(firstItemText).toBe("1:15");
    });
});