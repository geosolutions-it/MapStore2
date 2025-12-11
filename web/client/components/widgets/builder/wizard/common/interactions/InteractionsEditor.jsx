import React, { useState } from 'react';
import InteractionEventsSelector from "./InteractionEventsSelector";

const InteractionEditor = ({events = [], metadataTree}) => {
    const initialExpandedItems = events.length > 0 ? [events[0].name] : [];
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
        {events.map(e => {
            const expanded = expandedItems.includes(e.name);
            return (<InteractionEventsSelector
                key={e.name}
                event={e}
                expanded={expanded}
                toggleExpanded={() => toggleExpanded(e.name)}
            />);
        })}
    </>;
};

export default InteractionEditor;
