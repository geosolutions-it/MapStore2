/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import IntlNumberFormControl from '../../I18N/IntlNumberFormControl';
import {compose, withContext} from 'recompose';

describe('IntlNumberFormControl', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    const intlNumberFormControlWithContext = (intl) => compose(
        withContext({
            intl: {}},
        () => ({
            intl
        })
        ))(IntlNumberFormControl);

    it('checks if the component renders value in default locale', () => {
        const intl = {};
        let formProps = {
            name: "name",
            value: 1899.01
        };
        const InputIntl = intlNumberFormControlWithContext(intl);

        const cmp = ReactDOM.render(
            <InputIntl {...formProps}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const elements = document.querySelectorAll('input');
        expect(elements[0].value).toBe("1,899.01");
    });

    it('checks if the component renders value in DE locale', () => {
        const intl = {locale: "de-DE"};
        const formProps = {
            name: "name",
            value: 1899.01
        };
        const InputIntl = intlNumberFormControlWithContext(intl);
        const cmp = ReactDOM.render(
            <InputIntl {...formProps}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const elements = document.querySelectorAll('input');
        expect(elements[0].value).toBe("1.899,01");
    });

    it('checks if the component renders value in IT locale', () => {
        const intl = {locale: "it-IT"};
        let formProps = {
            name: "name",
            value: 1899.01
        };
        const InputIntl = intlNumberFormControlWithContext(intl);
        const cmp = ReactDOM.render(
            <InputIntl {...formProps}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const elements = document.querySelectorAll('input');
        expect(elements[0].value).toBe("1.899,01");
    });

    it('checks if the component renders value in FR locale', () => {
        const intl = {locale: "fr-FR"};
        let formProps = {
            name: "name",
            value: 1899.01
        };
        const InputIntl = intlNumberFormControlWithContext(intl);
        const cmp = ReactDOM.render(
            <InputIntl {...formProps}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const elements = document.querySelectorAll('input');
        expect(elements[0].value).toEqual("1 899,01");
    });

    it('checks if the component renders value in ES locale', () => {
        const intl = {locale: "es-ES"};
        let formProps = {
            name: "name",
            value: 1899.01
        };
        const InputIntl = intlNumberFormControlWithContext(intl);
        const cmp = ReactDOM.render(
            <InputIntl {...formProps}/>, document.getElementById("container"));
        expect(cmp).toExist();
        const elements = document.querySelectorAll('input');
        expect(elements[0].value).toEqual("1899,01");
    });
});
