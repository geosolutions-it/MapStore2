import expect from 'expect';

export const testToolbarButtons = (buttons = [], container, selector = ".ms-section-background-container .btn-group .glyphicon") => {
    const buttonsInToolbar = container.querySelectorAll(selector);
    expect(buttonsInToolbar).toExist();
    expect(buttonsInToolbar.length).toBe(buttons.length);
    buttonsInToolbar.forEach((b, i) => {
        expect(b.className === `glyphicon glyphicon-${buttons[i]}`).toBe(true, `expect ${b.className} === glyphicon glyphicon-${buttons[i]}`);
    });
};
