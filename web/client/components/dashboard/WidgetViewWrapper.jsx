import React from 'react';
import WidgetsView from '../widgets/view/WidgetsView';
import ViewSwitcher from './ViewSwitcher';
import uuidv1 from 'uuid/v1';
import { getNextAvailableName } from '../../utils/WidgetsUtils';
import ConfigureView from './ConfigureView';
import FlexBox from '../layout/FlexBox';

const WidgetViewWrapper = props => {
    const { layouts = [], onLayoutViewReplace, selectedLayoutId, onLayoutViewSelected, active, setActive } = props;

    const getSelectedLayout = () => {
        if (Array.isArray(layouts)) {
            return layouts.find(l => l.id === selectedLayoutId) || {};
        }
        // fallback for old object format
        return layouts;
    };

    const handleSelectLayout = (id) => {
        onLayoutViewSelected(id);
    };

    // strip out "properties" before passing
    const selectedLayout = getSelectedLayout();
    const { id, name, color, order, ...layoutForWidgets } = selectedLayout;

    const filteredProps = {...props};
    if (props.widgets) {
        filteredProps.widgets = props.widgets.filter(widget => widget.layoutId === selectedLayoutId);
    }

    const handleAddLayout = () => {
        const newLayout = {
            id: uuidv1(),
            name: getNextAvailableName(layouts),
            color: null,
            md: [],
            xxs: []
        };
        const finalLayout = [...layouts, newLayout];
        onLayoutViewReplace?.(finalLayout);
        onLayoutViewSelected(newLayout.id);
    };

    const handleRemoveLayout = (layoutId) => {
        const updatedLayouts = layouts.filter(layout => layout.id !== layoutId);
        onLayoutViewReplace(updatedLayouts);
        onLayoutViewSelected(updatedLayouts?.[updatedLayouts.length - 1]?.id);
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
        const updatedLayouts = layouts.map(layout => layout.id === id
            ? { ...layout, name: data.name, color: data.color }
            : layout
        );
        onLayoutViewReplace(updatedLayouts);
        setActive(false);
    };

    return (
        <FlexBox column classNames={["_relative", "_fill"]}>
            <FlexBox.Fill classNames={["_relative", "_overflow-auto"]}>
                <WidgetsView
                    {...filteredProps}
                    layouts={layoutForWidgets} // only selected layout without properties
                />
            </FlexBox.Fill>
            <ViewSwitcher
                layouts={Array.isArray(layouts) ? layouts : [layouts]}
                selectedLayoutId={selectedLayoutId}
                onSelect={handleSelectLayout}
                onAdd={handleAddLayout}
                onRemove={handleRemoveLayout}
                onMove={handleMoveLayout}
                onConfigure={() => setActive(true)}
                canEdit={props.canEdit}
                onLayoutViewSelected={onLayoutViewSelected}
            />
            <ConfigureView
                active={active}
                onToggle={handleToggle}
                onSave={handleSave}
                name={name}
                color={color}
            />
        </FlexBox>
    );
};

export default WidgetViewWrapper;
