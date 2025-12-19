import { useEffect, useMemo, useRef, useState } from 'react';
import { getErrorMessageId, updateDependenciesMap } from '../../../utils/WidgetsUtils';
import { getResource } from '../../../api/persistence';

export default function useLoadDashboardData({ props, dashboard }) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Track previous dashboard per layoutId
    const prevDashboardsRef = useRef({});
    const isFetchingRef = useRef(false);

    const { layouts = [], selectedLayoutId, onLinkedDashboardDataLoad, widgets = [] } = props || {};

    const layout = useMemo(() => {
        if (!layouts || !selectedLayoutId) return null;
        return layouts.find(l => l.id === selectedLayoutId);
    }, [selectedLayoutId, layouts]);

    useEffect(() => {
        if (!dashboard || !layout) return;

        const prevDashboard = prevDashboardsRef.current[selectedLayoutId];
        setErrors(prev => ({ ...prev, [selectedLayoutId]: null }));

        const hasLayoutData = layout?.md?.length > 0 || layout?.xxs?.length > 0;
        const isSameDashboard = prevDashboard === dashboard;

        // If layout already has data AND dashboard hasn't changed, skip API call
        if ((hasLayoutData && isSameDashboard) || isFetchingRef.current) return;

        isFetchingRef.current = true;
        setLoading(true);
        getResource(dashboard, 'dashboard')
            .toPromise()
            .then(res => {
                const layoutsData = Array.isArray(res.data.layouts) ? res.data.layouts : [res.data.layouts];
                // Handle multiple dashboard error
                if (layoutsData?.length > 1) {
                    const messageId = "dashboard.errors.multipleDashboardError";
                    setErrors(prev => ({ ...prev, [selectedLayoutId]: { messageId } }));
                    return;
                }

                const layoutData = layoutsData?.[0];
                // Prefix widget IDs and dependencies
                const widgetsData = res.data.widgets.map(w => ({
                    ...w,
                    id: `${selectedLayoutId}-${w.id}`,
                    layoutId: selectedLayoutId,
                    ...(w.dependenciesMap && {
                        dependenciesMap: updateDependenciesMap(w.dependenciesMap, selectedLayoutId)
                    })
                }));

                // Prefix layout "i" fields
                const prefixLayoutItems = (items = []) =>
                    items.map(item => ({ ...item, i: `${selectedLayoutId}-${item.i}` }));

                const updatedLayouts = layouts.map(l => l.id === selectedLayoutId
                    ? { ...l, md: prefixLayoutItems(layoutData.md), xxs: prefixLayoutItems(layoutData.xxs) }
                    : l
                );
                onLinkedDashboardDataLoad({
                    // filter out the existing widgets when the dashboard is changed
                    widgets: [...widgets.filter(w => w.layoutId !== selectedLayoutId), ...widgetsData],
                    layouts: updatedLayouts
                });
                // Update the dashboard for this layout
                prevDashboardsRef.current[selectedLayoutId] = dashboard;
            })
            .catch(err => {
                const messageId = getErrorMessageId(err);
                setErrors(prev => ({ ...prev, [selectedLayoutId]: { messageId } }));
            })
            .finally(() => {
                isFetchingRef.current = false;
                setLoading(false);
            });
    }, [dashboard, layout, layouts, onLinkedDashboardDataLoad, selectedLayoutId, widgets]);

    return [loading, errors[selectedLayoutId]];
}
