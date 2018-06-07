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
      var disp = new Pagination("disp", {
        top: 200, left: 120, height: 24, width: 120
      }, {
          ... 
      });
      disp.render();
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
     * @param id {String} The ID of the touchscreen button.
     * @param coords {Object} The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     *        Default is { top: 0, left: 0, width: 32, height: 20 }.
     * @param opt {Object} Style options defining the visual appearance of the widget.
     *                     Options can be given either as standard html style attributes or using the following widget attributes:
     *              <li>previousButton: {Boolean} set if there should be a previous button or not -- default: true</li> 
     *              <li>nextButton: {Boolean} set if there should be a next button or not -- default: true</li>
     *              <li>useIcons: {Boolean} set if icon should be used on previous and next buttons -- default: true</li>
     *              <li>pages: {Array} an array with the total pages of pagination -- default: []</li>
     *              <li>activeIndex {Integer} Active index, starting on 1 -- default: 1</li>
     *              <li>alignment {left | center | rigth}</li>
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
        this.parent =(opt.parent) ? (`#${opt.parent}`) : 'body'
        this.previousButton = opt.previousButton !== undefined ? opt.previousButton : true
        this.nextButton = opt.nextButton !== undefined ? opt.nextButton : true
        this.useIcons = opt.useIcons !== undefined ? opt.useIcons : true
        this.pages = opt.pages || []
        this.activeIndex = opt.activeIndex || 1
        this.alignment = opt.alignment || 'left'
        this.callback = opt.callback || ((id) => id)
        this.div = d3.select(this.parent)
        
        
        this.buttons = []

        // invoke WidgetEVO constructor to create the widget
        //WidgetEVO.apply(this, [ id, coords, opt ]);
        return this;
    }
    Pagination.prototype = Object.create(WidgetEVO.prototype);
    Pagination.prototype.parentClass = WidgetEVO.prototype;
    Pagination.prototype.constructor = Pagination;

    /**
     * @function <a name="render">render</a>
     * @description Rendering function. It will create the HTML and the relative Buttons
     * @param state {Object} JSON object with the current value of the state attributes of the modelled system
     * @param opt {Object} Style options overriding the style attributes used when the widget was created.
     *                     The override style options are temporary, i.e., they are applied only for the present invocation of the render method.
     *                     Available options are either html style attributes or the following widget attributes:
     * @memberof module:Pagination
     * @instance
     */
    Pagination.prototype.render = function (state, opt) {
        
        /*** remove buttons */
        this.buttons.forEach((button) => {
            button.button.remove()
        })
        this.buttons=[]

        opt = this.normaliseOptions(opt);
        this.setStyle(opt);
        /*** remove html */
        this.div.selectAll('nav').remove()
        /*** create HTML will create relative buttons */
        this.createHTML()

        /*** render buttons */
        this.buttons.forEach((button) => {
            button.button.render()
        })
        this.reveal();
        return this;
    }

    /**
    * @function <a name="createHTML">createHTML</a>
    * @description 
    * @param ... {Object} ... 
    * @memberof module:Pagination
    * @instance
    */
    Pagination.prototype.createHTML = function () {
        /*** create the ul element */
        let ul = this.div.append('nav')
                .attr('aria-label', this.ariaLabel)
                .style('position','absolute')
                .style('top', `${this.coords.top}px`)
                .style('left', `${this.coords.left}px`)                    
                .append('ul')
                    .attr('class','pagination')

        /*** create previous buttons html if there is previous button */
        if(this.previousButton){
            this.createOuttermostPage(ul, 'Previous', true)
        }

        /*** create inner buttons */
        let numButtons = this.getNumButton()
        let num = Math.floor((numButtons - 3) / 2)
        let total = this.pages.length
        let numLeft = num
        let numRight = num
        /*** calculate the number of pages on left */
        if((this.activeIndex + num) > total-1){
            numLeft = num + (this.activeIndex + num) - (total-1)
            numRight = total - 1 - this.activeIndex
        }
        /*** calculate the number of pages on right */
        if((this.activeIndex - num) <= 1){
            numLeft = this.activeIndex -2
            numRight = 2*num - numLeft
        }
        /*** for each page create a page while it fits on container width */
        this.pages.forEach((page, index) => {
            index = index +1
            /*** if the pages fits all inside container width */
            if( this.pages.length < numButtons ){
                this.createPage(ul, index, index)
            }else{
                /*** render first, last and then the inner pages that fits on widget width, create ... indicating ther are some more pages */
                //render just the first, the last, the active one, ... after first and before last and then create how many buttons it fits
                if(index === 1){
                    this.createPage(ul, index, index)
                    if(this.activeIndex - num > 2){
                        this.createPage(ul, '...', -1)
                    }
                }
                if(index === this.pages.length){
                    if(this.activeIndex + num < this.pages.length -1){
                        this.createPage(ul, '...', -1)
                    }
                    this.createPage(ul, index, index)   
                }
                if(index >= (this.activeIndex - numLeft) && index <= (this.activeIndex + numRight)){
                    if(index > 1 && index < this.pages.length){
                        this.createPage(ul, index, index)
                    }
                    
                }                    
            }
        });
        /*** create next button if there is a next button */
        if(this.nextButton){
            this.createOuttermostPage(ul, 'Next', false)
        }
        this.position = 0;
    }

    /**
    * @function <a name="createPage">createPage</a>
    * @description This method creates the pages inside the pagination widget
    * @param parent {ul Element} the ul node where the html buttons will be placed
    * @param title {String} The title of the button
    * @param index {Integer} The index of the button on overall list 
    * @memberof module:Pagination
    * @instance
    */
    Pagination.prototype.createPage = function (parent, title, index) {
        /*** create HTML */
        let li = parent.append('li')
                    .attr('class','page-item')            
        if(this.activeIndex === index){
            li.attr('class','active')
        }
        let x = li.append('a')
            .attr('class','page-link')
            .attr('href','#')
            .html(title)

        /*** create ButtonEvo */
        let element_coords =  x.node().getBoundingClientRect()
        let found = false
        found = this.buttons.find(function(element) {return element.id == index})
        if(index !== -1 && !found){
            this.buttons.push({
                id: index,
                button: new ButtonEVO(`${this.plainParent}_page_${index}`, {
                    width: element_coords.width,
                    height: element_coords.height,
                    top: element_coords.top-20, // this 20 is the margin, but i can't figure out how to work it arround
                    left: element_coords.left
                }, {
                    softLabel: "",
                    backgroundColor: "steelblue",
                    opacity: "0.2",
                    borderRadius: "4px",
                    fontsize: 34,
                    parent: `${this.id}`,
                    callback: this.callback,
                    zIndex: 10
                })
            })
        }
    }


    /**
    * @protected 
    * @function <a name="getNumButton">getNumButton</a>
    * @description This method return the number of visible buttons base on the container width and the width of the buttons
    * @memberof module:Pagination
    * @instance
    */
    Pagination.prototype.getNumButton = function () {
        let numButtons = 0
        numButtons = Math.floor(this.coords.width / 35) //button width
        /*** remove one button if there is a previous button */
        if(this.previousButton){
            numButtons = numButtons - 1    
        }
        /*** remove one button if there is a next button */
        if(this.nextButton){
            numButtons = numButtons - 1
        }
        return numButtons
    }

    /**
    * @protected
    * @function <a name="createOuttermostPage">createOuttermostPage</a>
    * @description This method creates the previous and the next (left and right) buttons html
    * @param parent {ul Node} the ul parent for the 
    * @param title {String} The title of the button, shown if not useIcons.
    * @param isPrevious {Boolean} set if it is the previous or the next button
    * @param onClick {Function} onClick callback
    * @memberof module:Pagination
    * @instance
    */
    Pagination.prototype.createOuttermostPage = function (parent, title, isPrevious) {
        /*** create HTML */
        let li = parent.append('li')
                .attr('class', 'page-item')
                .append('a')
                    .attr('class','page-link')
                    .attr('href','#')
                    .attr('aria-label',title)
            if(this.useIcons){
                li.append('span')
                    .attr('aria-hidden','true')
                    /*** if it is previous then « else is next, » */
                    .html(isPrevious === true ? '&laquo;' : '&raquo;')
                li.append('span')
                    .attr('class','sr-only')
                    .html(title)
            }else{
                li.html(title)
            }

            /*** create ButtonEvo */
            let element_coords =  li.node().getBoundingClientRect()
            let buttonTitle = isPrevious ? 'previous' : 'next'
            if(!this.hasButton(this.buttons, `${buttonTitle}`)){
                this.buttons.push(
                    {
                        id: `${buttonTitle}`,
                        button : new ButtonEVO(`${buttonTitle}_page`, {
                            width: element_coords.width,
                            height: element_coords.height,
                            top: element_coords.top-20, // this 20 is the margin, but i can't figure out how to work it arround
                            left: element_coords.left
                        }, {
                            softLabel: "",
                            backgroundColor: "steelblue",
                            opacity: "0.2",
                            borderRadius: "4px",
                            fontsize: 34,
                            parent: `${this.id}`,
                            callback: this.callback,
                            zIndex: 10
                        })
                    }
                )
            }                    
    }

    /**
    * @protected 
    * @function <a name="hasButton">hasButton</a>
    * @description checks in an array button_array if the button with id value is present
    * @param button_array {Array} array of buttons
    * @param value {string|integer} the value to check if is on array
    * @return true if the array contains an element with id=value, false otherwise
    * @memberof module:Pagination
    * @instance
    */
    Pagination.prototype.hasButton = function (button_array, value) {
        let found
        found = button_array.find(function(element) {return element.id === value})
        return found !== undefined;
    }

    /**
    * @function <a name="setActivePage">setActivePage</a>
    * @description Set the active index of pagination
    * @param page {Integer} index page active
    * @memberof module:Pagination
    * @instance
    */
    Pagination.prototype.setActivePage = function (page) {
        this.activeIndex = page;
        this.render();
        return this;
    } 

    /**
    * @function <a name="getActiveIndex">getActiveIndex</a>
    * @description Get the active index of the paginator
    * @memberof module:Pagination
    * @instance
    */
    Pagination.prototype.getActiveIndex = function () {
        return this.activeIndex;
    }

    /**
    * @function <a name="getTotalPages">getTotalPages</a>
    * @description returns the total number of pages
    * @memberof module:Pagination
    * @instance
    */
    Pagination.prototype.getTotalPages = function () {
        return this.pages.length
    }   

    module.exports = Pagination
   }
)