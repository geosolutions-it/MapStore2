import {get} from "lodash";

export const lastActiveToolSelector = (state) => get(state, "sidebarmenu.lastActiveItem", false);
