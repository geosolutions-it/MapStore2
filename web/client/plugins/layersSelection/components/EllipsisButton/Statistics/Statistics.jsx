import React, { useState, useMemo } from 'react';

import Message from '../../../../../components/I18N/Message';
import Portal from '../../../../../components/misc/Portal';
import ResizableModal from '../../../../../components/misc/ResizableModal';

import './Statistics.css';

/**
 * A modal component that displays basic statistical calculations
 * (count, sum, min, max, mean, standard deviation)
 * for a selected numeric field from a list of features.
 *
 * @param {Object} props - Component props.
 * @param {string[]} props.fields - List of available field names.
 * @param {Object[]} props.features - List of GeoJSON features.
 * @param {Function} props.setStatisticsOpen - Callback to close the statistics modal.
 * @returns {JSX.Element} The rendered statistics modal.
 */
export default ({
    fields = [],
    features = [],
    setStatisticsOpen = () => {}
}) => {
    const [selectedField, setSelectedField] = useState(fields.length > 0 ? fields[0] : null);

    const statistics = useMemo(() => {
        if (!selectedField) return null;

        const values = features.map(f => f.properties[selectedField]).filter(v => typeof v === "number");
        if (values.length === 0) return null;

        const sum = values.reduce((acc, val) => acc + val, 0);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const mean = sum / values.length;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        return { count: values.length, sum, min, max, mean, stdDev };
    }, [features, selectedField]);

    return (
        <Portal>
            <ResizableModal
                fade
                title={<Message msgId="layersSelection.statistics.title"/>}
                size="sm"
                show
                onClose={() => setStatisticsOpen(false)}
                // draggable={true}
                buttons={[{
                    text: <Message msgId="close"/>,
                    onClick: () => setStatisticsOpen(false),
                    bsStyle: 'primary'
                }]}>
                <div className="feature-statistics">
                    <div className="select-container">
                        <label className="mb-2 font-semibold"><Message msgId="layersSelection.statistics.field"/></label>
                        <select
                            className="flex-grow p-2 border rounded"
                            value={selectedField}
                            onChange={(e) => setSelectedField(e.target.value)}
                        >
                            {fields.map((field) => ( <option key={field} value={field}>{field}</option> ))}
                        </select>
                    </div>

                    {statistics && (
                        <table className="statistics-table">
                            <tbody>
                                <tr><td><Message msgId="layersSelection.statistics.count"/></td><td>{statistics.count}</td></tr>
                                <tr><td><Message msgId="layersSelection.statistics.sum"/></td><td>{statistics.sum.toFixed(6)}</td></tr>
                                <tr><td><Message msgId="layersSelection.statistics.min"/></td><td>{statistics.min.toFixed(6)}</td></tr>
                                <tr><td><Message msgId="layersSelection.statistics.max"/></td><td>{statistics.max.toFixed(6)}</td></tr>
                                <tr><td><Message msgId="layersSelection.statistics.avg"/></td><td>{statistics.mean.toFixed(6)}</td></tr>
                                <tr><td><Message msgId="layersSelection.statistics.std"/></td><td>{statistics.stdDev.toFixed(6)}</td></tr>
                            </tbody>
                        </table>
                    )}
                </div>
            </ResizableModal>
        </Portal>
    );
};
