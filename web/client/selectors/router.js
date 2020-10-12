
import { get } from 'lodash';


export const pathnameSelector = (state) => get(state, "router.location.pathname") || "/";
export const searchSelector = (state) => get(state, "router.location.search") || "";
