
import expect from 'expect';
import { parseExpression, pluginUtilsExpressionEvaluation } from '../ExpressionUtils';
import {get} from 'lodash';
import { BASIC_FUNCTIONS_TEST,
    COMPATIBILITY_TEST_MS,
    COMPATIBILITY_TESTS_AC,
    COMPATIBILITY_TESTS_GN,
    FAIL_TESTS
} from './ExpressionUtils-test-data';
// test rules have `[rule, data, expectedResult, title]`, title is optional
const testRule = ([rule, {state, context}, result, title]) => {
    it(title ? `${title}(${rule})` : rule, () => {
        let returnedResult;
        try {
            returnedResult = pluginUtilsExpressionEvaluation(rule, {
                state: k => get(state, k),
                context
            });
        } catch (e) {
            expect(true).toBe(false,
                `Rule Evaluation failed (ERROR):
                - returned: ${returnedResult}
                - expected:${result}
                - original rule: ${e.original}
                - transformed: ${e.transformed}
                - Error message: ${e.message}`
            );
        }

        expect(returnedResult).toEqual(result, `Rule Evaluation failed (WRONG RESULT):
                - returned: ${returnedResult}
                - expected:${result}
                - original rule: ${rule}`);
    });
};
const testFailingRule = ([rule, {state, context}, result, title]) => {
    it(title ? `${title}(${rule})` : rule, () => {
        try {
            pluginUtilsExpressionEvaluation(rule, {
                state: k => get(state, k),
                context
            });
        } catch (e) {
            result?.type ? expect(result.type).toEqual(
                e.type,
                `The rule returned the wrong type:
                - returned: ${e.type}
                - expected:${result.type}
                - original rule: ${e.original}
                - transformed: ${e.transformed}
                - Error message: ${e.message}`
            ) : null;
            expect(rule).toEqual(e.original);
            return;
        }
        expect(false).toBe(true, "The rule was executed successfully, even if it was expected to fail.");
    });
};
describe('ExpressionUtils', () => {
    it('parseExpression evaluates expression with context', () => {
        expect(parseExpression('value + 20', {value: 20})).toEqual(40);
    });
    describe('test basic functions of pluginUtilsExpressionEvaluation', () => {
        BASIC_FUNCTIONS_TEST.forEach(testRule);
    });
    describe('basic fail tests', () => {
        FAIL_TESTS.forEach(testFailingRule);
    });
    describe('Test compatibility Rules', () => {
        COMPATIBILITY_TEST_MS.forEach(testRule);
        COMPATIBILITY_TESTS_GN.forEach(testRule);
        COMPATIBILITY_TESTS_AC.forEach(testRule);
    });
});
