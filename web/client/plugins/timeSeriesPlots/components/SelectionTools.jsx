import React from 'react';
import { connect } from 'react-redux';

import { currentSelectionToolSelector } from '../selectors/timeSeriesPlots';
import { SELECTION_TYPES } from '../constants';
import TButton from './TButton';
import { toggleSelectionTool, clearAllSelections } from '../actions/timeSeriesPlots';
import { CLEAR_ALL_SELECTIONS } from '../constants';

const BUTTONS_SETTINGS = {
    [SELECTION_TYPES.CIRCLE]: {
        key: SELECTION_TYPES.CIRCLE,
        glyph: "polyline",
        // tooltip: tooltip("line", "cadastrapp.create_line")
    },
    [SELECTION_TYPES.POINT]: {
        key: SELECTION_TYPES.POINT,
        glyph: "map-marker",
        // tooltip: tooltip("point", "cadastrapp.create_point")
    },
    [SELECTION_TYPES.POLYGON]: {
        key: SELECTION_TYPES.POLYGON,
        glyph: "polygon",
        // tooltip: tooltip("polygon", "cadastrapp.create_polygon")
    },
    CLEAR_ALL_SELECTIONS: {
        clearAllBtn: true,
        key: SELECTION_TYPES.CLEAR_ALL_SELECTIONS,
        glyph: "remove"
    }
};

function SelectionTools({ currentTool, clearAllSelections = () => {}, onClick = () => {} }) {
    return <>
    {
        Object.keys(SELECTION_TYPES)
            .map(k => SELECTION_TYPES[k])
            .map(toolName => {
                const isActive = toolName === currentTool;
                const clearAllBtn = Boolean(BUTTONS_SETTINGS[toolName].clearAllBtn);
                return (
                    <TButton
                        tButtonClass={!clearAllBtn ? "selection-btn" : "clear-all-btn"}
                        bsStyle={!clearAllBtn ? (isActive && "success") : "danger"}
                        {...BUTTONS_SETTINGS[toolName]}
                        // if the current selection button is clicked, it turns off selection
                        onClick={() => clearAllBtn ? clearAllSelections() : isActive ? onClick() : onClick(toolName)}
                    />);
            })
    }
    </>;
};

export default connect((state) => ({
    currentTool: currentSelectionToolSelector(state)
}), {
    onClick: toggleSelectionTool,
    clearAllSelections: clearAllSelections
})(SelectionTools);