import React, { useEffect, useState } from 'react';
import InteractionEventsSelector from "./InteractionEventsSelector";
import { TARGET_TYPES } from '../../../../../../utils/InteractionUtils';

// currentSourceId is the source that will be source of the target, in filter widget 'filterId' is expected
const InteractionEditor = ({targets = [], sourceWidgetId, currentSourceId, onEditorChange = () => {}, isStyleOnly = false}) => {
    const initialExpandedItems = targets.length > 0 ? [targets[0].targetType] : [];
    const [expandedItems, setExpandedItems] = useState(initialExpandedItems);
    const toggleExpanded = (name) => {
        setExpandedItems(items =>
            items.includes(name)
                ? items.filter(i => i !== name)        // collapse
                : [...items, name]                     // expand
        );
    };

    // expand APPLY_STYLE is isStyleOnly is true
    useEffect(() =>{
        if (isStyleOnly) {
            setExpandedItems(items => [...items, TARGET_TYPES.APPLY_STYLE]);
        }
    }, [isStyleOnly]);

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
            />);
        })}
    </>;
};

export default InteractionEditor;
