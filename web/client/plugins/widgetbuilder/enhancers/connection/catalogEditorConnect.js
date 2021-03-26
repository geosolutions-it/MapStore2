import { connect } from 'react-redux';
import { compose, defaultProps } from 'recompose';
import { setDashboardCatalogMode, dashboardDeleteService, updateDashboardService } from '../../../../actions/dashboard';
import { error } from '../../../../actions/notifications';
import {dashboardSaveServiceSelector} from '../../../../selectors/dashboard';

export default compose(
    defaultProps({id: 'dashboard-catalog-selector', buttonStyle: {
        marginBottom: "10px",
        marginRight: "5px"}}),
    connect((state) => ({
        saving: dashboardSaveServiceSelector(state)
    }), {
        error: error,
        onDeleteService: dashboardDeleteService,
        onChangeCatalogMode: setDashboardCatalogMode,
        onAddService: updateDashboardService
    })
);
