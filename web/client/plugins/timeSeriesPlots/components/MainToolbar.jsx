import React from 'react';

import SelectionTools from './SelectionTools';

export default function MainToolbar(props) {
    return (
    <div className="time-series-plots-toolbar">
            <SelectionTools {...props}/>
    </div>
    );
}