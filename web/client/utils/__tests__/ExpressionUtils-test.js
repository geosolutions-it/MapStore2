
import expect from 'expect';
import { parseExpression } from '../ExpressionUtils';
describe('ExpressionUtils', () => {
    it('parseExpression evaluates expression with context', () => {
        expect(parseExpression('value + 20', {value: 20})).toEqual(40);
    });
});
