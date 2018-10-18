/**
 * @module MaxMinDisplay
 * @version 1.0
 * @description Renders a digital display for rendering text.
 *              This module provide APIs for setting up the visual appearance of the widget, e.g., font size and color.
 * @author TiagoCarvalheira
 * @date 2018/04/05
 *
 * @example <caption>Example use of the widget.</caption>
 // Example pvsio-web demo that uses MaxMinDisplay
 // The following configuration assumes the pvsio-web demo is stored in a folder within pvsio-web/examples/demo/
 require.config({
     baseUrl: "../../client/app",
     paths: { d3: "../lib/d3", text: "../lib/text" }
 });
 require(["widgets/med/DetailPanel/MaxMinDisplay"], function (MaxMinDisplay) {
      "use strict";
      var disp = new MaxMinDisplay("disp", {
        top: 200, left: 120, height: 24, width: 120
      }, {
          parent: 'container',
          color: '#00ce08',
          backgroundColor: 'black',
          title: 'Tcore',
          value: '37.0', 
          valueMax: '39.0',
          vaueMin: '36.0',
          type: 'float',
          bracket: 'none'
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
    const BasicDisplay = require('widgets/core/BasicDisplayEVO')
    const d3 = require("d3/d3");
    const PVSioStateParser = require("util/PVSioStateParser");
    /**
     * @function <a name="MaxMinDisplay">MaxMinDisplay</a>
     * @description Constructor. Create a MaxMinDisplay, extending WidgetEVO
     * @param id {String} The ID of the touchscreen button.
     * @param coords {Object} The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     *        Default is { top: 0, left: 0, width: 32, height: 20 }.
     * @param {Object} opt JSON object Style options defining the visual appearance of the widget.
     * @param {String} [opt.parent] set widget parent
     * @param {String} [opt.color] set widget color
     * @param {String} [opt.backgroundColor] set widget background
     * @param {String} [opt.title] set title for the widget
     * @param {String} [opt.subtitle] set the subtitle of the widget
     * @param {String} [opt.value] sets the current value
     * @param {String} [opt.valueMax] sets the maximal value
     * @param {String} [opt.valueMin] sets the minimal value 
     * @param {('Integer'|'Float'|'String')} [opt.type='Float'] set widget type. 
     * @param {Integer} [opt.decimalPlaces=1] Set the number of decimal places
     * @param {('none' | 'parenthesis' | 'bracked' | 'curly')} [opt.bracket='none'] options are  default is none
     * @param {String} [opt.pvsMinValue] - name of PVS state variable that holds the widget min value
     * @param {String} [opt.pvsMaxValue] - name of PVS state variable that holds the widget max value
     * @param {String} [opt.pvsValue='value'] - name of PVS state variable that holds the widget value
     * @param {String} [opt.pvsTitle='title] - name of PVS state variable that holds the widget title
     * @param {String} [opt.pvsSubtitle='subtitle'] - name of PVS state variable that holds the widget subtitle
     * @param {String} [opt.visibleWhen] set condition for widget visibility
     * @memberof module:MaxMinDisplay
     * @instance
     */
     function MaxMinDisplay(id, coords, opt) {
         coords = coords || {};
         coords.width < 100 ? coords.width = 100 : coords.width = coords.width
         opt = this.normaliseOptions(opt);
         // set widget type & display key
         this.type = this.type || "MaxMinDisplay";
        this.displayKey = (typeof opt.displayKey === "string") ? opt.displayKey : id;
        this.pvsValue = opt.pvsValue || this.pvsValue || 'value'
        this.pvsMinValue = opt.pvsMinValue || this.pvsMinValue
        this.pvsMaxValue = opt.pvsMaxValue || this.pvsMaxValue
        this.pvsTitle = opt.pvsTitle || this.pvsTitle || 'title'
        this.pvsSubTitle = opt.pvsSubtitle || this.pvsSubTitle || 'subtitle'
        this.parent = (opt.parent) ? (`#${opt.parent}`) : 'body'
        this.valueMax = opt.valueMax
        this.valueMin = opt.valueMin
        
        // invoke WidgetEVO constructor to create the widget
        WidgetEVO.apply(this, [ id, coords, opt ]);
        
        /* this.div = d3.select(this.parent)
            .append('div')
                .attr('id', `${id}_div`)
                .style('display','block') */

        opt.backgroundColor = opt.backgroundColor || "black";
        opt.cursor = opt.cursor || "default";
        opt.overflow = "hidden";
        
        this.setProperties(opt)
        
         
        let top = -15
        // if title is setted or will come from pvs state
        if(this.title !== '' || opt.pvsTitle !== undefined){
            let coordsTitle = Object.assign({},coords)
            coordsTitle.top = top
            coordsTitle.left = 0
            
            let optTitle = Object.assign({},opt)
            optTitle.parent = this.div.node().id
            optTitle.position = 'relative'
            optTitle.fontSize = '8'
            optTitle.opacity = '1'
            optTitle.backgroundColor = 'rgba(0, 0, 0, 0)'
            optTitle.fontWeight = '900'
            this.titleDisplay = new BasicDisplay(`${id}_titledisplay`, coordsTitle, optTitle)
            top = top+10
        }

        if(this.subtitle !== '' || opt.pvsSubtitle !== undefined){
            let coordsSubTitle = Object.assign({},coords)
            coordsSubTitle.top = top
            coordsSubTitle.left = 0
            let optSubTitle = Object.assign({},opt)
            optSubTitle.parent = this.div.node().id
            optSubTitle.position = 'relative'
            optSubTitle.fontSize = '6'
            optSubTitle.opacity = '1'
            optSubTitle.backgroundColor = 'rgba(0, 0, 0, 0)'
            optSubTitle.fontWeight = '900'
            this.subTitleDisplay = new BasicDisplay(`${id}_subtitledisplay`, coordsSubTitle, optSubTitle)
            top = top+10
        }

        if((this.valueMax !== undefined && this.valueMax !== null) || opt.pvsMaxValue !== undefined){
            let coordsMax = Object.assign({},coords)
            //coordsMax.top = top
            coordsMax.top = top
            coordsMax.left = 0
            let optMax = Object.assign({},opt)
            optMax.parent = this.div.node().id
            optMax.position = 'relative'
            optMax.fontSize = '8'
            optMax.opacity = '0.6'
            optMax.backgroundColor = 'rgba(0, 0, 0, 0)'
            this.tMaxDisplay = new BasicDisplay(`${id}_tmaxdisplay`, coordsMax, optMax)
            top = top + 10
        }
        
        if((this.valueMin !== undefined && this.valueMin !== null) || opt.pvsMinValue !== undefined){
            let coordsMin = Object.assign({},coords)
            //coordsMin.top = top
            coordsMin.top = top
            coordsMin.left = 0
            let optMin = Object.assign({},opt)
            optMin.parent = this.div.node().id
            optMin.position = 'relative'
            optMin.fontSize = '8'
            optMin.opacity = '0.6',
            optMin.align = 'right'
            optMin.backgroundColor = 'rgba(0, 0, 0, 0)'
            this.tMinDisplay = new BasicDisplay(`${id}_tmindisplay`, coordsMin, optMin)
        }

        let coordsTemp = coords
        let optTemp = opt
        coordsTemp.top = 0
        coordsTemp.left = 30
        optTemp.parent = this.div.node().id
        optTemp.position = 'relative'
        optTemp.backgroundColor = 'rgba(0,0,0,0)'
        optTemp.fontSize = opt.fontSize
        this.tempDisplay = new BasicDisplay(`${id}_tdisplay`, coordsTemp, optTemp)
        

        return this;
     }
     MaxMinDisplay.prototype = Object.create(WidgetEVO.prototype);
     MaxMinDisplay.prototype.parentClass = WidgetEVO.prototype;
     MaxMinDisplay.prototype.constructor = MaxMinDisplay;

     /**
      * @function <a name="render">render</a>
      * @description Rendering function for button widgets.
      * @param state {Object} JSON object with the current value of the state attributes of the modelled system
      * @param {Object} opt Style options overriding the style attributes used when the widget was created.
      *                     The override style options are temporary, i.e., they are applied only for the present invocation of the render method.
      *                     Available options are either html style attributes or the following widget attributes:
      * @param {String} [opt.pvsMinValue='minValue']
      * @param {String} [opt.pvsMaxValue='maxValue']
      * @param {String} [opt.pvsValue='value']
      * @param {('Integer'|'Float'|'String')} [opt.type='Float'] set widget type. 
      * @param {Integer} [opt.decimalPlaces=1] Set the number of decimal places
      * @param {('none' | 'parenthesis' | 'bracked' | 'curly')} [opt.bracket='none'] options are  default is none
      * * @param {String} [opt.pvsTitle='title]
     * @param {String} [opt.pvsSubtitle='subtitle']
      * @memberof module:MaxMinDisplay
      * @instance
      */
     MaxMinDisplay.prototype.render = function (state, opt) {
         // set style
        opt = this.normaliseOptions(opt);
        this.pvsValue = opt.pvsValue || this.pvsValue || 'value'
        this.pvsMinValue = opt.pvsMinValue || this.pvsMinValue || 'minValue'
        this.pvsMaxValue = opt.pvsMaxValue || this.pvsMaxValue || 'maxValue'
        this.decimalPlaces = opt.decimalPlaces || this.decimalPlaces || 1
        this.bracket = opt.bracket || this.bracket || 'none'
        this.type = opt.type || this.type || 'Float'
        this.pvsTitle = opt.pvsTitle || this.pvsTitle || 'title'
        this.pvsSubTitle = opt.pvsSubtitle || this.pvsSubTitle || 'subtitle'
         // if state is just a number then it will be the   main value. 
        if(typeof state === 'number'){
            this.value = state
        }else{  
            // if it is an object, check for min value, max value, and value with options is possible to define new state names to this variables
            this.value = state[this.pvsValue] || this.value || 0;
            // if state is a real pvs will return a irreducible fraction. To make it decimal use PVSioStateParser
            this.value = PVSioStateParser.evaluate(this.value);
            this.valueMin = state[this.pvsMinValue] || this.valueMin || 0 
            this.valueMin = PVSioStateParser.evaluate(this.valueMin)
            this.valueMax = state[this.pvsMaxValue] || this.valueMax || 0
            this.valueMax = PVSioStateParser.evaluate(this.valueMax)
        }

        this.title = state[this.pvsTitle] || this.title  || ''
        this.subtitle = state[this.pvsSubTitle] || this.subtitle || ''

        this.setStyle(opt);

        // render content
        let min = 0
        let max = 0
        let val = 0
        let openBrackets = ''
        let closeBrackets = ''
        switch(this.type){
            case 'Float':
                min = this.floatFormatDecimalPlaces(this.valueMin)
                max = this.floatFormatDecimalPlaces(this.valueMax)
                val = this.floatFormatDecimalPlaces(this.value)
            break
            default:
                min = this.valueMin.toString().replace(/"/g, "")
                max = this.valueMax.toString().replace(/"/g, "")
                // then it is a string and pvs returns string with double quotes, need to remove them
                val = this.value.toString().replace(/"/g, "")
            break
        }

        switch(this.bracket){
            case 'parenthesis':
                openBrackets = '('
                closeBrackets = ')'
            break
            case 'brackets':
                openBrackets = '['
                closeBrackets = ']'
            break
            case 'curly':
                openBrackets = '{'
                closeBrackets = '}'
            break
            case 'none':
            default:
                openBrackets = ''
                closeBrackets = ''
        }

        // these ifs will remove double quotes "" when pvs state variable is a string.
        if(this.title !== undefined && this.title !== null){
            this.title = this.title.toString().replace(/"/g,"")
        }
        if(this.subtitle !== undefined && this.subtitle !== null){
            this.subtitle = this.subtitle.toString().replace(/"/g, "")
        }

        if(this.tMinDisplay !== undefined){
            this.tMinDisplay.render(`${min}`, {align: 'left'})
        }
        if(this.tMaxDisplay !== undefined){
            this.tMaxDisplay.render(`${max}`, {align: 'left'})
        }
        if(this.titleDisplay !== undefined){
            this.titleDisplay.render(`${this.title}`,{fontWeight: '900', align: 'left'})
        }
        if(this.subTitleDisplay !== undefined){
            this.subTitleDisplay.render(`${this.subtitle}`,{fontWeight: '900', align: 'left'})
        }
        
        this.tempDisplay.render(`${openBrackets}${val}${closeBrackets}`, {align: 'left'})

        
        if(this.evalViz(state)){
            this.reveal()
        }else{
            this.hide()
        }
        return this;
     }

     	/**
          * @protected
         * @function <a name="floatFormatDecimalPlaces">floatFormatDecimalPlaces</a>
         * @description this method will format float with the decimalNumber defined as widget parameter values that can be passed as float or as string 
         * @param {Float | String} value - the value to be formatted
         * @memberof module:MaxMinDisplay
         * @instance
         */
         MaxMinDisplay.prototype.floatFormatDecimalPlaces = function (value) {
            let val = 0
            if(typeof value === 'number'){
                val = value.toFixed(this.decimalPlaces)
            }else if(parseFloat(value) !== NaN){
                val = parseFloat(value).toFixed(this.decimalPlaces)
            }else{
                val = value
            }
            return val
     }

     	/**
         * @function <a name="updateValues">updateValues</a>
         * @description These function will set the values on the widget and re-render the widget
         * @param values {Object} JSON object with a maximum of three values. none of these values is mandatory. If it is not set than the values 
         *          will be the already defined on widget
         * @param {Float} [values.actualValue=] sets current values
         * @param {Float} [values.minimalValue=] sets minimal value
         * @param {Float} [values.maximalValue=] sets maximal value
         * @memberof module:MaxMinDisplay
         * @instance
         */
         MaxMinDisplay.prototype.updateValues = function (values) {
            this.value = parseFloat(values.actualValue) || this.value
            this.valueMin = parseFloat(values.minimalValue) || this.valueMin
            this.valueMax = parseFloat(values.maximalValue) || this.valueMax
        
            return this
     }

     	/**
         * @function <a name="setProperties">setParameters</a>
         * @description This method will set the given properties of the widget. None of them are mandatory as they have default value
         * @param {Object} newOpts object with one or more of the next properties
         * @param {String} [newOpts.title]
         * @param {String} [newOpts.subtitle]
         * @param {String} [newOpts.value]
         * @param {String} [newOpts.valueMax]
         * @param {String} [newOpts.valueMin]
         * @param {String} [newOpts.type]
         * @param {String} [newOpts.decimalPlaces]
         * @param {String} [newOpts.bracket]
         * @param {String} [newOpts.visibleWhen]
         * @memberof module:MaxMinDisplay
         * @instance
         */
         MaxMinDisplay.prototype.setProperties = function (newOpts) {
            this.title = newOpts.title || this.title || ''
            this.subtitle = newOpts.subtitle || this.subtitle || ''
            this.type = newOpts.type || this.type || 'Float'
            this.decimalPlaces = parseInt(newOpts.decimalPlaces) || this.decimalPlaces || 1
            this.bracket = newOpts.bracket || this.bracket || 'none'
            switch(this.type){
                case 'Float':
                   this.value = parseFloat(newOpts.value) || this.value || 0
                   this.valueMin = parseFloat(newOpts.valueMin) || this.valueMin || 0 
                   this.valueMax = parseFloat(newOpts.valueMax) || this.valueMax || 0 
                break
                case 'Integer':
                   this.value = parseInt(newOpts.value) || this.value || 0
                   this.valueMin = parseInt(newOpts.valueMin) || this.valueMin ||0
                   this.valueMax = parseInt(newOpts.valueMax) || this.valueMax || 0
                break
                case 'String':
                   this.value = newOpts.value || this.value || ''
                   this.valueMin = newOpts.valueMin || this.valueMin || '' 
                   this.valueMax = newOpts.valueMax || this.valueMax || ''
                break
            }
            this.visibleWhen = newOpts.visibleWhen || this.visibleWhen || 'true';

            return this
     }

     module.exports = MaxMinDisplay
   }
)