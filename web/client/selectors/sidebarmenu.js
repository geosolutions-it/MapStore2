import {get} from "lodash";
import { isSidebarFullHeightOnDashboard } from "./dashboard";

export const lastActiveToolSelector = (state) => get(state, "sidebarmenu.lastActiveItem", false);

export const sidebarIsActiveSelector = (state) => get(state, 'controls.sidebarMenu.enabled', false);
export const isSidebarWithFullHeight = (state) =>{
    // here It is just for dashboard, but in the future if sidebar with full height is needed for anythinf else put here
    return isSidebarFullHeightOnDashboard(state);
};

