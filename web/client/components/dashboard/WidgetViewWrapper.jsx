import React, { useEffect, useState } from 'react';
import WidgetsView from '../widgets/view/WidgetsView';
import ViewSwitcher from './ViewSwitcher';
import uuidv1 from 'uuid/v1';
import Dialog from '../misc/Dialog';
import Message from '../I18N/Message';
import { Button, ControlLabel, FormControl, FormGroup, Glyphicon } from 'react-bootstrap';
import ColorSelector from '../style/ColorSelector';

const breakpoints = ['xxs', 'xs', 'sm', 'md', 'lg'];

const ConfigureView = ({ active, onToggle, name, color, onSave }) => {
    const [setting, setSetting] = useState({ name: null, color: null });
    useEffect(() => {
        setSetting({ name, color });
    }, [name, color]);
    return (
        <div>
            {active && (
                <Dialog
                    id="mapstore-export-data-results"
                    draggable={false}
                    modal>
                    <span role="header">
                        <span className="modal-title about-panel-title"><Message msgId="dashboard.view.configure"/></span>
                        <button onClick={() => onToggle()} className="settings-panel-close close"><Glyphicon glyph="1-close"/></button>
                    </span>
                    <div role="body" className="_padding-lg">
                        <FormGroup>
                            <ControlLabel><Message msgId="dashboard.view.name" /></ControlLabel>
                            <FormControl
                                type="text"
                                value={setting.name}
                                onChange={event => {
                                    const { value } = event.target || {};
                                    setSetting(prev => ({ ...prev, name: value }));
                                }}
                            />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel><Message msgId="dashboard.view.color" /></ControlLabel>
                            <ColorSelector
                                format="rgb"
                                color={setting.color}
                                onChangeColor={(colorVal) => colorVal && setSetting(prev =>({
                                    ...prev,
                                    color: colorVal
                                }))}
                            />
                        </FormGroup>
                    </div>
                    <div role="footer">
                        <Button
                            bsStyle="default"
                            onClick={() => onToggle()}
                        >Cancel</Button>
                        <Button
                            bsStyle="primary"
                            onClick={() => onSave(setting)}
                        >Save</Button>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

const WidgetViewWrapper = props => {
    const { layouts = [], onLayoutViewReplace, selectedId, setSelectedId, active, setActive } = props;

    const getSelectedLayout = () => {
        if (Array.isArray(layouts)) {
            return layouts.find(l => l.id === selectedId) || {};
        }
        // fallback for old object format
        return layouts;
    };

    const handleSelectLayout = (id) => {
        setSelectedId(id);
    };

    // strip out "properties" before passing
    const selectedLayout = getSelectedLayout();
    const { id, name, color, order, ...layoutForWidgets } = selectedLayout;

    // Filter widgets based on breakpoints if present
    const filteredProps = {...props};
    if (breakpoints && props.widgets) {
        filteredProps.widgets = props.widgets.filter(widget => widget.layoutId === selectedId);
    }

    const getNextAvailableName = () => {
        // Extract all existing "New View X" names and get their numbers
        const newViewPattern = /^New View (\d+)$/;
        const existingNumbers = layouts
            .map(l => {
                const match = l.name?.match(newViewPattern);
                return match ? parseInt(match[1], 10) : null;
            })
            .filter(num => num !== null);

        if (existingNumbers.length === 0) {
            // No "New View X" names exist, start with 1
            return `New View 1`;
        }

        // Find the next available number
        // Sort the numbers and find the first gap or use max + 1
        existingNumbers.sort((a, b) => a - b);

        let nextNumber = 1;
        for (const num of existingNumbers) {
            if (num === nextNumber) {
                nextNumber++;
            } else if (num > nextNumber) {
                // Found a gap
                break;
            }
        }

        return `New View ${nextNumber}`;
    };

    const handleAddLayout = () => {
        const newLayout = {
            id: uuidv1(),
            name: getNextAvailableName(),
            color: null,
            md: [],
            xxs: []
        };
        const finalLayout = [...layouts, newLayout];
        onLayoutViewReplace?.(finalLayout);
        setSelectedId(newLayout.id);
    };

    const handleRemoveLayout = (layoutId) => {
        const updatedLayouts = layouts.filter(layout => layout.id !== layoutId);
        onLayoutViewReplace(updatedLayouts);
        setSelectedId(updatedLayouts?.[updatedLayouts.length - 1]?.id);
    };

    const handleMoveLayout = (layoutId, direction) => {
        const index = layouts.findIndex(layout => layout.id === layoutId);
        if (index === -1) return; // Layout not found

        // Clone the array to avoid mutating state directly
        const updatedLayouts = [...layouts];

        if (direction === "left" && index > 0) {
            // Swap with the previous layout
            [updatedLayouts[index - 1], updatedLayouts[index]] = [updatedLayouts[index], updatedLayouts[index - 1]];
        } else if (direction === "right" && index < updatedLayouts.length - 1) {
            // Swap with the next layout
            [updatedLayouts[index], updatedLayouts[index + 1]] = [updatedLayouts[index + 1], updatedLayouts[index]];
        }
        onLayoutViewReplace(updatedLayouts);
    };

    const handleToggle = () => setActive(false);

    const handleSave = (data) => {
        console.log({ data });
        const updatedLayouts = layouts.map(layout => layout.id === id
            ? { ...layout, name: data.name, color: data.color }
            : layout
        );
        onLayoutViewReplace(updatedLayouts);
        setActive(false);
    };

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            <WidgetsView
                {...filteredProps}
                layouts={layoutForWidgets} // only selected layout without properties
            />
            <ViewSwitcher
                layouts={Array.isArray(layouts) ? layouts : [layouts]}
                selectedLayoutId={selectedId}
                onSelect={handleSelectLayout}
                onAdd={handleAddLayout}
                onRemove={handleRemoveLayout}
                onMove={handleMoveLayout}
                onConfigure={() => setActive(true)}
            />
            <ConfigureView
                active={active}
                onToggle={handleToggle}
                onSave={handleSave}
                name={name}
                color={color}
            />
        </div>
    );
};

export default WidgetViewWrapper;
