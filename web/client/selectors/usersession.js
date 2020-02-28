export const userSessionIdSelector = (state) => state.usersession && state.usersession.id || null;
export const userSessionSelector = (state) => state.usersession && state.usersession.session || null;
