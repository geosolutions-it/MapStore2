const expect = require('expect');
const { CHANGE_CRS_INPUT_VALUE, setInputValue} = require('../crsselector');

describe('Test crsselector actions', () => {
    it('test input value action', () => {
        const retVal = setInputValue('ESPG:4326');
        expect(retVal).toExist();
        expect(retVal.type).toBe(CHANGE_CRS_INPUT_VALUE);
        expect(retVal.value).toBe('ESPG:4326');
    });
});
