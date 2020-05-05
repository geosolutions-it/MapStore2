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
import axios from "../../../libs/ajax";

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
        expect(document.body.getElementsByClassName('configure-plugins-step-upload')[0]).toExist();
    });
    it('ConfigurePluginsStep in upload mode can be closed with cancel button', () => {
        const actions = {
            onClose: () => {}
        };
        const spy = expect.spyOn(actions, "onClose");
        ReactDOM.render(<ConfigurePluginsStep uploadEnabled onEnableUpload={spy}/>, document.getElementById("container"));
        const cancelButton = document.body.querySelectorAll(".modal-footer button")[0];
        TestUtils.Simulate.click(cancelButton);
        expect(spy).toHaveBeenCalled();
    });
    it('ConfigurePluginsStep in upload mode install button initially disabled', () => {
        const actions = {
            onUpload: () => {}
        };
        const spy = expect.spyOn(actions, "onUpload");
        ReactDOM.render(<ConfigurePluginsStep uploadEnabled onUpload={spy}/>, document.getElementById("container"));
        const installButton = document.body.querySelectorAll(".modal-footer button")[1];
        TestUtils.Simulate.click(installButton);
        expect(spy).toNotHaveBeenCalled();
    });
    it('ConfigurePluginsStep in upload mode install button enabled if one good file is listed', () => {
        const actions = {
            onUpload: () => {}
        };
        const spy = expect.spyOn(actions, "onUpload");
        ReactDOM.render(<ConfigurePluginsStep uploadEnabled pluginsToUpload={[{name: "My"}]} onUpload={spy}/>, document.getElementById("container"));
        const installButton = document.body.querySelectorAll(".modal-footer button")[1];
        TestUtils.Simulate.click(installButton);
        expect(spy).toHaveBeenCalled();
    });
    it('ConfigurePluginsStep in upload mode install button disabled if no good file is listed', () => {
        const actions = {
            onUpload: () => {}
        };
        const spy = expect.spyOn(actions, "onUpload");
        ReactDOM.render(<ConfigurePluginsStep uploadEnabled pluginsToUpload={[{name: "My", error: "myerror"}]} onUpload={spy}/>, document.getElementById("container"));
        const installButton = document.body.querySelectorAll(".modal-footer button")[1];
        TestUtils.Simulate.click(installButton);
        expect(spy).toNotHaveBeenCalled();
    });
    it('ConfigurePluginsStep in upload mode drop good extension', (done) => {
        const onAddUpload = (files) => {
            expect(files.length).toBe(1);
            expect(files[0].error).toNotExist();
            done();
        };
        ReactDOM.render(<ConfigurePluginsStep uploadEnabled onAddUpload={onAddUpload}/>, document.getElementById("container"));
        const dropZone = document.body.querySelector(".dropzone");
        axios.get("base/web/client/test-resources/plugin.zip", { responseType: "blob" }).then(({ data }) => {
            TestUtils.Simulate.drop(dropZone, {
                dataTransfer: {
                    files: [data]
                }
            });
        });
    });
    it('ConfigurePluginsStep in upload mode drop bad extension', (done) => {
        const onAddUpload = (files) => {
            expect(files.length).toBe(1);
            expect(files[0].error).toExist();
            done();
        };
        ReactDOM.render(<ConfigurePluginsStep uploadEnabled onAddUpload={onAddUpload}/>, document.getElementById("container"));
        const dropZone = document.body.querySelector(".dropzone");
        axios.get("base/web/client/test-resources/extensions/myplugin_no_index.zip", { responseType: "blob" }).then(({ data }) => {
            TestUtils.Simulate.drop(dropZone, {
                dataTransfer: {
                    files: [data]
                }
            });
        });
    });
    it('ConfigurePluginsStep in upload mode user can remove files', (done) => {
        const onRemoveUpload = (idx) => {
            expect(idx).toBe(1);
            done();
        };
        const plugins = [{
            name: "good"
        }, {
            name: "bad",
            error: "myerror"
        }];
        ReactDOM.render(<ConfigurePluginsStep uploadEnabled pluginsToUpload={plugins} onRemoveUpload={onRemoveUpload}/>, document.getElementById("container"));
        const remove = document.body.querySelectorAll(".modal-body .glyphicon-trash")[1];
        TestUtils.Simulate.click(remove);
    });
    it('ConfigurePluginsStep in upload mode files to upload are listed', () => {
        const plugins = [{
            name: "good"
        }, {
            name: "bad",
            error: "myerror"
        }];
        ReactDOM.render(<ConfigurePluginsStep uploadEnabled pluginsToUpload={plugins}/>, document.getElementById("container"));
        const fileList = document.body.querySelectorAll(".uploading-file");
        expect(fileList.length).toBe(2);
        const errors = document.body.querySelectorAll(".glyphicon-warning-sign");
        expect(errors.length).toBe(1);
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
    it('ConfigurePluginsStep description tooltip', () => {
        const plugins = [{
            name: "TestPlugin",
            title: "TestPlugin"
        }];

        ReactDOM.render(<ConfigurePluginsStep descriptionTooltipDelay={0} allPlugins={plugins}/>,
            document.getElementById("container"));
        const descSpan = document.querySelector('.mapstore-side-card-desc > span');
        expect(descSpan).toExist();

        TestUtils.Simulate.focus(descSpan);

        const tooltip = document.getElementById('TestPlugin');
        expect(tooltip).toExist();
        expect(tooltip.getAttribute('role')).toBe('tooltip');
    });
});
