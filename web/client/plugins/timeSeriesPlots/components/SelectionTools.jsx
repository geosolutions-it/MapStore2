import React from 'react';
import TButton from './TButton';

import { SELECTION_TYPES } from '../constants';

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
    }
};

function SelectionTools({ currentTool = '', onClick = () => {} }) {
    return <>
    {
        Object.keys(SELECTION_TYPES)
            .map(k => SELECTION_TYPES[k])
            .map(toolName => {
                const isActive = toolName === currentTool;
                return (
                    <TButton 
                        bsStyle={isActive && "success"}
                        {...BUTTONS_SETTINGS[toolName]}
                        onClick={() => onClick()}
                    />);
            })
    }
    </>;
};

export default SelectionTools;