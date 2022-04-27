import {get} from "lodash";

export const lastActiveToolSelector = (state) => get(state, "sidebarmenu.lastActiveItem", false);

export const sidebarIsActiveSelector = (state) => get(state, 'controls.sidebarMenu.enabled', false);
