/**
 * @module Carousel
 * @version 1.0
 * @description Given pages, renders a carousel container with buttons to navigate through pages.
 * This widget works in two different ways. On the onde hand it's responsible to create all HTML for the widget, 
 * on the other hand it gives flexibility to load pre-done HTML and use it, as long as it meets some name conventions defined by widget.
 * The content of each page is setted by defining page <widget_id>-<page_name> as parent on other widgets. This is another name convention
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
            {width: 472,height: 260,top: 114,left: 76},
            {screens: [{"id" : "home", "title": "Home", state: "NORMAL_OPERATION", idx:0}, 
                            {"id": "basal_mgm", "title": "Basal Management", state: "BASAL_MANAGEMENT", idx:1}, 
                            {"id": "bolus_mgm", "title": "Bolus Management", state: "BOLUS_MANAGEMENT", idx:2}, 
                            {"id": "config", "title": "Pump Configuration", state: "PUMP_CONFIGURATION", idx:3}, 
                            {"id": "data_mgm", "title": "Event Data Management", state: "EVENT_DATA_MANAGEMENT", idx:4} ],
                parent: "device",
                screensKey: 'pages',
                callback: onMessageReceived,
                interval: false,
                backgroundColor: 'transparent',
                visibleWhen: 'isReady=TRUE'})
        disp.render()
 });
 */
/*global define */
define(function (require, exports, module) {
    "use strict";
    var WidgetEVO = require("widgets/core/WidgetEVO");
    var ButtonEVO = require("widgets/core/ButtonEVO")
    /**
     * @function <a name="Carousel">Carousel</a>
     * @description Constructor.
     * @param id {String} The ID of the carousel
     * @param {Object} coords The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     * @param {Object} opt Optional values for the widget:
     * @param {Number} [opt.interval=false] The amount of time to delay between automatically cycle an item. If false, carousel will not automatically cycle
     * @param {Boolean} [opt.keyboard=true] Whether the carousel should react to keyboard events
     * @param {String | boolean} [opt.pause='hover'] If set to "hover", pauses the cycling of the carousel on mouseenter and resumes the cycling of the carousel on mouseleave. If set to false, hovering over the carousel won't pause it. 
     * On touch-enabled devices, when set to "hover", cycling will pause on touchend (once the user finished interacting with the carousel) for two intervals, before automatically resuming. Note that this is in addition to the above mouse behavior.
     * @param {String} [opt.ride='false'] Autoplays the carousel after the user manually cycles the first item. If "carousel", autoplays the carousel on load.
     * @param {Boolean} [opt.wrap='true'] Whether the carousel should cycle continuously or have hard stops.
     * @param {Object} [opt.buttonPrevious]
     * @param {Object} [opt.buttonPrevious.coords] The four coordinates (top, left, width, height) of the previous button, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area. Default is {width: 70, hight: 50, top: <widget_height>-50, left: 0}
     * @param {Object} [opt.buttonPrevious.opt]
     * @param {Object} [opt.buttonNext]
     * @param {Object} [opt.buttonNext.coords] The four coordinates (top, left, width, height) of the next button, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area. {width: 70, hight: 50, top: <widget_height>-50, left: <widget_width>-70}
     * @param {Object} [opt.buttonNext.opt]
     * @param {Boolean} [opt.usePreDoneHTML=false] Set if the widget should create the HTML code or reuse user HTML. This HTML should follow some naming conventions:
     * div Element of the id equals to <widget_id> - defining carouser wrapper
     * ol Element with id <widget_id>_indicators - defining carousel bottom indicators
     * a Element with id <widget_id>_left_controller - defining previous button
     * a Element with id <widget_id>_rigth_controller - defining next button
     * @param {Object} [opt.screens=[]] Array of objects {id: 'a', title: 'b', state: 'c'}. This will be carousel pages. Each page state must match with PVS state.
     * @param {String} [opt.displayKey='mode'] Key that holds active carousel page. PVS state must have this name.
     * @param {String} [opt.visibleWhen] Set when widget should or should not be displayed. This can be an expression to match with PVS state.
     * @memberof module:Carousel
     * @instance
     */
    function Carousel(id, coords, opt) {
        coords = coords || {};
        this.coords = coords
        opt = this.normaliseOptions(opt);
        this.type = this.type || "Carousel";
        /* PVS keys definition. this will be where active page is placed */
        this.displayKey = (typeof opt.displayKey === "string") ? opt.displayKey : 'mode';
        this.visibleWhen = this.visibleWhen || opt.visibleWhen || true

        opt.backgroundColor = opt.backgroundColor || "black";
        opt.cursor = opt.cursor || "default";
        opt.overflow = "hidden";
        this.interval = opt.interval !== undefined ? opt.interval : false
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

        /* Screens state must match with PVS states */
        this.screens = opt.screens || [] 

        this.usePreDoneHTML = opt.usePreDoneHTML === undefined ? false : opt.usePreDoneHTML

        this.parent = (opt.parent) ? (`#${opt.parent}`) : 'body'
        this.callback = opt.callback || ((a) => (a))
        this.id = id

        if(!this.usePreDoneHTML){
            WidgetEVO.apply(this, [`${id}`, coords, opt]);        
            this.base.style('z-index','-100')
            this.createMasterDiv()
                .createHTML()
                .createHTMLButtons()
        }else{
            /* need to load master div first in order to change its id. Its original id will be widget id */
            this.loadMasterDivPreDoneHTML()
            WidgetEVO.apply(this, [`${id}`, coords, opt]);
            this.loadPreDoneHTML()
        }

        this.createButtons()
            .render()
        return this;
    }
    Carousel.prototype = Object.create(WidgetEVO.prototype);
    Carousel.prototype.parentClass = WidgetEVO.prototype;
    Carousel.prototype.constructor = Carousel;

    /** 
     * @protected
     * @function <a name="createMasterDiv">createMasterDiv</a>
     * @description Create HTML master div to Carousel. All other elements of carousel should be loaded into this div. 
     * The method should only be used when option usePreDoneHTML is set to false.
     * @return {Object} The object itself so that one can chain methods.
     * @memberof module:Carousel
     * @instance
     */
    Carousel.prototype.createMasterDiv = function (){
        this.masterDiv = this.div
            .append('div')
            .attr('id', `${this.id}_carousel`)
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
        return this
    }

    /**
     * @protected
     * @function <a name="createHTMLButtons">createHTMLButtons</a>
     * @description This method appends the necessary HTML to create the HTML buttons. 
     * This method should only be used when option usePreDoneHTML is set to false.
     * @return {Object} The object itself, so that methods can be chained
     * @memberof modulo:Carousel
     * @instance
     */
    Carousel.prototype.createHTMLButtons = function(){
        this.leftControl = this.masterDiv
            .append('a')
            .attr('id',`${this.id}_left_control`)
            .attr('class', 'left carousel-control')
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
            .style('height', `50px`)
            .style('top', `210px`)
            .style('background-color', 'black')
            .style('border-radius', '4px')
            
        this.rightControl
            .append('span')
            .attr('class', 'glyphicon glyphicon-chevron-right')

        return this
    }

    /**
     * @protected
     * @function <a name="createHTML">createHTML</a>
     * @description This method appends the necessary HTML to widget div in order to render the carousel properly. 
     * This method should only be used when option usePreDoneHTML is set to false.
     * @return {Object} The object itself, so that methods can be chained
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

        let counter = 0
        /* foreach screen create an indicator and a wrapper */
        this.screens.forEach(screen => {
            /* Indicators */
            let active = (screen.idx === 0) ? 'active' : ''
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
                .style('height', '100%')
                .style(`width`, '100%')
                .append('div')
                .attr('class', 'carousel-caption')
                .html(screen.title)
            counter += 1;
        });
        return this
    }

    /** 
     * @protected
     * @function <a name="loadMasterDivPreDoneHTML">loadMasterDivPreDoneHTML</a>
     * @description Loads this.masterDiv and change its id. This element will be loaded into widget div.
     * This method shoud called before widget creation.
     * @return {Object} The object itself, so that methods can be chained
     * @memberof module:Carousel
     * @instance
    */
    Carousel.prototype.loadMasterDivPreDoneHTML = function () {
        this.masterDiv = d3.select(`#${this.id}`)
        this.masterDiv.style('position','relative')
                        .style('left', '0px')
                        .style('top', '0px')
        this.masterDiv.node().id = `${this.masterDiv.node().id}_carousel`

        return this
    }

    /** 
     * @protected
     * @function <a name="loadPreDoneHTML">loadPreDoneHTML</a>
     * @description Load the Carousel predone HTML.
     * This method defines the name conventions so that the carousel is properly loaded.
     * This method should be used when option usePreDoneHTML is set to TRUE.
     * div Element of the id equals to <widget_id> - defining carouser wrapper
     * ol Element with id <widget_id>_indicators - defining carousel bottom indicators
     * a Element with id <widget_id>_left_controller - defining previous button
     * a Element with id <widget_id>_rigth_controller - defining next button
     * @return {Object} The object itself so that one can chain methods
     * @memberof module:Carousel
     * @instance
     */
    Carousel.prototype.loadPreDoneHTML = function (){
        /* load pre-existing elements based on its id */
        /* this will define name convention */
        this.indicators = d3.select(`#${this.id}_indicators`)
        /* ATENTION: here is a selector class based */
        this.captions = d3.selectAll(`.${this.id}_carousel_caption`)
        this.wrapper = d3.select(`#${this.id}_wrapper`)
        this.leftControl = d3.select(`#${this.id}_left_control`)
        this.rightControl = d3.select(`#${this.id}_right_control`)

        /* put predone html into widget's div, mantaining existing one*/
        this.div.append(function(){
            return d3.select(`#${this.id}_carousel`).remove().node()
        })

        return this
    }

    /**
     * @function <a name="render">render</a>
     * @description Rendering function for Carousel container based on PVS state
     * @param {Object} state JSON object with the current value of the state attributes of the modelled system
     * @return {Obect} The object itself so that methods can be chained
     * @memberof module:Carousel
     * @instance
     */
    Carousel.prototype.render = function (state, opt) {
        opt = this.normaliseOptions(opt);
        
        /*** goto to carousel state based on PVS state.*/
        if(state !== undefined ){
            let activePageState = this.evaluate(this.displayKey, state)
            this.screens.forEach(s => {
                if(s.state === activePageState){
                    this.activePage = s
                }
            })
        }else{
            this.activePage={state:"", idx:0}
        }
        if(state !== undefined && this.evalViz(state)){
            this.goTo(this.activePage.idx)
            this.reveal()
        }else{
            this.hide()
        }

        this.setStyle(opt);

        this.revealCarouselElements()
        let leftOpts = this.leftControl.node().getBoundingClientRect()
        this.previous_screen.setStyle({
            top:0,
            left:0,
            width: `${leftOpts.width}px`,
            height: `${leftOpts.height}px`
        })
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
        
        return this;
    }

    /**
     * @private
    * @function <a name="createButtons">createButtons</a>
    * @description This method will create the action buttons for the carousel. This Buttons will be ButtonEVO widgets.
    * @return {Object} The object itself, so that methods can be chained
    * @memberof module:Carousel
    * @instance
    */
    Carousel.prototype.createButtons = function () {
        if(this.next_screen === undefined || this.next_screen === null){
            this.next_screen = new ButtonEVO("next_screen", {
                /* with position:relative, this will place widgets over original HTML */ 
                top: 0, left: 0,
                /* the widget will be resized on render time */
                width: 0,height:  0
            }, {
                softLabel: "",
                backgroundColor: "steelblue",
                opacity: "0.2",
                borderRadius: "4px",
                fontsize: 34,
                parent:  this.rightControl.node().id,
                callback: this.callback,
                position:'relative',
                visibleWhen: this.visibleWhen,
                zIndex: 0
            })

            this.next_screen.overlay.style('z-index','100')
        }

        if(this.previous_screen === undefined || this.previous_screen === null){
            this.previous_screen = new ButtonEVO("previous_screen", {
                /* this top and left set to  0 with position:relative will place widget over original HTML */
                top: 0, left: 0,
                /*the widget will be resized on render time */ 
                width: 0, height: 0
            }, {
                    softLabel: "",
                    backgroundColor: "steelblue",
                    opacity: "0.2",
                    borderRadius: "4px",
                    fontsize: 34,
                    parent: this.leftControl.node().id,
                    callback: this.callback,
                    position: 'relative',
                    visibleWhen: this.visibleWhen,
                    zIndex: 0
                });
        }

        return this
    }

    	/**
        * @function <a name="hideCarouselElements">hideCarouselElements</a>
        * @description Hide all elements inside carousel.
        * @return {Object} The object itself, so that methods can be chained
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

            return this
        }   

    	/**
        * @function <a name="reveal">reveal</a>
        * @description Reveal all elements in carousel
        * @return {Object} The object itself, so that methods can be chained
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
            return this
    }
   

    /**
     * @function <a name="cycle">cycle</a>
     * @description Cycles through the carousel items from left to right. This method does take into account the PVS state. It will be useful only when one wants to make carousel play alone, regardless PVS state. 
     * @param {Object} opt options object:
     * @param {Number} [opt.inteval=5000] The amount of time to delay between automatically cycling an item. If false, carousel will not automatically cycle.</li>
     * @param {Boolean} [opt.keyboard=true] Whether the carousel should react to keyboard events.</li>
     * @param {String} [opt.pause='hover'] If set to "hover", pauses the cycling of the carousel on mouseenter and resumes the cycling of the carousel on mouseleave. If set to false, hovering over the carousel won't pause it. 
     * On touch-enabled devices, when set to "hover", cycling will pause on touchend (once the user finished interacting with the carousel) for two intervals, before automatically resuming. Note that this is in addition to the above mouse behavior.</li>
     * @param {String} [opt.ride=false] Autoplays the carousel after the user manually cycles the first item. If "carousel", autoplays the carousel on load.</li>
     * @param {Boolean} [opt.wrap=true] Whether the carousel should cycle continuously or have hard stops.</li>
     * @return {Object} The object itself, so that methods can be chained
     * @memberof module:Carousel
     * @instance
     */
    Carousel.prototype.cycle = function (opt) {
        $('.carousel').carousel(opt)
        $('.carousel').carousel('cycle')
        return this;
    }

    /**
     * @function <a name="pause">pause</a>
     * @description Stops the carousel from cycling through items. This method does not take PVS state into account. Useful only when carousel should play regardless PVS state.
     * @return {Object} The object itself, so that methods can be chained
     * @memberof module:Carousel
     * @instance
     */
    Carousel.prototype.pause = function () {
        $('.carousel').carousel('pause')
        return this
    }

    /**
         * @function <a name="prev">prev</a>
         * @description Cycles carousel to the previous item. This method does not take PVS state into account. Useful only when carousel should play regardless PVS state.
         * @return {Object} The object itself, so that methods can be chained
         * @memberof module:Carousel
         * @instance
         */
    Carousel.prototype.prev = function () {
        $('.carousel').carousel('prev')
        return this
    }

    /**
     * @function <a name="next">Next</a>
     * @description Cycles carousel to the next item.This method does not take PVS state into account. Useful only when carousel should play regardless PVS state.
     * @return {Object} The object itself, so that methods can be chained
     * @memberof module:Carousel
     * @instance
     */
    Carousel.prototype.next = function () {
        $('.carousel').carousel('next')
        return this
    }


    /**
     * @function <a name="goTo">goTo</a>
     * @description Cycles the carousel to a particular frame (0 based).This method does not take PVS state into account. Useful only when carousel should play regardless PVS state.
     * @param {Number} number Goto page number 
     * @return {Object} The object itself, so that methods can be chained
     * @memberof module:Carousel
     * @instance
     */
    Carousel.prototype.goTo = function (number) {
        $('.carousel').carousel(number)
        return this
    }

    /**
     * @function <a name="dispose">dispose</a>
     * @description Destroys the carousel element. This method does not take PVS state into account. Useful only when carousel should play regardless PVS state.
     * @return {Object} The object itself, so that methods can be chained
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