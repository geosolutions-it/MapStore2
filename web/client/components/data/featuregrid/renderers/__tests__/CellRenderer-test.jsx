/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import {compose, withContext} from 'recompose';

import CellRenderer from '../CellRenderer';
import booleanFormatter from '../../formatters';
import { set } from '../../../../../utils/ImmutableUtils';


describe('Tests <CellRenderer> component', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    const props = {
        value: null,
        column: {
            key: "Boolean",
            name: "Boolean",
            formatter: booleanFormatter.getFormatter({localType: "boolean"})
        },
        cellMetaData: {
            onDeleteSubRow: () => {}
        },
        rowData: {
            type: "Feature",
            geometry: null,
            properties: {
                Boolean: null
            },
            get: () => null
        }
    };
    const CellRendererWithContext = compose(
        withContext({
            isProperty: () => null,
            isModified: () => null,
            isValid: () => null
        },
        () => ({
            isProperty: () => true,
            isModified: () => false,
            isValid: () => true
        })))(CellRenderer);

    it('should not crash when rendering <CellRenderer> with value=null, using boolean formatter', () => {
        /* Integration Test: CellRenderer & boolean formatter
         * by using the current boolean formatter we ensure that boolean values
         * that are NOT true or false, (i.e. null, undefined) will not throw error
         * because when column.formatter returns undefined, will break the react rule
         * that something must be returned. in particular the renderCellContent of
         * react-data-grid is returning the formatter value
        */
        const comp = ReactDOM.render(<CellRendererWithContext {...props} />, document.getElementById("container"));
        expect(comp).toExist();
    });

    it('should not crash when rendering <CellRenderer> with value=true, using boolean formatter', () => {
        const comp = ReactDOM.render(<CellRendererWithContext {...set("value", true, props)} />, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.querySelectorAll("span")[1].innerHTML).toBe("true");
    });

    it('should not crash when rendering <CellRenderer> with value=false, using boolean formatter', () => {
        const comp = ReactDOM.render(<CellRendererWithContext {...set("value", false, props)} />, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.querySelectorAll("span")[1].innerHTML).toBe("false");
    });

});
