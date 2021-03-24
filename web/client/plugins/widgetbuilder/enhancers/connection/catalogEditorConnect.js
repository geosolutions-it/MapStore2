import { connect } from 'react-redux';
import { compose, defaultProps } from 'recompose';
import { setDashboardCatalogMode, dashboardDeleteService, updateDashboardCatalog } from '../../../../actions/dashboard';
import { error } from '../../../../actions/notifications';
import {dashboardSaveServiceSelector} from '../../../../selectors/dashboard';
// import { newServiceSelector } from '../../../../selectors/catalog';
import { isLocalizedLayerStylesEnabledSelector } from '../../../../selectors/localizedLayerStyles';

export default compose(
    defaultProps({id: 'dashboard-catalog-selector', buttonStyle: [] }),
    connect((state) => ({
        saving: dashboardSaveServiceSelector(state),
        isLocalizedLayerStylesEnabled: isLocalizedLayerStylesEnabledSelector(state)
        // service: newServiceSelector(state)
    }), {
        error: error,
        onDeleteService: dashboardDeleteService,
        onChangeCatalogMode: setDashboardCatalogMode,
        onAddService: updateDashboardCatalog
    })
);
