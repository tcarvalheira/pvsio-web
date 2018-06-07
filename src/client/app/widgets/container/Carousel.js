/**
 * @module Carousel
 * @version 1.0
 * @description Renders a carousel container with buttons to navigate through pages.
 * @author Tiago Carvalheira
 * @date 2018/06/01
 *
 * @example <caption>Example use of the container.</caption>
 // Example pvsio-web demo that uses Carousel
 // The following configuration assumes the pvsio-web demo is stored in a folder within pvsio-web/examples/demo/
 require.config({
     baseUrl: "../../client/app",
     paths: { d3: "../lib/d3", text: "../lib/text" }
 });
 require(["widgets/container/Carousel"], function (Carousel) {
      "use strict";
      var disp = new Carousel('giip',
            {
                width: 472,
                height: 260,
                top: 114,
                left: 76
            },
            {
                screens: [{"id" : "home", "title": "Home"}, 
                            {"id": "basal_mgm", "title": "Basal Management"}, 
                            {"id": "bolus_mgm", "title": "Bolus Management"}, 
                            {"id": "config", "title": "Pump Configuration"}, 
                            {"id": "data_mgm", "title": "Event Data Management"} ],
                parent: "device",
                callback: onMessageReceived,
                onSlideBsCarousel: () => {
                    //console.log('Carousel INIT')
                },
                onSlidBsCarousel: () => {
                    //console.log('Carousel END')
                }
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
     * @function <a name="Carousel">Carousel</a>
     * @description Constructor.
     * @param id {String} The ID of the touchscreen button.
     * @param coords {Object} The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     *        Default is { top: 0, left: 0, width: 32, height: 20 }.
     * @param {Object} opt
     *                  <li>{number} [interval=5000]</li>
     *                  <li>{boolean} [keyboard = true]</li>
     *                  <li>{string} [pause='hover']</li>
     *                  <li>{string} [ride=false]</li>
     *                  <li>{boolean} [wrap=true]</li>
     *                  <li>{boolean} [activeIndicators=false]</li>
     *                  <li>{function} [onSlideBsCarousel]</li>
     *                  <li>{function} [onSlidBsCarousel]</li>
     * @memberof module:Carousel
     * @instance
     */
    function Carousel(id, coords, opt) {
        coords = coords || {};
        opt = this.normaliseOptions(opt);
        // set widget type & display key
        this.type = this.type || "Carousel";
        this.displayKey = (typeof opt.displayKey === "string") ? opt.displayKey : id;
        // override default style options of WidgetEVO as necessary before creating the DOM element with the constructor of module WidgetEVO
        opt.backgroundColor = opt.backgroundColor || "black";
        opt.cursor = opt.cursor || "default";
        opt.overflow = "hidden";
        this.interval = opt.interval || 5000
        this.keyboard = opt.keyboard !== undefined ? opt.keyboard : true
        this.pause = opt.pause || 'hover'
        this.ride = opt.ride !== undefined ? opt.ride : false
        this.wrap = opt.wrap !== undefined ? opt.wrap : true
        this.activeIndicators = opt.activeIndicators || false
        this.onSlideBsCarousel = opt.onSlideBsCarousel || ((id) => id)
        this.onSlidBsCarousel = opt.onSlidBsCarousel || ((id) => id)

        /* id of each screen should be id-<screenname> */
        this.screens = opt.screens || []
        this.parent =(opt.parent) ? (`#${opt.parent}`) : 'body'
        /* TODO: handle callback appropriately */
        this.callback = opt.callback || ((a) => (a))
        this.id = id
        this.div = d3.select(this.parent)
                     .append('div')
                        .attr('id',`${id}`)
                        .attr('class','screen carousel slide')
                        .attr('data-interval', this.interval)
                        .attr('data-keyboard', this.keyboard)
                        .attr('data-pause', this.pause)
                        .attr('data-ride', this.ride)
                        .attr('data-wrap', this.wrap)
                        .style('left',`${coords.left}px`)
                        .style('top',`${coords.top}px`)
                        .style('width',`${coords.width}px`)
                        .style('height',`${coords.height}px`)
        

        $(`#${id}`).on('slide.bs.carousel', this.onSlideBsCarousel)
        $(`#${id}`).on('slid.bs.carousel', this.onSlidBsCarousel)
                        
        this.createHTML()

        /* TODO: configure the buttons  */
        this.next_screen = new ButtonEVO("next_screen", {
            width: 70,
            height: 50,
            top: 210,
            left: 402
        }, {
            softLabel: "",
            backgroundColor: "steelblue",
            opacity: "0.2",
            borderRadius: "4px",
            fontsize: 34,
            parent: `${id}`,
            callback: this.callback
        });
        this.previous_screen = new ButtonEVO("previous_screen", {
            width: 70,
            height: 50,
            top: 210,
            left: 0
        }, {
            softLabel: "",
            backgroundColor: "steelblue",
            opacity: "0.2",
            borderRadius: "4px",
            fontsize: 34,
            parent: `${id}`,
            callback: this.callback
        });
        // invoke WidgetEVO constructor to create the widget
        WidgetEVO.apply(this, [ id, coords, opt ]);
        return this;
    }
    Carousel.prototype = Object.create(WidgetEVO.prototype);
    Carousel.prototype.parentClass = WidgetEVO.prototype;
    Carousel.prototype.constructor = Carousel;

    /**
     * @function <a name="render">render</a>
     * @description Rendering function for button widgets.
     * @param state {Object} JSON object with the current value of the state attributes of the modelled system
     * @memberof module:Carousel
     * @instance
     */
    Carousel.prototype.render = function (state, opt) {
        // set style
        opt = this.normaliseOptions(opt);

        this.setStyle(opt);
        this.previous_screen.render()
        this.next_screen.render()

        this.reveal();
        /* just api tests */
        /* this.cyle({
            interval: 2000
            }); */
        
        /* test pause cycle after 15s 
            setInterval(this.pause, 15000) 
        */
        return this;
    }

    /**
     * @protected
     * @function <a name="createHTML">createHTML</a>
     * @description This method appends the necessary html to widget div
     * @return {Object} this
     * @memberof module:Carousel
     * @instance
     */
    Carousel.prototype.createHTML = function () {
        let indicators = this.div
                            .append('ol')
                            .attr('class','carousel-indicators')
                            .style('bottom', `-10px;`)

        let wrapper = this.div
                            .append('div')
                            .attr('class','carousel-inner')

        let leftControl = this.div 
                        .append('a')
                        .attr('class', 'left carousel-control' )
                        .attr('href',`#${this.id}`)
                        .style('height', `50px`)
                        .style('top', `210px`)
                        .style('background-color','black')
                        .style('border-radius','4px')
                        .append('span')
                            .attr('class','glyphicon glyphicon-chevron-left')
        
        let rightControl = this.div 
                        .append('a')
                        .attr('class', 'right carousel-control' )
                        .attr('href',`#${this.id}`)
                        .style('height', `50px`)
                        .style('top', `210px`)
                        .style('background-color','black')
                        .style('border-radius','4px')
                        .append('span')
                            .attr('class','glyphicon glyphicon-chevron-right')
        let counter = 0
        /* foreach screen create an item */
        this.screens.forEach(screen => {
            /* Indicators */
            let active = screen.id === 'home' ? 'active' : ''
            console.log(active)
            indicators
                .append('li')
                .attr('data-target',`#${this.id}`)
                .attr('class',`${active}`)
                .attr('data-slide-to', this.activeIndicators ? counter : null)
                .style('pointer-events:none;')
            
            /* Wraper for slides */
            wrapper
                .append('div')
                .attr('id', `${this.id}-${screen.id}`)
                .attr('class', `item ${active} center`)
                /* TODO: set w&h for each screen or inherit from parent? */
                .style('height', `262px`)
                .style(`width`,`480px`)
                    .append('div')
                    .attr('class','carousel-caption')
                    /* How to find  */
                    .style('top', `200px`)
                    .html(screen.title)
            /* left and right controls */
            counter += 1;
        });
        return this
     }
    /**
     * @function <a name="cyle">cyle</a>
     * @description Cycles through the carousel items from left to right
     * @param opt {Object} options object:
     *                      <li>{number} [inteval=5000] The amount of time to delay between automatically cycling an item. If false, carousel will not automatically cycle.</li>
     *                      <li>{boolean} [keyboard=true] Whether the carousel should react to keyboard events.</li>
     *                      <li>{string} [pause='hover'] If set to "hover", pauses the cycling of the carousel on mouseenter and resumes the cycling of the carousel on mouseleave. If set to false, hovering over the carousel won't pause it.

On touch-enabled devices, when set to "hover", cycling will pause on touchend (once the user finished interacting with the carousel) for two intervals, before automatically resuming. Note that this is in addition to the above mouse behavior.</li>
     *                      <li>{string} [ride=false] Autoplays the carousel after the user manually cycles the first item. If "carousel", autoplays the carousel on load.</li>
     *                      <li>{boolean} [wrap=true] Whether the carousel should cycle continuously or have hard stops.</li>
     * @return {Object} this
     * @memberof module:Carousel
     * @instance
     */
    Carousel.prototype.cyle = function (opt) {
        $('.carousel').carousel(opt)
        $('.carousel').carousel('cycle')
        return this;
    }

    /**
     * @function <a name="pause">pause</a>
     * @description Stops the carousel from cycling through items
     * @return {Object} this
     * @memberof module:Carousel
     * @instance
     */
    Carousel.prototype.pause = function () {
        $('.carousel').carousel('pause')
        return this
    }

    /**
         * @function <a name="prev">prev</a>
         * @description Cycles carousel to the previous item
         * @return {Object} this
         * @memberof module:Carousel
         * @instance
         */
    Carousel.prototype.prev = function () {
        $('.carousel').carousel('prev')
        return this
    }

    /**
     * @function <a name="next">Next</a>
     * @description Cycles carousel to the next item
     * @return {Object} this
     * @memberof module:Carousel
     * @instance
     */
    Carousel.prototype.next = function () {
        $('.carousel').carousel('next')
        return this
    }


    /**
     * @function <a name="goTo">goTo</a>
     * @description Cycles the carousel to a particular frame (0 based) 
     * @return {Object} this
     * @memberof module:Carousel
     * @instance
     */
    Carousel.prototype.goTo = function (number) {
        $('.carousel').carousel(number)
        return this
    }

    /**
     * @function <a name="dispose">dispose</a>
     * @description Destroys the carousel element
     * @return {Object} this
     * @memberof module:Carousel
     * @instance
     */
    Carousel.prototype.dispose = function (number) {
        $('.carousel').carousel('dispose')
        return this
    }
     
    module.exports = Carousel
   }
)