/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import CatalogServiceSelect from '../datasets/CatalogServiceSelect';

describe('Test CatalogServiceSelect', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the component with defaults', () => {
        ReactDOM.render(<CatalogServiceSelect services={{}} />, document.getElementById("container"));
        expect(document.getElementById('container')).toBeTruthy();
        expect(document.querySelector('input')).toBeTruthy();
        expect(document.querySelector('.glyphicon-plus')).toBeTruthy();
        expect(document.querySelector('.glyphicon-pencil')).toBeTruthy();
    });
    it('keeps edit and delete disabled without permissions', () => {
        ReactDOM.render(<CatalogServiceSelect
            services={{
                csw: {
                    type: 'csw',
                    title: 'CSW',
                    url: 'http://sample.service/catalog'
                }
            }}
            canEdit={false}
            selectedService="csw"
            onDeleteService={() => {}}
        />, document.getElementById("container"));
        expect(document.getElementById('container')).toBeTruthy();
        const serviceButtons = document.querySelectorAll('.ms-catalog-service-btn');
        expect(serviceButtons.length).toBe(2);
        expect(serviceButtons[1].disabled).toBe(true);
        const deleteButton = document.querySelector('.ms-catalog-service-delete-btn');
        expect(deleteButton.disabled).toBe(true);
    });
    it('enables edit and delete with permissions and selected service', () => {
        ReactDOM.render(<CatalogServiceSelect
            services={{
                csw: {
                    type: 'csw',
                    title: 'CSW',
                    url: 'http://sample.service/catalog'
                }
            }}
            canEdit
            selectedService="csw"
            onDeleteService={() => {}}
        />, document.getElementById("container"));
        const serviceButtons = document.querySelectorAll('.ms-catalog-service-btn');
        expect(serviceButtons.length).toBe(2);
        expect(serviceButtons[1].disabled).toBe(false);
        const deleteButton = document.querySelector('.ms-catalog-service-delete-btn');
        expect(deleteButton.disabled).toBe(false);
    });
    it('calls delete service callback', () => {
        const actions = {
            onDeleteService: () => {},
            setShowFilters: () => {}
        };
        const spyOnDelete = expect.spyOn(actions, 'onDeleteService');
        const spyOnSetShowFilters = expect.spyOn(actions, 'setShowFilters');
        ReactDOM.render(<CatalogServiceSelect
            services={{
                csw: {
                    type: 'csw',
                    title: 'CSW',
                    url: 'http://sample.service/catalog'
                }
            }}
            canEdit
            selectedService="csw"
            onDeleteService={actions.onDeleteService}
            setShowFilters={actions.setShowFilters}
        />, document.getElementById("container"));

        const deleteButton = document.querySelector('.ms-catalog-service-delete-btn');
        deleteButton.click();

        expect(spyOnDelete).toHaveBeenCalled();
        expect(spyOnDelete.calls[0].arguments[0]).toBe('csw');
        expect(spyOnSetShowFilters).toHaveBeenCalled();
        expect(spyOnSetShowFilters.calls[0].arguments[0]).toBe(false);
    });


    it('renders select inside InputGroup when all buttons are hidden', () => {
        ReactDOM.render(<CatalogServiceSelect
            services={{
                csw: {
                    type: 'csw',
                    title: 'CSW',
                    url: 'http://sample.service/catalog'
                }
            }}
            selectedService="csw"
            disableServiceSelection
            showServiceAddButton={false}
            showServiceEditButton={false}
            showServiceDeleteButton={false}
        />, document.getElementById('container'));

        expect(document.querySelector('.Select')).toBeTruthy();
        expect(document.querySelector('.input-group')).toBeTruthy();
    });
});
