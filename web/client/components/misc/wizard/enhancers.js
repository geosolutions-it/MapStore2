/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const {compose, withState, withPropsOnChange, withHandlers} = require('recompose');
module.exports = {
   /**
    * Apply this enhancer to the WizarContainer to make it controlled.
    * It controls the step and the hideButtons paroperties
    */
    controlledWizard: compose(
        withState(
            "step", "setPage", 0
        ),
        withPropsOnChange(["step"], ({skipButtonsOnSteps = [], step, hideButtons} = {}) => {
            if (skipButtonsOnSteps && skipButtonsOnSteps.indexOf(step) >= 0) {
                return {hideButtons: true};
            }
            return {hideButtons};
        }),
        withHandlers({
            onNextPage: ({step, setPage = () => {}}) => () => {
                setPage(step + 1);
            },
            onPrevPage: ({step, setPage = () => {}}) => () => {
                setPage(Math.max(step - 1, 0));
            }
        }),

    )

};
