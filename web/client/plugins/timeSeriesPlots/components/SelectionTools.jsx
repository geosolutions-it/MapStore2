import React from 'react';
import { connect } from 'react-redux';

import { currentSelectionToolSelector } from '../selectors/timeSeriesPlots';
import { SELECTION_TYPES } from '../constants';
import TButton from './TButton';
import { toggleSelectionTool, clearAllSelections } from '../actions/timeSeriesPlots';
import { getTooltip } from '../utils';

const BUTTONS_SETTINGS = {
    [SELECTION_TYPES.CIRCLE]: {
        key: SELECTION_TYPES.CIRCLE,
        glyph: "polyline",
        // tooltip: getTooltip("line", "cadastrapp.create_line")
    },
    [SELECTION_TYPES.POINT]: {
        key: SELECTION_TYPES.POINT,
        glyph: "map-marker",
        tooltip: getTooltip("point", "timeSeriesPlots.pointSelection")
    },
    [SELECTION_TYPES.POLYGON]: {
        key: SELECTION_TYPES.POLYGON,
        glyph: "polygon",
        tooltip: getTooltip("polygon", "timeSeriesPlots.polygonSelection")
    }
};

function SelectionTools({ currentTool, onClick = () => {} }) {
    return <>
    {
        Object.keys(SELECTION_TYPES)
            .filter(k => BUTTONS_SETTINGS[k])
            .map(k => SELECTION_TYPES[k])
            .map(toolName => {
                const isActive = toolName === currentTool;
                return (
                    <TButton
                        buttonSize="md"
                        tButtonClass="selection-btn"
                        bsStyle={isActive && "success"}
                        {...BUTTONS_SETTINGS[toolName]}
                        // if the current selection button is clicked, it turns off selection
                        onClick={() => isActive ? onClick() : onClick(toolName)}
                    />);
            })
    }
    </>;
};

export default connect((state) => ({
    currentTool: currentSelectionToolSelector(state)
}), {
    onClick: toggleSelectionTool
})(SelectionTools);