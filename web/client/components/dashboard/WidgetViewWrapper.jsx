import React from 'react';
import ViewSwitcher from './ViewSwitcher';
import uuidv1 from 'uuid/v1';
import { getNextAvailableName } from '../../utils/WidgetsUtils';
import ConfigureView from './ConfigureView';
import FlexBox from '../layout/FlexBox';
import Layouts from './Layouts';

const WidgetViewWrapper = props => {
    const {
        layouts = [],
        onLayoutViewReplace,
        selectedLayoutId,
        onLayoutViewSelected,
        active,
        setActive,
        widgets = [],
        onWidgetsReplace,
        user,
        monitoredState
    } = props;

    const getSelectedLayout = () => {
        if (Array.isArray(layouts)) {
            return layouts.find(l => l?.id === selectedLayoutId) || {};
        }
        // fallback for old object format
        return layouts;
    };

    const handleSelectLayout = (id) => {
        onLayoutViewSelected(id);
    };

    // strip out "properties" before passing
    const selectedLayout = getSelectedLayout();
    const { id, name, color, linkExistingDashboard, dashboard, ...layoutsData } = selectedLayout;

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
        setActive(true);
    };

    const handleRemoveLayout = (layoutId) => {
        const updatedLayouts = layouts.filter(layout => layout.id !== layoutId);
        onLayoutViewReplace(updatedLayouts);
        onLayoutViewSelected(updatedLayouts?.[updatedLayouts.length - 1]?.id);

        const updatedWidgets = widgets.filter(w => w.layoutId !== layoutId);
        onWidgetsReplace(updatedWidgets);
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
            ? {
                ...layout,
                name: data.name,
                color: data.color,
                linkExistingDashboard: data.linkExistingDashboard,
                dashboard: data.dashboard
            }
            : layout
        );
        onLayoutViewReplace(updatedLayouts);
        setActive(false);
    };

    return (
        <FlexBox column classNames={["_relative", "_fill"]}>
            <Layouts selectedLayout={selectedLayout} layoutsData={layoutsData} {...props} />
            <ViewSwitcher
                layouts={Array.isArray(layouts) ? layouts : [layouts]}
                selectedLayoutId={selectedLayoutId}
                onSelect={handleSelectLayout}
                onAdd={handleAddLayout}
                onRemove={handleRemoveLayout}
                onMove={handleMoveLayout}
                onConfigure={() => setActive(true)}
                canEdit={props.canEdit}
            />
            <ConfigureView
                active={active}
                onToggle={handleToggle}
                onSave={handleSave}
                data={{ name, color, linkExistingDashboard, dashboard }}
                user={user}
                monitoredState={monitoredState}
            />
        </FlexBox>
    );
};

export default WidgetViewWrapper;
