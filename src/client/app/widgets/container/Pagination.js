/**
 * @module Pagination
 * @version 1.0
 * @description This content widget will render a set of pages with associated buttons for pvs integration
 * @author Tiago Carvalheira
 * @date 2018/06/01
 *
 * @example <caption>Example use of the widget.</caption>
 // Example pvsio-web demo that uses Pagination
 // The following configuration assumes the pvsio-web demo is stored in a folder within pvsio-web/examples/demo/
 require.config({
     baseUrl: "../../client/app",
     paths: { d3: "../lib/d3", text: "../lib/text" }
 });
 require(["widgets/container/Pagination"], function (Pagination) {
      "use strict";
      var pagination: new Pagination('pagination',
                {top: 100,left: 100,width: 400,height: 50},
                {
                    pages: 7, 
                    callback: onMessageReceived,
                    opacity: '0',
                    parent: 'content',
                    displayKey: 'pag_active'
                }),
      pagination.render();
 });
 *
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require, exports, module) {
    "use strict";
    var WidgetEVO = require("widgets/core/WidgetEVO");
    const ButtonEVO = require("widgets/core/ButtonEVO")

    /**
     * @function <a name="Pagination">Pagination</a>
     * @description Constructor.
     * @param {String} id The ID of the touchscreen button.
     * @param {Object} coords The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     *        Default is { top: 0, left: 0, width: 32, height: 20 }.
     * @param {Object} opt Style options defining the visual appearance of the widget.
     *                     Options can be given either as standard html style attributes or using the following widget attributes:
     * @param {Boolean} [opt.previousButton=true] set if there should be a previous button or not
     * @param {Boolean} [opt.nextButton=true] set if there should be a next button or not
     * @param {Boolean} [opt.useIcons=true] set if icon should be used on previous and next buttons
     * @param {Array} [opt.pages=[]] an array with all pages of pagination
     * @param {Integer} [opt.activeIndex=1] {Integer} set the active index
     * @param {left | center | right} [opt.alignment='left'] set the widget alignment
     * @memberof module:Pagination
     * @instance
     */
    function Pagination(id, coords, opt) {
        coords = coords || {};
        opt = this.normaliseOptions(opt);
        // set widget type & display key
        this.type = this.type || "Pagination";
        this.displayKey = (typeof opt.displayKey === "string") ? opt.displayKey : id;
        this.id = id
        // override default style options of WidgetEVO as necessary before creating the DOM element with the constructor of module WidgetEVO
        opt.backgroundColor = opt.backgroundColor || "black";
        opt.cursor = opt.cursor || "default";
        opt.overflow = "hidden";
        this.coords = coords
        this.plainParent = opt.parent || 'body'
        this.parent = (opt.parent) ? (`#${opt.parent}`) : 'body'
        this.callback = opt.callback || ((id) => id)
        
        this.previousButton = opt.previousButton !== undefined ? opt.previousButton : true
        this.nextButton = opt.nextButton !== undefined ? opt.nextButton : true
        this.useIcons = opt.useIcons !== undefined ? opt.useIcons : true
        this.pages = opt.pages || []
        this.activeIndex = opt.activeIndex || 1
        

        this.buttons = []
        this.visibilityArray = new Array(this.pages)

        WidgetEVO.apply(this, [ `${id}`, coords, opt ]);

        this.createHTML()
        return this;
    }
    Pagination.prototype = Object.create(WidgetEVO.prototype);
    Pagination.prototype.parentClass = WidgetEVO.prototype;
    Pagination.prototype.constructor = Pagination;

    /**
     * @function <a name="render">render</a>
     * @description Rendering function. It will create the HTML and the relative Buttons
     * @param {Object} state JSON object with the current value of the state attributes of the modelled system
     * @param {Object} opt Style options overriding the style attributes used when the widget was created.
     *                     The override style options are temporary, i.e., they are applied only for the present invocation of the render method.
     *                     Available options are either html style attributes or the following widget attributes:
     * @return { Object } The object itself, so that methods can be chained
     * @memberof module:Pagination
     * @instance
     */
    Pagination.prototype.render = function (state, opt) {
        opt = this.normaliseOptions(opt)
        this.setStyle(opt)
            .reveal()
            .resizeButtonWidgets(state, opt)
            .renderButtonWidgets(state, opt)
            .setActivePage(state)
        return this;
    }

    /**
     * @protected
    * @function <a name="createHTML">createHTML</a>
    * @description This method creates the necessary HTML for the pagination widget
    * @return { Object } The object itself, so that methods can be chained 
    * @memberof module:Pagination
    * @instance
    */
    Pagination.prototype.createHTML = function () {
        /*** create the ul element */
        let ul = this.div.append('nav')
            .attr('aria-label', this.ariaLabel)
            .style('position', 'relative')
            .style('top', 0)
            .style('left', 0)
            .append('ul')
            .attr('class', 'pagination')

        /*** create previous buttons html if there is previous button */
        if (this.previousButton) {
            this.createOuttermostPage(ul, 'Previous', true)
        }

        /*** create inner buttons */
        let numButtons = this.getNumButton()
        let num = Math.floor((numButtons - 3) / 2)
        let total = this.pages
        let numLeft = num
        let numRight = num
        /*** calculate the number of pages on left */
        if ((this.activeIndex + num) > total - 1) {
            numLeft = num + (this.activeIndex + num) - (total - 1)
            numRight = total - 1 - this.activeIndex
        }
        /*** calculate the number of pages on right */
        if ((this.activeIndex - num) <= 1) {
            numLeft = this.activeIndex - 2
            numRight = 2 * num - numLeft
        }


        /* this cycle is the begining of handle more button than widget width can hold. */
        for(let i = 1; i <= this.pages; i++){
            /* if pages fits all inside container width */
            if(this.pages < numButtons){
                this.createPage(ul, i, i)
            }else{
                /* render first, last and then the inner pages that fits on widget. Create ... indicating there are some more pages */
                if (i === 1) {
                    this.createPage(ul, i, i)
                    if (this.activeIndex - num > 2) {
                        this.createPage(ul, '...', -1)
                    }
                }
                if (i === this.pages) {
                    if (this.activeIndex + num < this.pages) {
                        this.createPage(ul, '...', -1)
                    }
                    this.createPage(ul, i, i)
                }
                if (i >= (this.activeIndex - numLeft) && i <= (this.activeIndex + numRight)) {
                    if (i > 1 && i < this.pages) {
                        this.createPage(ul, i, i)
                    }

                }
            }
        }

        /*** create next button if there is a next button */
        if (this.nextButton) {
            this.createOuttermostPage(ul, 'Next', false)
        }
        return this
    }

    /**
     * @protected
    * @function <a name="createPage">createPage</a>
    * @description This method creates the pages div inside the pagination widget
    * @param {Element} parent the ul node where the html buttons will be placed
    * @param {String} title The title of the button
    * @param {Integer} index The index of the button on overall list 
    * @return {Object} slef object, so that methods can be chained
    * @memberof module:Pagination
    * @instance
    */
    Pagination.prototype.createPage = function (parent, title, index) {
        /*** create HTML */
        let li = parent.append('li')
            .attr('id', `${this.id}_li_${index}`)
            .attr('class', 'page-item')
            /* set inicial active page*/
            .classed('active',this.activeIndex === index)

        let x = li.append('a')
            .attr('id', `${this.id}_a_${index}`)
            .attr('class', 'page-link')
            .attr('href', '#')
            .html(title)

        /*** create ButtonEvo */
        let found = false
        found = this.buttons.find(function (element) { return element.id === index })
        if (index !== -1 && !found) {
            this.buttons.push({
                id: index,
                button: new ButtonEVO(`${this.id}_page_${index}`, 
                    {width: 0,height: 0,top: 0,left: 0}, 
                    {
                        parent: `${this.id}_a_${index}`,
                        softLabel: "",
                        backgroundColor: "steelblue",
                        opacity: "0.2",
                        borderRadius: "4px",
                        fontsize: 34,
                        callback: this.callback,
                        zIndex: 10,
                        position: 'absolute'
                    })
            })
        }
        return this
    }


    /**
    * @protected 
    * @function <a name="getNumButton">getNumButton</a>
    * @description This method return the number of visible buttons base on the container width and the width of the buttons
    * @return {Integer} the number of button that fits on the widget
    * @memberof module:Pagination
    * @instance
    */
    Pagination.prototype.getNumButton = function () {
        let numButtons = 0
        numButtons = Math.floor(this.coords.width / 37) //button width
        /*** remove one button if there is a previous button */
        if (this.previousButton) {
            numButtons = numButtons - 1
        }
        /*** remove one button if there is a next button */
        if (this.nextButton) {
            numButtons = numButtons - 1
        }
        return numButtons
    }

    /**
    * @protected
    * @function <a name="createOuttermostPage">createOuttermostPage</a>
    * @description This method creates the previous and the next (left and right) buttons html
    * @param {Element} parent the ul parent for the list 
    * @param {String} title The title of the button, shown if not useIcons.
    * @param {Boolean} isPrevious set if it is the previous or the next button
    * @param {Function} onClick onClick callback
    * @return {Object} self object, so that methods can be chained
    * @memberof module:Pagination
    * @instance
    */
    Pagination.prototype.createOuttermostPage = function (parent, title, isPrevious) {
        /*** create HTML */
        let button_name
        isPrevious === true ? button_name = 'prev' : button_name = 'next'
        let li = parent.append('li')
            
            .attr('class', 'page-item')
            .append('a')
            .attr('id', `${this.id}_button_${button_name}`)
            .attr('class', 'page-link')
            .attr('href', '#')
            .attr('aria-label', title)
        if (this.useIcons) {
            li.append('span')
                .attr('aria-hidden', 'true')
                /*** if it is previous then « else is next, » */
                .html(isPrevious === true ? '&laquo;' : '&raquo;')
            li.append('span')
                .attr('class', 'sr-only')
                .html(title)
        } else {
            li.html(title)
        }

        /*** create ButtonEvo */
        let buttonTitle = isPrevious ? 'previous' : 'next'
        if (!this.hasButton(this.buttons, `${buttonTitle}`)) {
            this.buttons.push(
                {
                    id: `${buttonTitle}`,
                    button: new ButtonEVO(`${this.id}_${buttonTitle}_page`, 
                        {width: 0,height: 0,top: 0,left: 0}, 
                        {
                            softLabel: "",
                            backgroundColor: "steelblue",
                            opacity: "0.2",
                            borderRadius: "4px",
                            fontsize: 34,
                            parent: `${this.id}_button_${button_name}`,
                            callback: this.callback,
                            zIndex: 10,
                            position: 'absolute'
                        })
                }
            )
        }
        return this
    }

    /**
    * @protected 
    * @function <a name="hasButton">hasButton</a>
    * @description checks in an array button_array if the button with id value is present
    * @param {Array} button_array {Array} array of buttons
    * @param {String} value {string|integer} the value to check if is on array
    * @return {Boolean} true if the array contains an element with id=value, false otherwise
    * @memberof module:Pagination
    * @instance
    */
    Pagination.prototype.hasButton = function (button_array, value) {
        return button_array.find(function (element) { return element.id === value }) !== undefined;
    }

    /**
     * @protected
    * @function <a name="setActivePage">setActivePage</a>
    * @description Set the active index of pagination. It defines the active page on paginator
    * @param {Object} state PVS state of the model
    * @return {Object} self object, so that methods can be chained
    * @memberof module:Pagination
    * @instance
    */
    Pagination.prototype.setActivePage = function (state) {
        let activePageState = this.getActiveIndex(state)

        /* remove all old active pages */
        this.div.selectAll('.page-item')
                .each(function () {
                    d3.select(this).classed('active', false)
                })
        /* set new active page */
        this.div.select(`#${this.id}_li_${activePageState}`)
                .classed('active', true)
               
        this.activeIndex = activePageState;
        return this;
    }

    /**
     * @protected
    * @function <a name="getActiveIndex">getActiveIndex</a>
    * @description Get the active index of the paginator given state
    * @param { Object } state PVS state of model
    * @return {Number} the active page index on given state
    * @memberof module:Pagination
    * @instance
    */
    Pagination.prototype.getActiveIndex = function (state) {
        return this.evaluate(this.displayKey, state);
    }

    /**
     * @protected
    * @function <a name="getTotalPages">getTotalPages</a>
    * @description returns the total number of pages
    * @return {Number} the number of existing pages
    * @memberof module:Pagination
    * @instance
    */
    Pagination.prototype.getTotalPages = function () {
        return this.pages
    }


    /** 
     * @protected
     * @function <a name="resizeButtonWidgets">resizeButtonWidgets</a>
     * @description resizes each button based on created pagination html
     * @return { Object } self object, so that methods can be chained
     * @memberof module:Pagination
     * @instance
    */
    Pagination.prototype.resizeButtonWidgets = function (state, opt) {
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

    /**  
     * @protected
     * @function <a name="renderButtonWidgets">renderButtonWidgets</a>
     * @description call render method for each button in widget
     * @return { Object } self object, so that methods can be chained
     * @memberof module:Pagination
     * @instance
    */
    Pagination.prototype.renderButtonWidgets = function () {
        this.buttons.forEach((button) => {
            button.button.render()
        })
        return this
    }

    module.exports = Pagination
}
)

/* FUTURE WORK - handle a number of pages greater than it fit on widget */
/* Create a div for each page and render only elements inside active div */