/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {compileExpression} from 'filtrex';

/**
 * Parses an expression returning the final result, with the variables passed
 * @prop {string} expression the expression to parse
 * @prop {object] context the variables for the expression.
 */
export function parseExpression(expression, context) {
    var expr = compileExpression(expression);
    return expr(context);
}
