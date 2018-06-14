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
      var disp = new Tab('nav-tab',
                {
                    top: 300,
                    left: 50,
                    width: 500,
                    height: 50
                },
                {
                    pages: [{id: 'page1', title: 'Page 1'},{id: 'page2', title: 'Page 2'},{id: 'page3', title: 'Page 3'},{id: 'page4', title: 'Page 4'}],
                    type: 'tab',
                    callback: onMessageReceived,
                    parent: 'tabs'
                })
      disp.render();
 });
 *
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require, exports, module) {
    "use strict";
    var WidgetEVO = require("widgets/core/WidgetEVO");
    var ButtonEVO = require("widgets/core/ButtonEVO")
    /**
     * @function <a name="Tab">Tab</a>
     * @description Constructor.
     * @param id {String} The ID of the touchscreen button.
     * @param coords {Object} The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     *        Default is { top: 0, left: 0, width: 32, height: 20 }.
     * @param {Object} opt Style options defining the visual appearance of the widget.
     *                     Options can be given either as standard html style attributes or using the following widget attributes:
     * @param {'tab' | 'pills'} [opt.type='tab']
     * @param { array<Objects> } [opt.pages=[]] these objects should have the following schema {id: ... , title: ...}
     * @param { function } [opt.callback=id] callback function to pass into widgets.
     * @param { String } [opt.activePage=1] set the active page
     * @memberof module:Tab
     * @instance
     */
    function Tab(id, coords, opt) {
        this.coords = coords || {};
        opt = this.normaliseOptions(opt);
        // set widget type & display key
        this.type = this.type || "Tab";
        this.displayKey = (typeof opt.displayKey === "string") ? opt.displayKey : id;

        // override default style options of WidgetEVO as necessary before creating the DOM element with the constructor of module WidgetEVO
        opt.backgroundColor = opt.backgroundColor || "black";
        opt.cursor = opt.cursor || "default";
        opt.overflow = "hidden";
        this.id = id
        /*** nav|tab|pill */
        this.type = opt.type || 'tab'
        // [{id: 'page1', title: 'Page 1'}]
        this.pages = opt.pages || []
        this.callback = opt.callback || ((id) => id)

        this.parent = (opt.parent) ? (`#${opt.parent}`) : 'body'
        this.div = d3.select(this.parent)
            .append('div')
            .attr('id', this.id)
        this.activePage = opt.activePage || this.pages[0].id

        this.buttons = [] // array of ButtonEvo
        // invoke WidgetEVO constructor to create the widget
        //WidgetEVO.apply(this, [ id, coords, opt ]);
        return this;
    }
    Tab.prototype = Object.create(WidgetEVO.prototype);
    Tab.prototype.parentClass = WidgetEVO.prototype;
    Tab.prototype.constructor = Tab;

    /**
     * @protected
    * @function <a name="createHTML">createHTML</a>
    * @description this method creates the necessary elements to show the tab or pills
    * @memberof module:Tab
    * @instance
    */
    Tab.prototype.createHTML = function () {
        /*** create the tab menu list */
        let ul = this.div.append('ul')
            .attr('class', `nav ${this.type === 'tab' ? 'nav-tabs' : ''} ${this.type === 'pill' ? 'nav-pills nav-fill' : ''}`)
            .attr('id', `${this.id}_tab`)
            .style('position', 'absolute')
            .style('top', `${this.coords.top}px`)
            .style('left', `${this.coords.left}px`)
            .style('width', `${this.coords.width}px`)
            .style('height', `${this.coords.height}px`)

        let tabContent = this.div.append('div')
            .attr('class', 'tab-content')
            .attr('id', `${this.id}-tab-content`)

        this.pages.forEach(page => {
            // tab menu html
            let li = ul.append('li')
                .attr('class', `nav-item ${this.activePage === page.id ? 'active' : ''} `)

            let a = li.append('a')
                .attr('class', `nav-link`)
                .attr('href', `#${this.id}-${page.id}-pane`)
                .attr('id', `${this.id}-${page.id}-pane-tab`)
                .attr('role', 'tab')
                .attr('aria-controls', `#${this.id}-${page.id}-pane`)
                .attr('aria-selected', 'true')
                .html(page.title)

            let element_coords = li.node().getBoundingClientRect()

            // tabContent html
            let tabContentPage = tabContent.append('div')
                .attr('class', `tab-pane fade ${this.activePage === page.id ? ' show active' : ''}`)
                .attr('id', `${this.id}-${page.id}-pane`)
                .attr('role', 'tabpanel')
                .attr('aria-labelledby', `${this.id}-${page.id}-pane`)
                .style('position', 'absolute')
                .style('top', `${this.coords.top + 50}px`)
                .style('left', `${this.coords.left}px`)
                .style('width', `${this.coords.width}px`)
                .style('height', `${this.coords.height}px`)
                .style('color', 'red')
                .style('opacity', '1')

            // pvsio buttons
            this.buttons.push(
                {
                    id: `${this.id}_${page.id}`,
                    button: new ButtonEVO(`${this.id}_${page.id}_page`, {
                        width: element_coords.width,
                        height: element_coords.height,
                        top: this.coords.top,
                        left: element_coords.left
                    }, {
                            softLabel: "",
                            backgroundColor: "steelblue",
                            opacity: "0.2", // change to zero to put the buttons invisible
                            borderRadius: "4px",
                            fontsize: 34,
                            parent: `${this.id}`,
                            callback: this.callback,
                            zIndex: 10
                        })
                }
            )
        });
        return this;
    }

    /**
    * @function <a name="setActiveTab">setActiveTab</a>
    * @description Sets new active tab. This can be used on the callback method to change active page based on PVS state
    * @param { String } tab page id to turn active
    * @memberof module:Tab
    * @instance
    */
    Tab.prototype.setActiveTab = function (tab) {
        let found = this.pages.find((elem) => { return elem.id === tab })
        if (found !== undefined) {
            this.activePage = tab
        } else {
            this.activePage = this.pages[0].id
        }
        return this.render()
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
        /*** remove all the buttons before c */
        this.buttons.forEach((button) => {
            button.button.remove()
        })
        this.buttons = []
        // set style
        opt = this.normaliseOptions(opt);
        this.setStyle(opt);
        // render content
        this.div.selectAll(`#${this.id}_tab`).remove()
        this.div.selectAll(`#${this.id}-tab-content`).remove()
        this.createHTML()

        /*** render buttons */
        this.buttons.forEach((button) => {
            button.button.render()
        })

        this.reveal();
        return this;
    }
    module.exports = Tab
}
)