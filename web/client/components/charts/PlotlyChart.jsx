import React from 'react';
import Plot from 'react-plotly.js';

export default function ({ data, layout, config}) {
    return (
        <Plot
            data={data}
            layout={layout}
            config={config}
        />
    );
}
