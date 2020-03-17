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
import ConfigurePluginsStep from '../ConfigurePluginsStep';
import * as TestUtils from 'react-dom/test-utils';

describe('ConfigurePluginsStep component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ConfigurePluginsStep rendering with defaults', () => {
        ReactDOM.render(<ConfigurePluginsStep />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.getElementsByClassName('configure-plugins-step')[0]).toExist();
    });
    it('ConfigurePluginsStep in upload mode', () => {
        ReactDOM.render(<ConfigurePluginsStep uploadEnabled/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.getElementsByClassName('configure-plugins-step-upload')[0]).toExist();
    });
    it('ConfigurePluginsStep extensions have remove tool', () => {
        const plugins = [{
            title: "Extension",
            isExtension: true
        }, {
            title: "Internal",
            isExtension: false
        }];
        ReactDOM.render(<ConfigurePluginsStep allPlugins={plugins}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelectorAll(".glyphicon-trash").length).toBe(1);
    });
    it('ConfigurePluginsStep extensions remove tool asks opening a confirm modal', () => {
        const plugins = [{
            title: "Extension",
            isExtension: true
        }, {
            title: "Internal",
            isExtension: false
        }];
        const actions = {
            showDialog: () => {}
        };
        const spy = expect.spyOn(actions, "showDialog");
        ReactDOM.render(<ConfigurePluginsStep allPlugins={plugins} onShowDialog={spy}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const remove = container.querySelectorAll(".glyphicon-trash")[0];
        TestUtils.Simulate.click(remove);
        expect(spy).toHaveBeenCalled();
    });
    it('ConfigurePluginsStep extensions remove modal can be closed', () => {
        const plugins = [{
            title: "Extension",
            isExtension: true
        }, {
            title: "Internal",
            isExtension: false
        }];
        const actions = {
            showDialog: () => {}
        };
        const spy = expect.spyOn(actions, "showDialog");
        ReactDOM.render(<ConfigurePluginsStep allPlugins={plugins} showDialog={{
            confirmRemovePlugin: true
        }} onShowDialog={spy}/>, document.getElementById("container"));
        expect(document.body.querySelector(".modal-dialog")).toExist();
        const closeButton = document.body.querySelector(".modal-dialog .btn-default");
        TestUtils.Simulate.click(closeButton);
        expect(spy).toHaveBeenCalled();
    });
    it('ConfigurePluginsStep extensions remove modal can be confirmed', () => {
        const plugins = [{
            title: "Extension",
            isExtension: true
        }, {
            title: "Internal",
            isExtension: false
        }];
        const actions = {
            removePlugin: () => {}
        };
        const spy = expect.spyOn(actions, "removePlugin");
        ReactDOM.render(<ConfigurePluginsStep allPlugins={plugins} showDialog={{
            confirmRemovePlugin: true
        }} onRemovePlugin={spy}/>, document.getElementById("container"));
        expect(document.body.querySelector(".modal-dialog")).toExist();
        const confirmButton = document.body.querySelector(".modal-dialog .btn-primary");
        TestUtils.Simulate.click(confirmButton);
        expect(spy).toHaveBeenCalled();
    });
});
