// customizable method: use your own `Plotly` object
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-cartesian-dist';
export const Plot = createPlotlyComponent(Plotly);
