export const RESET = "TIME_SERIES_PLOTS:RESET";
export const TOGGLE_SELECTION = "TIME_SERIES_PLOTS:TOGGLE_SELECTION";

export const reset = () => {
    return {
        type: RESET
    }
}

/**
 * Toggles map selection in one of the modes available
 * @param {string} selectionType type of selection (constants.SELECTION_TYPES)
 */
 export const toggleSelectionTool = (selectionType) => ({
    type: TOGGLE_SELECTION,
    selectionType
});
