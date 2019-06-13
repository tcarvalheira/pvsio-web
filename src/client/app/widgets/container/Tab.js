/**
 * @module Tab
 * @version 1.0
 * @description Renders a Tab or Pills container
 *              Content in each panel should be inserted in {tab-widget-id}-{page-id}-pane e.g
 * @author Tiago Carvalheira
 * @date 2018/06/05
 *
 * @example <caption>Example use of the widget.</caption>
 // Example pvsio-web demo that uses Tab
 // The following configuration assumes the pvsio-web demo is stored in a folder within pvsio-web/examples/demo/
 require.config({
     baseUrl: "../../client/app",
     paths: { d3: "../lib/d3", text: "../lib/text" }
 });
 require(["widgets/container/Tab"], function (Tab) {
      "use strict";
      var disp = new Tab('nav_pill',
                {top: 500,left: 50,width: 800,height: 50},
                {
                    parent: 'content',
                    pages: [{ id: 'battery', title: 'Battery level', state: 'BATTERY' }, 
                            { id: 'date', title: 'Date', state: 'DATE' }, 
                            { id: 'ok', title: 'Ok, go on!', state: 'OK' }, 
                            { id: 'cancel', title: 'Cancel that!!', state: 'CANCEL' }],
                    type: 'pill',
                    opacity: '0',
                    callback: onMessageReceived,
                    displayKey: 'mode'
                })
      disp.render();
 });
 *
 */
/*global define */
define(function (require, exports, module) {
    "use strict";
    var WidgetEVO = require("widgets/core/WidgetEVO");
    var ButtonEVO = require("widgets/core/ButtonEVO")
    /**
     * @function <a name="Tab">Tab</a>
     * @description Tab widget constructor.
     * @param {String} id The ID of the Tab container.
     * @param {Object} coords The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     *        Default is { top: 0, left: 0, width: 32, height: 20 }.
     * @param {Object} opt Style options defining the visual appearance of the widget.
     *                     Options can be given either as standard html style attributes or using the following widget attributes:
     * @param {'tab' | 'pills'} [opt.type='tab'] whether if container should be a tab ou a pills navigator
     * @param { array<Objects> } [opt.pages=[]] these objects should have the following schema {id: ... , title: ..., state: ...} state should match with PVS states
     * @param { function } [opt.callback=id] callback function to pass into widgets.
     * @param {String} [opt.displayKey='mode'] Key that holds active carousel page. PVS state must have this name.
     * @param {String} [opt.visibleWhen=true] Set when widget should or should not be displayed. This can be an expression to match with PVS state.
     * @memberof module:Tab
     * @instance
     */
    function Tab(id, coords, opt) {
        this.coords = coords || {};
        opt = this.normaliseOptions(opt);
        // set widget type & display key
        this.type = this.type || "Tab";
        this.displayKey = (typeof opt.displayKey === "string") ? opt.displayKey : 'mode';

        opt.backgroundColor = opt.backgroundColor || "black";
        opt.cursor = opt.cursor || "default";
        opt.overflow = "hidden";
        this.id = id
        /*** nav|tab|pill */
        this.type = opt.type || 'tab'
        // [{id: 'page1', title: 'Page 1', state:'PAGE1'}]
        this.pages = opt.pages || []
        this.callback = opt.callback || ((id) => id)
        this.parent = (opt.parent) ? (`#${opt.parent}`) : 'body'
        this.visibleWhen = this.visibleWhen || opt.visibleWhen || true
        this.buttons = []

        WidgetEVO.apply(this, [`${id}`, coords, opt]);
       
        this.createHTML()
                .render()
        return this;
    }
    Tab.prototype = Object.create(WidgetEVO.prototype);
    Tab.prototype.parentClass = WidgetEVO.prototype;
    Tab.prototype.constructor = Tab;

    /**
    * @protected
    * @function <a name="createHTML">createHTML</a>
    * @description this method creates the necessary HTML elements to show the tab or pills. 
    * It also creates the wodgets buttons to control widget behaviour.
    * @return {Object} self object, so that methods can be chained
    * @memberof module:Tab
    * @instance
    */
    Tab.prototype.createHTML = function () {
        /*** create the tab menu list */
        let ul = this.div.append('ul')
            .attr('class', `nav ${this.type === 'tab' ? 'nav-tabs' : ''} ${this.type === 'pill' ? 'nav-pills nav-fill' : ''}`)
            .attr('id', `${this.id}_tab`)
            .style('position', 'relative')
            .style('top', 0)
            .style('left',0)

        let tabContent = this.div.append('div')
            .attr('class', 'tab-content')
            .attr('id', `${this.id}_tab_content`)

        this.pages.forEach(page => {
            // tab menu html
            let li = ul.append('li')
                .attr('class', `nav-item ${this.activePage === page.id ? 'active' : ''} `)
                .attr('id', `${this.id}_${page.id}_li_pane_tab`)

            let a = li.append('a')
                .attr('class', `nav-link`)
                .attr('href', `#${this.id}_${page.id}_pane`)
                .attr('id', `${this.id}_${page.id}_pane_tab`)
                .attr('role', 'tab')
                .attr('aria-controls', `#${this.id}_${page.id}_pane`)
                .attr('aria-selected', 'true')
                .html(page.title)

            // pvsio buttons
            this.buttons.push(
                {
                    id: `${this.id}_${page.id}`,
                    // widget will be resized on render time
                    button: new ButtonEVO(`${this.id}_${page.id}_page`, 
                        {width: 0, height: 0,top: 0,left: 0}, 
                        {
                            softLabel: "",
                            backgroundColor: "gainsboro",
                            opacity: "0.2",
                            borderRadius: "4px",
                            fontsize: 10,
                            parent: `${this.id}_${page.id}_li_pane_tab`,
                            callback: this.callback,
                            position: 'absolute',
                            zIndex: 100
                        })
                }
            )

            // tabContent html
            let tabContentPage = tabContent.append('div')
                .attr('class', `tab-pane fade ${this.activePage === page.id ? ' show active' : ''}`)
                .attr('id', `${this.id}_${page.id}_pane`)
                .attr('role', 'tabpanel')
                .attr('aria-labelledby', `${this.id}_${page.id}_pane`)
                .style('position', 'relative')
                .style('top',0)
                .style('left',0)
                .style('width', `${this.coords.width}px`)
                .style('height', `${this.coords.height}px`)
                .style('color', 'red')
                .style('opacity', '1')

        });
        return this;
    }

    /**
     * @protected
     * @function <a name="setActiveTab">setActiveTab</a>
     * @description Sets new active tab. It will remove all active marks and set a new one
     * @param { String } state PVS state where it will find active page.
     * @return { Object } self object, so that methods can be chained
     * @memberof module:Tab
     * @instance
    */
    Tab.prototype.setActiveTab = function (state) {

        let activePageState = this.evaluate(this.displayKey, state)
        let activePage = this.pages.filter(page => page.state===activePageState)

        /* remove all active tab */
        let panes = this.div.selectAll('.tab-pane, .nav-item').each(function() {
            d3.select(this).classed('active',false)
            d3.select(this).classed('show',false)
        })

        /* set active page */
        if(activePage[0] !== undefined){
            this.div.select(`#${this.id}_${activePage[0].id}_li_pane_tab`).classed('active',true)
            this.div.select(`#${this.id}_${activePage[0].id}_pane`).classed('active',true).classed('show',true)
        }

        return this
    }

    /**
     * @function <a name="render">render</a>
     * @description Rendering function for button widgets.
     * @param {Object} state JSON object with the current value of the state attributes of the modelled system
     * @param {Object} opt Style options overriding the style attributes used when the widget was created.
     *                     The override style options are temporary, i.e., they are applied only for the present invocation of the render method.
     *                     Available options are either html style attributes or the following widget attributes:
     * @memberof module:Tab
     * @instance
     */
    Tab.prototype.render = function (state, opt) {
        if(state !== undefined && this.evalViz(state)){
            opt = this.normaliseOptions(opt);
            this.setStyle(opt)
                .setActiveTab(state)
                .reveal()
                .resizeButtonsWidgets(state, opt)
        }else{
            this.hide()
        }

        return this;
    }

    /** 
     * @protected
     * @function <a name="resizeButtonsWidgets">resizeButtonWidgets</a>
     * @description This method will resize widget button to fit html tab. This is necessary because bootstrap changes dinamically button size
     * based on its content and on creation time one can't pass widget size.
     * @param {Object} opt Style options overriding the style attributes used when the widget was created.
     *                     The override style options are temporary, i.e., they are applied only for the present invocation of the render method.
     *                     Available options are either html style attributes or the following widget attributes:
     * @return { Object } self object, so that methods can be chained
     * @memberof module:Tab
     * @instance
    */
    Tab.prototype.resizeButtonsWidgets = function (state, opt){
        let liCoords
        this.buttons.forEach((elem) => {
            let x = d3.select(elem.button.parent)
            liCoords = x.node().getBoundingClientRect()
            elem.button.base.style('width', `${liCoords.width}px`)
            elem.button.base.style('height', `${liCoords.height}px`)
            elem.button.overlay.style('width', `${liCoords.width}px`)
            elem.button.overlay.style('height', `${liCoords.height}px`)
            elem.button.render(state)
        })

        return this
    }

    module.exports = Tab
}
)