import {compileExpression} from 'filtrex';
export function parseExpression(expression, context) {
    var expr = compileExpression(expression);
    return expr(context);
}
