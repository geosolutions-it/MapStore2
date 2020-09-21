/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Icons from '../Icons';
import expect from 'expect';

describe('Icons openlayers styles', () => {

    it('test extra getIcon with complete options, no highlight', () => {
        const getIcon = Icons.extra.getIcon;
        const options = {
            style: {
                rotation: 1,
                iconColor: "orange",
                iconShape: "square"
            }
        };
        const styles = getIcon(options);
        expect(styles).toExist();
        expect(styles.length).toBe(2);
        const shadow = styles[0];
        expect(shadow).toExist();
        const shadowImage = shadow.getImage();
        expect(shadowImage.getAnchor()).toEqual([12, 12]);
        expect(shadowImage.getOpacity()).toEqual(1);
        expect(shadowImage.getRotation()).toEqual(1);
        expect(shadowImage.getSize()).toEqual(null);
        const icon = styles[1];
        expect(icon).toExist();
        const iconImage = icon.getImage();
        expect(iconImage).toExist();
        expect(iconImage.getAnchor()).toEqual([18, 46]);
        expect(iconImage.getOpacity()).toEqual(1);
        expect(iconImage.getOrigin()).toEqual([72, 46]);
        expect(iconImage.getRotation()).toEqual(1);
        expect(iconImage.getSize()).toEqual([36, 46]);
        expect(new RegExp("/web/client/components/mapcontrols/annotations/img/markers_default.png").test(iconImage.getSrc())).toEqual(true);
        const iconText = icon.getText();
        expect(iconText).toExist();
        expect(iconText.getFill().getColor()).toEqual("#FFFFFF");
        expect(iconText.getFont()).toEqual("14px FontAwesome");

    });
    it('test extra getIcon with highlight', () => {
        const getIcon = Icons.extra.getIcon;
        const options = {
            style: {
                rotation: 1,
                iconColor: "orange",
                iconShape: "square",
                highlight: true
            }
        };
        const styles = getIcon(options);
        expect(styles).toExist();
        expect(styles.length).toBe(3);
        const highlightStyle = styles[2];
        expect(highlightStyle).toExist();
        const highlightStyleIcon = highlightStyle.getImage();
        expect(highlightStyleIcon).toExist();
        expect(highlightStyleIcon.anchor_).toEqual([0.5, 122]);
    });
    it('test standard getIcon iconUrl, no shadow, no highlight', () => {
        const getIcon = Icons.standard.getIcon;
        const options = {
            style: {
                iconAnchor: [0.5, 0.5],
                anchorXUnits: "fraction",
                anchorYUnits: "fraction",
                rotation: 1,
                size: [14, 14],
                anchorOrigin: "top-left",
                iconUrl: "/assets/img.png"
            }
        };
        const styles = getIcon(options);
        expect(styles).toExist();
        expect(styles.length).toBe(1);
        const icon = styles[0];
        const iconImage = icon.getImage();
        expect(iconImage).toExist();
        expect(iconImage.getAnchor()).toEqual([7, 7]);
        expect(iconImage.getOpacity()).toEqual(1);
        expect(iconImage.getOrigin()).toEqual([0, 0]);
        expect(iconImage.getRotation()).toEqual(1);
        expect(iconImage.getSize()).toEqual([14, 14]);
    });
    it('test standard getIcon iconUrl, yes shadow, yes highlight', () => {
        const getIcon = Icons.standard.getIcon;
        let options = {
            style: {
                iconAnchor: [0.5, 0.5],
                anchorXUnits: "fraction",
                anchorYUnits: "fraction",
                rotation: 1,
                size: [14, 14],
                anchorOrigin: "top-left",
                iconUrl: "/assets/img.png",
                shadowUrl: "/assets/img.png",
                highlight: true
            }
        };
        let styles = getIcon(options);
        expect(styles).toExist();
        expect(styles.length).toBe(3);
        const icon = styles[1];
        const iconImage = icon.getImage();
        expect(iconImage).toExist();
        expect(iconImage.getAnchor()).toEqual([7, 7]);
        expect(iconImage.getOpacity()).toEqual(1);
        expect(iconImage.getOrigin()).toEqual([0, 0]);
        expect(iconImage.getRotation()).toEqual(1);
        expect(iconImage.getSize()).toEqual([14, 14]);
        let highlightStyle = styles[2];
        expect(highlightStyle).toExist();
        let highlightStyleIcon = highlightStyle.getImage();
        expect(highlightStyleIcon).toExist();
        expect(highlightStyleIcon.anchor_).toEqual([0.5, 56]);
        const shadowStyle = styles[0];
        expect(shadowStyle).toExist();
        const shadowStyleImage = shadowStyle.getImage();
        expect(shadowStyleImage).toExist();
        expect(shadowStyleImage.getAnchor()).toEqual([12, 41]);
        expect(new RegExp("/assets/img.png").test(shadowStyleImage.getSrc())).toEqual(true);

        // Icon style size as integer
        options = {
            style: {
                iconAnchor: [0.5, 0.5],
                anchorXUnits: "fraction",
                anchorYUnits: "fraction",
                rotation: 1,
                size: 36,
                anchorOrigin: "top-left",
                iconUrl: "/assets/img.png",
                shadowUrl: "/assets/img.png",
                highlight: true
            }
        };
        styles = getIcon(options);
        expect(styles).toExist();
        highlightStyle = styles[2];
        expect(highlightStyle).toExist();
        highlightStyleIcon = highlightStyle.getImage();
        expect(highlightStyleIcon).toExist();
        expect(highlightStyleIcon.anchor_).toEqual([0.5, 63]);
    });
    it('test standard getIcon iconUrl, anchor pixel', () => {
        const getIcon = Icons.standard.getIcon;
        const options = {
            style: {
                iconAnchor: [2, 2],
                anchorXUnits: "pixels",
                anchorYUnits: "pixels",
                rotation: 1,
                size: [14, 14],
                anchorOrigin: "top-left",
                iconUrl: "/assets/img.png"
            }
        };
        const styles = getIcon(options);
        expect(styles).toExist();
        expect(styles.length).toBe(1);
        const icon = styles[0];
        const iconImage = icon.getImage();
        expect(iconImage).toExist();
        expect(iconImage.getAnchor()).toEqual([2, 2]);
    });
    it('test html icon, not implemented', () => {
        const getIcon = Icons.html.getIcon;
        expect(getIcon()).toNotExist();
    });
});
