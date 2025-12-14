import React, { useState } from 'react';
import InteractionEventsSelector from "./InteractionEventsSelector";

const InteractionEditor = ({targets = [], metadataTree}) => {
    const initialExpandedItems = targets.length > 0 ? [targets[0].name] : [];
    const [expandedItems, setExpandedItems] = useState(initialExpandedItems);
    const toggleExpanded = (name) => {
        setExpandedItems(items =>
            items.includes(name)
                ? items.filter(i => i !== name)        // collapse
                : [...items, name]                     // expand
        );
    };

    // TODO: accordion logic, expand first one
    return <>
        {targets.map(e => {
            const expanded = expandedItems.includes(e.type);
            return (<InteractionEventsSelector
                key={e.type}
                target={e}
                expanded={expanded}
                toggleExpanded={() => toggleExpanded(e.type)}
            />);
        })}
    </>;
};

export default InteractionEditor;
