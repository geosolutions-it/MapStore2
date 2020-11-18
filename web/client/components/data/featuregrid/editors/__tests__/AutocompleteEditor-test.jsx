import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import {createPagedUniqueAutompleteStream} from '../../../../../observables/autocomplete';
import AutocompleteEditor from '../AutocompleteEditor';

let testColumn = {
    key: 'columnKey'
};
const value = "1.1";
describe('FeatureGrid AutocompleteEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('AutocompleteEditor Editor no stream provided', () => {
        const cmp = ReactDOM.render(<AutocompleteEditor
            value={value}
            rowIdx={1}
            column={testColumn}/>, document.getElementById("container"));
        expect(cmp.getValue().columnKey).toBe(value);
        expect(cmp.validate(value)).toBe(true);
    });
    it('AutocompleteEditor Editor no stream provided', () => {
        const cmp = ReactDOM.render(<AutocompleteEditor
            value={value}
            rowIdx={1}
            autocompleteStreamFactory={createPagedUniqueAutompleteStream}
            column={testColumn}/>, document.getElementById("container"));
        expect(cmp).toExist();
    });
});
