/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const {compose, withState, withPropsOnChange, withHandlers} = require('recompose');
const wizardHandlers = compose(
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
    })
);
module.exports = {
    /**
    * Apply this enhancer to the WizardContainer to make it controlled.
    * It controls the step and the hideButtons properties
    */
    controlledWizard: compose(
        withState(
            "step", "setPage", 0
        ),
        wizardHandlers
    ),
    /**
     * Use this enhancer if you want to change step and use setPage as handler
     */
    wizardHandlers

};
