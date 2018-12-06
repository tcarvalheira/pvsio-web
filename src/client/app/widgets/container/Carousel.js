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
     * @param {Object} coords The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     *        Default is { top: 0, left: 0, width: 32, height: 20 }.
     * @param {Object} opt Optional values for the widget:
     * @param {Number} [opt.number=5000] The amount of time to delay between automatically cycle an item. If false, carousel will not automatically cycle
     * @param {Boolean} [opt.keyboard=true] Whether the carousel should react to keyboard events
     * @param {String | boolean} [opt.pause='hover'] If set to "hover", pauses the cycling of the carousel on mouseenter and resumes the cycling of the carousel on mouseleave. If set to false, hovering over the carousel won't pause it. 
     * On touch-enabled devices, when set to "hover", cycling will pause on touchend (once the user finished interacting with the carousel) for two intervals, before automatically resuming. Note that this is in addition to the above mouse behavior.
     * @param {String} [opt.ride='false'] Autoplays the carousel after the user manually cycles the first item. If "carousel", autoplays the carousel on load.
     * @param {Boolean} [opt.wrap='true'] Whether the carousel should cycle continuously or have hard stops.
     * @param {Object} [opt.buttonPrevious]
     * @param {Object} [opt.buttonPrevious.coords] The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     * @param {Object} [opt.buttonPrevious.opt]
     * @param {Object} [opt.buttonNext]
     * @param {Object} [opt.buttonNext.coords] The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     * @param {Object} [opt.buttonNext.opt]
     * @param {Boolean} [opt.usePreDoneHTML=false] Set if the widget should create the HTML code or reuse user HTML. This HTML should follow some naming conventions
     * To use PreDoneHTML, there are some naming conventions. There should be:
     * div Element of the id equals to <widget_id>
     * ol Element with id <widget_id>_indicators
     * a Element with id <widget_id>_left_controller
     * a Element with id <widget_id>_rigth_controller
     * 
     * @param {Object} [opt.screens={}] Object with PVS states and corresponding index on carousel
     * @param {String} [opt.displayKey='mode'] Key that holds active carousel page
     * @memberof module:Carousel
     * @instance
     */
    function Carousel(id, coords, opt) {
        coords = coords || {};
        this.coords = coords
        opt = this.normaliseOptions(opt);
        // set widget type & display key
        this.type = this.type || "Carousel";
        /* PVS keys definition */
        this.displayKey = (typeof opt.displayKey === "string") ? opt.displayKey : 'mode';
        // override default style options of WidgetEVO as necessary before creating the DOM element with the constructor of module WidgetEVO
        opt.backgroundColor = opt.backgroundColor || "black";
        opt.cursor = opt.cursor || "default";
        opt.overflow = "hidden";
        this.interval = opt.interval !== undefined ? opt.interval : 5000
        this.keyboard = opt.keyboard !== undefined ? opt.keyboard : true
        this.pause = opt.pause !== undefined ? opt.pause : 'hover'
        this.ride = opt.ride !== undefined ? opt.ride : false
        this.wrap = opt.wrap !== undefined ? opt.wrap : true
        this.activeIndicators = opt.activeIndicators !== undefined ? opt.activeIndicators : false
        this.onSlideBsCarousel = opt.onSlideBsCarousel || ((id) => id)
        this.onSlidBsCarousel = opt.onSlidBsCarousel || ((id) => id)
        
        /* set default values for prev or next buttons if not defined */
        let prevCoords
        let nextCoords
        if(opt.buttonPrevious === undefined){
            prevCoords = {width: 70, height: 50, top:this.coords.height-50, left: 0}
        }else{
            prevCoords = opt.buttonPrevious.coords
        }
        if(opt.buttonNext === undefined){
            nextCoords = {width: 70, height: 50, top:this.coords.height-50, left: this.coords.width - 70}
        }else{
            nextCoords = opt.buttonNext.coords
        }
        
        
        this.buttonPrevious = opt.buttonPrevious || { coords:prevCoords, opt }
        this.buttonNext = opt.buttonNext || { coords:nextCoords, opt }

        /* id of each screen should be id-<screenname> */
        this.screens = opt.screens || [] // Screens names must coincide with PVS states

        /* variable to use html pre done*/
        this.usePreDoneHTML = opt.usePreDoneHTML === undefined ? false : opt.usePreDoneHTML
        this.states = opt.states || {}

        this.parent = (opt.parent) ? (`#${opt.parent}`) : 'body'
        this.callback = opt.callback || ((a) => (a))
        this.id = id
        WidgetEVO.apply(this, [id, coords, opt]);
        if(!this.usePreDoneHTML){
            this.base.style('z-index','-100')

            this.masterDiv = this.div // = d3.select(this.parent)
            .append('div')
            .attr('id', `${id}`)
            .attr('class', 'screen carousel slide')
            .attr('data-interval', this.interval)
            .attr('data-keyboard', this.keyboard)
            .attr('data-pause', this.pause)
            .attr('data-ride', this.ride)
            .attr('data-wrap', this.wrap)
            .style('position','relative')
            .style('left','0px')
            .style('top','0px')
            .style('width',`${this.div.style('width')}`)
            .style('height',`${this.div.style('height')}`)
            .style('z-index','-10')

            /*** create html elements */
            this.createHTML()
        }else{
            /* load pre-existing elements based on its id */
            /*** this will define name convention */
            this.div = d3.select(`#${id}`)
            this.indicators = d3.select(`#${this.id}_indicators`)
            /* ATENTION: here is a selector class based */
            this.captions = d3.selectAll(`.${this.id}_carousel_caption`)
            this.wrapper = d3.select(`#${this.id}_wrapper`)
            this.leftControl = d3.select(`#${this.id}_left_control`)
            this.rightControl = d3.select(`#${this.id}_right_control`)
        }
        
        this.createButtons()
        this.hideCarouselElements()

        /*set   event listeners. Para que preciso dos eventos aqui? */
        //$(`#${id}`).on('slide.bs.carousel', this.onSlideBsCarousel)
        //$(`#${id}`).on('slid.bs.carousel', this.onSlidBsCarousel)
        
        /* need to render widget. This way i have width and height to set buttons */
        this.render()
        return this;
    }
    Carousel.prototype = Object.create(WidgetEVO.prototype);
    Carousel.prototype.parentClass = WidgetEVO.prototype;
    Carousel.prototype.constructor = Carousel;

    /**
     * @function <a name="render">render</a>
     * @description Rendering function for button widgets.
     * @param {Object} state JSON object with the current value of the state attributes of the modelled system
     * @memberof module:Carousel
     * @instance
     */
    Carousel.prototype.render = function (state, opt) {
        opt = this.normaliseOptions(opt);

        this.setStyle(opt);

        this.revealCarouselElements()
        let leftOpts = this.leftControl.node().getBoundingClientRect()
        this.previous_screen.setStyle({
            top:0,
            left:0,
            width: `${leftOpts.width}px`,
            height: `${leftOpts.height}px`
        })
        /* TODO: check if there should be a method resize or method setStyle should update overlay layer as well. Doing this way widget isn't encapsulated*/
        /* need to resize overlay layer in order to button be clickable */
        this.previous_screen.overlay.style('width',`${leftOpts.width}px`)
        this.previous_screen.overlay.style('height',`${leftOpts.height}px`)
    
        let rightOpts = this.rightControl.node().getBoundingClientRect()
        this.next_screen.setStyle({
            top:0,
            left:0,
            width: `${rightOpts.width}px`,
            height: `${rightOpts.height}px`
        })
        /* need to resize overlay layer in order to button be clickable */
        this.next_screen.overlay.style('width',`${rightOpts.width}px`)
        this.next_screen.overlay.style('height',`${rightOpts.height}px`)


        this.previous_screen.render(state,opt)
        this.next_screen.render(state,opt)

        /*** goto to carousel id based on PVS state */
        if(state !== undefined){
            /* PVS states should be equal to carousel pages */
            let page = this.evaluate(this.displayKey, state)
            //this.goTo(this.states[`${state.mode}`])    
            this.goTo(this.states[page])
        }
        this.reveal()
        return this;
    }

    	/**
         * @private
        * @function <a name="createButtons">createButtons</a>
        * @description This method will create the action buttons for the carousel
        * @memberof module:Carousel
        * @instance
        */
        Carousel.prototype.createButtons = function () {
            if(this.next_screen === undefined || this.next_screen === null){
                this.next_screen = new ButtonEVO("next_screen", {
                    /* with position:relative, this will place widgets over original HTML */ 
                    top: 0, 
                    left: 0,
                    /* the widget will be resized on render time */
                    width: 0,
                    height:  0
                }, {
                    softLabel: "",
                    backgroundColor: "steelblue",
                    opacity: "0.2",
                    borderRadius: "4px",
                    fontsize: 34,
                    parent:  this.rightControl.node().id,
                    callback: this.callback,
                    position:'relative',
                    zIndex: 0
                })

                this.next_screen.overlay.style('z-index','100')
            }

            if(this.previous_screen === undefined || this.previous_screen === null){
                this.previous_screen = new ButtonEVO("previous_screen", {
                    /* this top and left set to  0 with position:relative will place widget over original HTML */
                    top: 0, 
                    left: 0,
                    /*the widget will be resized on render time */ 
                    width: 0,
                    height: 0
                }, {
                        softLabel: "",
                        backgroundColor: "steelblue",
                        opacity: "0.2",
                        borderRadius: "4px",
                        fontsize: 34,
                        parent: this.leftControl.node().id,
                        callback: this.callback,
                        position: 'relative',
                        zIndex: 100
                    });
            }
    }

    	/**
        * @function <a name="hideCarouselElements">hideCarouselElements</a>
        * @description Hide all elements inside carousel.
        * @memberof module:Carousel
        * @instance
        */
        Carousel.prototype.hideCarouselElements = function () {
            this.masterDiv.style('display','none')
            this.indicators.style('display','none')
            this.captions.forEach((item) => {
                item.forEach((i) => {
                    i.style.display = 'none'
                })
            })
            this.wrapper.style('display','none')
            this.leftControl.style('display','none')
            this.rightControl.style('display','none')
        }   

    	/**
        * @function <a name="reveal">reveal</a>
        * @description Reveal all elements of carousel
        * @memberof module:Carousel
        * @instance
        */
        Carousel.prototype.revealCarouselElements = function () {
            this.masterDiv.style('display','block')
            this.indicators.style('display','block')
            this.captions.forEach( (item) => {
                item.forEach( (i) => {
                    i.style.display = 'block'
                })
            })
            this.wrapper.style('display','block')
            this.leftControl.style('display','block')
            this.rightControl.style('display','block')
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
        this.indicators = this.masterDiv
            .append('ol')
            .attr('id',`${this.id}_indicators`)
            .attr('class', 'carousel-indicators')
            .style('bottom', `-10px;`)
        this.captions = []

        this.wrapper = this.masterDiv
            .append('div')
            .attr('id',`${this.id}_wrapper`)
            .attr('class', 'carousel-inner')
            .style('position', 'absolute')
            .style('top','0px')
            .style('left','0px')
            .style('width','100%')
            .style('height','100%')
            .style('z-index','-10')


        this.leftControl = this.masterDiv
            .append('a')
            .attr('id',`${this.id}_left_control`)
            .attr('class', 'left carousel-control')
            //.attr('href', `#${this.id}`)
            .style('height', `50px`)
            .style('top', `210px`)
            .style('background-color', 'black')
            .style('border-radius', '4px')

        this.leftControl
            .append('span')
            .attr('class', 'glyphicon glyphicon-chevron-left')

        this.rightControl = this.masterDiv
            .append('a')
            .attr('id',`${this.id}_rigth_control`)
            .attr('class', 'right carousel-control')
            //.attr('href', `#${this.id}`)
            .style('height', `50px`)
            .style('top', `210px`)
            .style('background-color', 'black')
            .style('border-radius', '4px')
            
        this.rightControl
            .append('span')
            .attr('class', 'glyphicon glyphicon-chevron-right')
        let counter = 0
        /* foreach screen create an item */
        this.screens.forEach(screen => {
            /* Indicators */
            let active = screen.id === 'home' ? 'active' : ''
            // console.log(active)
            this.indicators
                .append('li')
                .attr('data-target', `#${this.id}`)
                .attr('class', `${active}`)
                .attr('data-slide-to', this.activeIndicators ? counter : null)
                .style('pointer-events:none;')

            /* Wraper for slides */
            this.wrapper
                .append('div')
                .attr('id', `${this.id}-${screen.id}`)
                .attr('class', `item ${active} center`)
                /* TODO: set w&h for each screen or inherit from parent? */
                .style('height', '100%')
                .style(`width`, '100%')
                .append('div')
                .attr('class', 'carousel-caption')
                /* How to find  */
                //.style('top', `200px`)
                .html(screen.title)
            /* left and right controls */
            counter += 1;
        });
        return this
    }
    /**
     * @function <a name="cyle">cyle</a>
     * @description Cycles through the carousel items from left to right
     * @param {Object} opt options object:
     * @param {Number} [opt.inteval=5000] The amount of time to delay between automatically cycling an item. If false, carousel will not automatically cycle.</li>
     * @param {Boolean} [opt.keyboard=true] Whether the carousel should react to keyboard events.</li>
     * @param {String} [opt.pause='hover'] If set to "hover", pauses the cycling of the carousel on mouseenter and resumes the cycling of the carousel on mouseleave. If set to false, hovering over the carousel won't pause it. 
     * On touch-enabled devices, when set to "hover", cycling will pause on touchend (once the user finished interacting with the carousel) for two intervals, before automatically resuming. Note that this is in addition to the above mouse behavior.</li>
     * @param {String} [opt.ride=false] Autoplays the carousel after the user manually cycles the first item. If "carousel", autoplays the carousel on load.</li>
     * @param {Boolean} [opt.wrap=true] Whether the carousel should cycle continuously or have hard stops.</li>
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
     * @param {Number} number Goto page number 
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