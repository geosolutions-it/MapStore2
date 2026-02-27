import React, { useState, useEffect, useContext } from 'react';
import ReactDOM from "react-dom";
import { Glyphicon } from 'react-bootstrap';

import Message from '../../../../components/I18N/Message';
import InlineLoader from '../../../TOC/components/InlineLoader';

import { SelectRefContext } from '../LayersSelection';

/**
 * LayersSelectionHeader provides a toolbar for selecting geometry-based
 * selection tools (point, line, polygon, etc.) and for clearing selections.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.onCleanSelect - Callback to reset or apply selection tool.
 * @param {Array<string>} props.selectTools - List of enabled selection tool types.
 *                                            E.g., ['Point', 'Polygon', 'Rectangle']
 *
 * @returns {JSX.Element} The selection tool header UI.
 */
export default ({
    onCleanSelect,
    selectTools
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuClosing, setMenuClosing] = useState(false);
    const [selectedTool, setSelectedTool] = useState(null);

    const selectRef = useContext(SelectRefContext);
    useEffect(() => {
        const selectElement = selectRef.current?.addEventListener ? selectRef.current : ReactDOM.findDOMNode(selectRef.current);
        if (!selectElement || !selectElement.addEventListener) { return null; }
        const handleClick = () => setMenuClosing(true);
        selectElement.addEventListener("click", handleClick);
        return () => selectElement.removeEventListener("click", handleClick);
    });
    useEffect(() => {
        if (menuClosing) {
            setMenuClosing(false);
            if (menuOpen) {
                setTimeout(() => setMenuOpen(false), 50);   // In order that onCleanSelect has the time to trigger its action.
            }
        }
    }, [menuClosing]);

    const toggleMenu = () => setMenuOpen(!menuOpen);

    const clean = tool => {
        setMenuOpen(false);
        if (tool) setSelectedTool(tool);
        onCleanSelect(tool?.action ?? null);
    };

    const clearSelection = () => {
        clean();
        setSelectedTool(null);
    };

    const allTools = [
        { type: 'Point', action: 'Point', label: 'layersSelection.button.selectByPoint', icon: '1-point' },
        { type: 'LineString', action: 'LineString', label: 'layersSelection.button.selectByLine', icon: 'polyline' },
        { type: 'Circle', action: 'Circle', label: 'layersSelection.button.selectByCircle', icon: '1-circle' },
        { type: 'Rectangle', action: 'BBOX', label: 'layersSelection.button.selectByRectangle', icon: 'unchecked' },
        { type: 'Polygon', action: 'Polygon', label: 'layersSelection.button.selectByPolygon', icon: 'polygon' }
    ];
    const availableTools = allTools.filter(tool => !Array.isArray(selectTools) || selectTools.includes(tool.type === 'LineString' ? 'Line' : tool.type));
    const orderedTools = selectedTool ? [availableTools.find(tool => tool.type === selectedTool.type), ...availableTools.filter(tool => tool.type !== selectedTool.type)] : availableTools;

    return (
        <div className="select-header-container">

            <div className="head-text"><Message msgId="layersSelection.button.select"/></div>
            <div className="select-header">
                <div className="select-button-container">
                    <button className="select-button" onClick={toggleMenu}>
                        <span className="select-button-text">{selectedTool ? <><Glyphicon glyph={allTools.find(tool => tool.type === selectedTool.type)?.icon} />{' '}</> : null}<Message msgId={selectedTool?.label ?? "layersSelection.button.chooseGeometry"} /></span>
                        <span className="select-button-arrow"><Glyphicon glyph={menuOpen ? 'chevron-up' : 'chevron-down'}/></span>
                    </button>
                    {menuOpen && (
                        <div className="select-button-menu">
                            {orderedTools.map(tool => <p key={tool.type} onClick={() => clean(tool)}><Glyphicon glyph={tool.icon} />{' '}<Message msgId={tool.label} /></p>)}
                        </div>
                    )}
                </div>
                <button className="clear-select-button" onClick={clearSelection}>
                    <Message msgId="layersSelection.button.clear"/>
                </button>
            </div>
            &nbsp;
            <InlineLoader loading={false}/>
            &nbsp;
            <div className="Selection"><Message msgId="layersSelection.selection"/></div>
        </div>
    );
};
