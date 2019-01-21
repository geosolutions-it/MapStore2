var expect = require('expect');
var { CHANGE_CRS_INPUT_VALUE, setInputValue} = require('../crsselector');

describe('Test crsselector actions', () => {
    it('test input value action', () => {
        let value = 'ESPG:4326';
        const retVal = setInputValue(value);
        expect(retVal).toExist();
        expect(retVal.type).toBe(CHANGE_CRS_INPUT_VALUE);
        expect(retVal.value).toBe('ESPG:4326');
    });
});
