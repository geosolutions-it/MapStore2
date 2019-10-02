const React = require('react');
/**
 * A components that renders the content to fill 100% width and height, with possible header,footer, left and right.
 * Made using flex layout.
 * @class
 * @memberof components.layout
 * @prop  {Component} children The data to render in the center of the layout__body
 * @prop  {Component} [header]   The component to render on top
 * @prop  {Component} [footer]   The data to render on bottom
 * @prop  {Component[]} [columns] Components to render at right/left.
 * Must have in style `order:-1` if you want to put on the left. To set the size use:  `flex: "0 0 SIZE(in px,em...)"`. e.g. `flex: 0 0 12em`
 * @example
 * <BorderLayout
 *     header={<header>My Header</header>}
 *     footer={<footer>My Footer<br /><br /><br /><br /><br /><br /><br /><br /><br /></footer>}
 *     columns={[<div style={{order: -1}}>Abc</div>, <div>Bcd</div>, <div>Cde</div>]}
 *     >
 *     <MyContent />
 *  /></BorderLayout>
 *
 */
module.exports = ({id, children, header, footer, columns, height, style = {}, className, bodyClassName = "ms2-border-layout-body"}) =>
    (<div id={id} className={className} style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...style
    }}>
        {header}
        <div className={bodyClassName} style={{
            display: "flex",
            flex: 1,
            overflowY: "auto"
        }}>
            <main className="ms2-border-layout-content" style={{flex: 1}}>
                {height ? <div style={{height}}>{children}</div> : children}
            </main>
            {height ? <div style={{height}}>{columns}</div> : columns}
        </div>
        {footer}
    </div>);
