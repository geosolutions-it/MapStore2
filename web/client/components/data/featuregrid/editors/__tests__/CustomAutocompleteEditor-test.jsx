import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import {createCustomPagedUniqueAutompleteStream} from '../../../../../observables/autocomplete';
import CustomAutocompleteEditor from '../CustomAutocompleteEditor';

let testColumn = {
    key: 'columnKey'
};
const value = "1.1";
describe('FeatureGrid CustomAutocompleteEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('CustomAutocompleteEditor Editor no stream provided', () => {
        const cmp = ReactDOM.render(<CustomAutocompleteEditor
            value={value}
            rowIdx={1}
            column={testColumn}/>, document.getElementById("container"));
        expect(cmp.getValue().columnKey).toBe(value);
        expect(cmp.validate(value)).toBe(true);
    });
    it('CustomAutocompleteEditor Editor no stream provided', () => {
        const cmp = ReactDOM.render(<CustomAutocompleteEditor
            value={value}
            rowIdx={1}
            autocompleteStreamFactory={createCustomPagedUniqueAutompleteStream}
            column={testColumn}/>, document.getElementById("container"));
        expect(cmp).toExist();
    });
});
