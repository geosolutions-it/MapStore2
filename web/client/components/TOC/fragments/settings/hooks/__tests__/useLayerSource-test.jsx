/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { act } from 'react-dom/test-utils';
import AxiosMockAdapter from 'axios-mock-adapter';
import { waitFor } from '@testing-library/react';

import axios from '../../../../../../libs/ajax';
import { useLayerSource } from '../useLayerSource';

const WFS_DESCRIBE = {
    featureTypes: [{
        typeName: 'workspace:new',
        properties: [{name: 'shared', localType: 'string'}]
    }]
};
const WFS_LAYER = {id: 'layer', type: 'wfs', name: 'workspace:old', url: 'wfs-url'};

let source;
const HookComponent = ({ element, options }) => {
    source = useLayerSource(element, options);
    return null;
};

const render = (element, options = {}) => act(() => {
    ReactDOM.render(<HookComponent element={element} options={options} />, document.getElementById('container'));
});
const edit = (field, value) => {
    act(() => source.fields[field].onEdit());
    act(() => source.fields[field].onChange(value));
};
const confirm = (field) => act(() => source.fields[field].onConfirm());

let mockAxios;

describe('useLayerSource', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
        mockAxios = new AxiosMockAdapter(axios);
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        mockAxios.restore();
    });

    it('exposes the visible fields with the formatted layer values', () => {
        render({type: 'wms', name: 'layer', url: ['url-1', 'url-2'], search: {type: 'wfs', url: 'wfs-url'}});
        expect(Object.keys(source.fields)).toEqual(['name', 'url', 'searchUrl', 'searchTypeName']);
        expect(source.fields.url.value).toBe('url-1, url-2');
        expect(source.fields.searchTypeName.value).toBe('layer');
        expect(source.fields.name.editing).toBe(false);
        expect(source.fields.name.dataQa).toBe('layer-properties-name');
    });

    it('validates an unchanged value and closes without changes', (done) => {
        mockAxios.onGet().reply(200, {featureTypes: [{typeName: 'workspace:old', properties: []}]});
        const onChange = expect.createSpy();
        render(WFS_LAYER, {onChange});
        act(() => source.fields.name.onEdit());
        expect(source.fields.name.editing).toBe(true);
        confirm('name');
        expect(source.fields.name.busy).toBe(true);
        waitFor(() => expect(source.fields.name.editing).toBe(false))
            .then(() => {
                expect(mockAxios.history.get.length).toBe(1);
                expect(onChange).toNotHaveBeenCalled();
                expect(source.fields.name.error).toNotExist();
            })
            .then(() => done(), done);
    });

    it('reports an invalid unchanged value and closes without saving on the second confirmation', (done) => {
        mockAxios.onGet().reply(500);
        const onChange = expect.createSpy();
        render(WFS_LAYER, {onChange});
        act(() => source.fields.name.onEdit());
        confirm('name');
        waitFor(() => expect(source.fields.name.error?.code).toBe('service'))
            .then(() => {
                expect(source.fields.name.editing).toBe(true);
                confirm('name');
                expect(source.fields.name.editing).toBe(false);
                expect(source.fields.name.error).toNotExist();
                expect(onChange).toNotHaveBeenCalled();
                expect(mockAxios.history.get.length).toBe(1);
            })
            .then(() => done(), done);
    });

    it('blocks empty values, also on the second confirmation', () => {
        const onChange = expect.createSpy();
        render(WFS_LAYER, {onChange});
        edit('name', ' ');
        confirm('name');
        expect(source.fields.name.error).toEqual({code: 'required', field: 'name'});
        confirm('name');
        expect(onChange).toNotHaveBeenCalled();
        expect(mockAxios.history.get.length).toBe(0);
    });

    it('validates a field with the current value of the other fields', (done) => {
        mockAxios.onGet().reply(200, WFS_DESCRIBE);
        const onChange = expect.createSpy();
        render(WFS_LAYER, {onChange});
        edit('url', 'new-wfs-url');
        edit('name', 'workspace:new');
        confirm('name');
        expect(source.fields.name.busy).toBe(true);
        waitFor(() => expect(onChange).toHaveBeenCalled())
            .then(() => {
                expect(decodeURIComponent(mockAxios.history.get[0].url)).toContain('new-wfs-url');
                expect(onChange.calls[0].arguments).toEqual([{
                    name: 'workspace:new',
                    fields: [{name: 'shared', type: 'string'}]
                }]);
                expect(source.fields.name.editing).toBe(false);
                expect(source.fields.url.editing).toBe(true);
                expect(source.fields.url.value).toBe('new-wfs-url');
            })
            .then(() => done(), done);
    });

    it('force saves the value on the second confirmation after a validation failure', (done) => {
        mockAxios.onGet().reply(500);
        const onChange = expect.createSpy();
        render(WFS_LAYER, {onChange});
        edit('url', 'bad-url');
        confirm('url');
        waitFor(() => expect(source.fields.url.error?.code).toBe('service'))
            .then(() => {
                expect(source.fields.url.editing).toBe(true);
                expect(onChange).toNotHaveBeenCalled();
                confirm('url');
                expect(mockAxios.history.get.length).toBe(1);
                expect(onChange.calls[0].arguments).toEqual([{url: 'bad-url', fields: undefined}]);
                expect(source.fields.url.editing).toBe(false);
            })
            .then(() => done(), done);
    });

    it('validates again when the value changes after a failure', (done) => {
        mockAxios.onGet().replyOnce(500).onGet().reply(200, WFS_DESCRIBE);
        const onChange = expect.createSpy();
        render(WFS_LAYER, {onChange});
        edit('name', 'workspace:bad');
        confirm('name');
        waitFor(() => expect(source.fields.name.error).toExist())
            .then(() => {
                act(() => source.fields.name.onChange('workspace:new'));
                expect(source.fields.name.error).toNotExist();
                confirm('name');
                return waitFor(() => expect(onChange).toHaveBeenCalled());
            })
            .then(() => {
                expect(mockAxios.history.get.length).toBe(2);
                expect(onChange.calls[0].arguments[0].name).toBe('workspace:new');
                expect(onChange.calls[0].arguments[0].fields.length).toBe(1);
            })
            .then(() => done(), done);
    });

    it('does not force save while a required value of another field is empty', (done) => {
        const onChange = expect.createSpy();
        render({type: 'wms', name: 'layer', url: 'wms-url'}, {onChange});
        edit('url', '');
        edit('name', 'new-layer');
        confirm('name');
        waitFor(() => expect(source.fields.name.error?.code).toBe('required'))
            .then(() => {
                expect(source.fields.name.error.field).toBe('url');
                confirm('name');
                return waitFor(() => expect(source.fields.name.busy).toBe(false));
            })
            .then(() => {
                expect(onChange).toNotHaveBeenCalled();
                expect(mockAxios.history.get.length).toBe(0);
            })
            .then(() => done(), done);
    });

    it('reports the layer name validation errors', (done) => {
        mockAxios.onGet().reply(500);
        const onValidationError = expect.createSpy();
        render(WFS_LAYER, {onValidationError});
        edit('url', 'bad-url');
        confirm('url');
        waitFor(() => expect(source.fields.url.error).toExist())
            .then(() => {
                expect(onValidationError).toNotHaveBeenCalled();
                edit('name', 'workspace:bad');
                confirm('name');
                return waitFor(() => expect(onValidationError).toHaveBeenCalled());
            })
            .then(() => expect(onValidationError.calls[0].arguments[0].code).toBe('service'))
            .then(() => done(), done);
    });

    it('waits for the layer reload and accepts a load error without saving again', (done) => {
        mockAxios.onGet().reply(200, WFS_DESCRIBE);
        const onChange = expect.createSpy();
        const options = {onChange, enableLayerNameEditFeedback: true};
        render(WFS_LAYER, options);
        edit('name', 'workspace:new');
        confirm('name');
        waitFor(() => expect(onChange).toHaveBeenCalled())
            .then(() => {
                expect(source.fields.name.busy).toBe(true);
                render({...WFS_LAYER, name: 'workspace:new', loading: true}, options);
                expect(source.fields.name.busy).toBe(true);
                render({...WFS_LAYER, name: 'workspace:new', loading: false, loadingError: 'Error'}, options);
                expect(source.fields.name.busy).toBe(false);
                expect(source.fields.name.error).toEqual({code: 'load', field: 'name'});
                expect(source.fields.name.editing).toBe(true);
                confirm('name');
                expect(source.fields.name.editing).toBe(false);
                expect(source.fields.name.error).toNotExist();
                expect(onChange.calls.length).toBe(1);
            })
            .then(() => done(), done);
    });

    it('closes after the layer reload succeeds', (done) => {
        mockAxios.onGet().reply(200, WFS_DESCRIBE);
        const onChange = expect.createSpy();
        const options = {onChange, loading: true, enableLayerNameEditFeedback: true};
        render(WFS_LAYER, options);
        edit('name', 'workspace:new');
        confirm('name');
        waitFor(() => expect(onChange).toHaveBeenCalled())
            .then(() => {
                render({...WFS_LAYER, name: 'workspace:new'}, options);
                render({...WFS_LAYER, name: 'workspace:new', loading: false, loadingError: false}, {...options, loading: false});
                expect(source.fields.name.editing).toBe(false);
                expect(source.fields.name.error).toNotExist();
            })
            .then(() => done(), done);
    });

    it('does not wait for the reload of a hidden layer', (done) => {
        mockAxios.onGet().reply(200, WFS_DESCRIBE);
        const onChange = expect.createSpy();
        render({...WFS_LAYER, visibility: false}, {onChange, enableLayerNameEditFeedback: true});
        edit('name', 'workspace:new');
        confirm('name');
        waitFor(() => expect(onChange).toHaveBeenCalled())
            .then(() => {
                expect(source.fields.name.busy).toBe(false);
                expect(source.fields.name.editing).toBe(false);
            })
            .then(() => done(), done);
    });

    it('does not wait for the reload after a forced save', (done) => {
        mockAxios.onGet().reply(500);
        const onChange = expect.createSpy();
        render(WFS_LAYER, {onChange, enableLayerNameEditFeedback: true});
        edit('name', 'workspace:bad');
        confirm('name');
        waitFor(() => expect(source.fields.name.error).toExist())
            .then(() => {
                confirm('name');
                expect(onChange.calls[0].arguments).toEqual([{name: 'workspace:bad', fields: undefined}]);
                expect(source.fields.name.busy).toBe(false);
                expect(source.fields.name.editing).toBe(false);
            })
            .then(() => done(), done);
    });

    it('aligns the fields not in edit mode with the updated layer', () => {
        render(WFS_LAYER);
        edit('name', 'workspace:draft');
        render({...WFS_LAYER, name: 'workspace:external', url: 'external-url'});
        expect(source.fields.url.value).toBe('external-url');
        expect(source.fields.name.value).toBe('workspace:draft');
    });

    it('keeps the confirmed value until the layer is updated', (done) => {
        const onChange = expect.createSpy();
        render({type: 'arcgis', name: '1', url: 'arcgis-url'}, {onChange});
        edit('name', '2');
        confirm('name');
        waitFor(() => expect(onChange).toHaveBeenCalledWith({name: '2'}))
            .then(() => {
                expect(source.fields.name.value).toBe('2');
                render({type: 'arcgis', name: '2', url: 'arcgis-url'}, {onChange});
                expect(source.fields.name.value).toBe('2');
            })
            .then(() => done(), done);
    });
});
