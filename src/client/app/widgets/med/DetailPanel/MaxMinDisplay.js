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
    let BasicDisplay = require('widgets/core/BasicDisplayEVO')
    /**
     * @function <a name="MaxMinDisplay">MaxMinDisplay</a>
     * @description Constructor. Create a MaxMinDisplay, extending WidgetEVO
     * @param id {String} The ID of the touchscreen button.
     * @param coords {Object} The four coordinates (top, left, width, height) of the display, specifying
     *        the left, top corner, and the width and height of the (rectangular) widget area.
     *        Default is { top: 0, left: 0, width: 32, height: 20 }.
     * @param opt {Object} JSON object Style options defining the visual appearance of the widget.
     *                     <li>parent {String} </li>
     *                     <li>color {String} </li>
     *                     <li>backgroundColor {String} </li>
     *                     <li>title {String} </li>
     *                     <li>subtitle {String} </li>
     *                     <li>value {String} </li>
     *                     <li>valueMax {String} </li>
     *                     <li>valueMin {String} </li>
     *                     <li>type {String} Integer, Float, String</li>
     *                     <li>decimalPlaces {Integer} default 1 when Float
     *                     <li>bracket {String} options are none | parenthesis | bracked | curly default is none </li>
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

        opt.backgroundColor = opt.backgroundColor || "black";
        opt.cursor = opt.cursor || "default";
        opt.overflow = "hidden";
        
        this.setProperties(opt)
        
         // invoke WidgetEVO constructor to create the widget
        WidgetEVO.apply(this, [ id, coords, opt ]);
        let top = coords.top - 20
        if(this.title !== ''){
            let coordsTitle = Object.assign({},coords)
            coordsTitle.top = top
            let optTitle = Object.assign({},opt)
            optTitle.fontSize = '8'
            optTitle.opacity = '1'
            optTitle.backgroundColor = 'rgba(0, 0, 0, 0)'
            optTitle.fontWeight = '900'
            this.titleDisplay = new BasicDisplay(id+'_titledisplay', coordsTitle, optTitle)
            top = top+10
        }

        if(this.subtitle !== ''){
            let coordsSubTitle = Object.assign({},coords)
            coordsSubTitle.top = top
            let optSubTitle = Object.assign({},opt)
            optSubTitle.fontSize = '6'
            optSubTitle.opacity = '1'
            optSubTitle.backgroundColor = 'rgba(0, 0, 0, 0)'
            optSubTitle.fontWeight = '900'
            this.subTitleDisplay = new BasicDisplay(id+'_subtitledisplay', coordsSubTitle, optSubTitle)
            top = top+10
        }


        if(this.valueMin != ''){
            let coordsMin = Object.assign({},coords)
            coordsMin.top = top
            let optMin = Object.assign({},opt)
            optMin.fontSize = '8'
            optMin.opacity = '0.6',
            optMin.align = 'right'
            optMin.backgroundColor = 'rgba(0, 0, 0, 0)'
            this.tMinDisplay = new BasicDisplay(id+'_tmindisplay', coordsMin, optMin)
            top = top +10
        }
        
        if(this.valueMax !== ''){
            let coordsMax = Object.assign({},coords)
            coordsMax.top = top
            let optMax = Object.assign({},opt)
            optMax.fontSize = '8'
            optMax.opacity = '0.6'
            optMax.backgroundColor = 'rgba(0, 0, 0, 0)'
            this.tMaxDisplay = new BasicDisplay(id+'_tmaxdisplay', coordsMax, optMax)
        }
        

        let coordsTemp = coords
        let optTemp = opt
        coordsTemp.top = coords.top
        coordsTemp.left = coords.left + 30
        optTemp.backgroundColor = 'rgba(0,0,0,0)'
        optTemp.fontSize = opt.fontSize
        this.tempDisplay = new BasicDisplay(id+'_tdisplay', coordsTemp, optTemp)
        

        return this;
     }
     MaxMinDisplay.prototype = Object.create(WidgetEVO.prototype);
     MaxMinDisplay.prototype.parentClass = WidgetEVO.prototype;
     MaxMinDisplay.prototype.constructor = MaxMinDisplay;

     /**
      * @function <a name="render">render</a>
      * @description Rendering function for button widgets.
      * @param state {Object} JSON object with the current value of the state attributes of the modelled system
      * @param opt {Object} Style options overriding the style attributes used when the widget was created.
      *                     The override style options are temporary, i.e., they are applied only for the present invocation of the render method.
      *                     Available options are either html style attributes or the following widget attributes:
      * @memberof module:MaxMinDisplay
      * @instance
      */
     MaxMinDisplay.prototype.render = function (state, opt) {
         // set style
         opt = this.normaliseOptions(opt);

        this.setStyle(opt);

        /* TODO: check type of display and show it with or without (), with decimal point, etc
             this could be set on opts
        */

        // render content
        let min = 0
        let max = 0
        let val = 0
        let openBrackets = ''
        let closeBrackets = ''
        switch(this.type){
            case 'Float':
                min = this.valueMin.toFixed(this.decimalPlaces)
                max = this.valueMax.toFixed(this.decimalPlaces)
                val = this.value.toFixed(this.decimalPlaces)
            break
            default:
                min = this.valueMin
                max = this.valueMax
                val = this.value
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
        this.reveal();
        return this;
     }

     	/**
         * @function <a name="updateValues">updateValues</a>
         * @description These function will set the values on the widget and re-render the widget
         * @param values {Object} JSON object with a maximum of three values
         *          <li>actualValue {Float}</li>
         *          <li>minimalValue {Float}</li>
         *          <li>maximalValue {Float}</li>
         *          none of these values is mandatory. If it is not set than the values 
         *          will be the already defined on widget
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
         * @param newOpts {Object} object with one or more of the next properties
         *                 <li>title</li>
         *                 <li>subtitle</li>
         *                 <li>value</li>
         *                 <li>valueMax</li>
         *                 <li>valueMin</li>
         *                 <li>type</li>
         *                 <li>decimalPlaces</li>
         *                 <li>bracket</li>
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

            return this
     }

     module.exports = MaxMinDisplay
   }
)