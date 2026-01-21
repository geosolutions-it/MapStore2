import React, { useState } from 'react';
import InteractionEventsSelector from "./InteractionEventsSelector";

// currentSourceId is the source that will be source of the target, in filter widget 'filterId' is expected
const InteractionEditor = ({targets = [], sourceWidgetId, currentSourceId, onEditorChange = () => {}, isStyle = false}) => {
    const initialExpandedItems = targets.length > 0 ? [targets[0].targetType] : [];
    const [expandedItems, setExpandedItems] = useState(initialExpandedItems);
    const toggleExpanded = (name) => {
        setExpandedItems(items =>
            items.includes(name)
                ? items.filter(i => i !== name)        // collapse
                : [...items, name]                     // expand
        );
    };

    return <>
        {targets.map(e => {
            const expanded = expandedItems.includes(e.targetType);
            return (<InteractionEventsSelector
                key={e.targetType}
                target={e}
                expanded={expanded}
                toggleExpanded={() => toggleExpanded(e.targetType)}
                sourceWidgetId={sourceWidgetId}
                currentSourceId={currentSourceId}
                onEditorChange={onEditorChange}
                isStyle={isStyle}
            />);
        })}
    </>;
};

export default InteractionEditor;
