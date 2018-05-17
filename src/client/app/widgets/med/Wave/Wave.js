/**
 * @module Wave
 * @version 1.0
 * @description Renders a wave shape
 *               This module provides an API for setting up visual appearence, e.g., wave or background color
 * @author Tiago Carvalheira
 * @date 12 march 2018
 *
 * @example <caption>Typical use of Wave APIs within a PVSio-web plugin module.</caption>
 * // Example module that uses Syringe.
 * define(function (require, exports, module) {
 *     "use strict";
 *     var device = {};
 *     device.syringe = new Syringe("salive", { top: 222, left: 96, height: 8, width: 38 });
 *     device.syringe.render();
 * });
 *
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require, exports, module) {
    "use strict";

    var WidgetEVO = require("widgets/core/WidgetEVO");
    let property = require("util/property");
    var wavesvg = require("text!widgets/med/Wave/wave.svg");
    let d3 = require('d3/d3')
    

    /**
     * @function <a name="Wave">Wave</a>
     * @description Constructor.
     * @param id {String} The ID of the display.
     * @param coords {Object} The four coordinates (top, left, width, height) of the syringe, specifying
     *        the left, top corner, and the width and height of the div element containing the syringe.
     *        Default is { top: 0, left: 0, width: 80, height: 200 }.
     * @param opt {Object} Options:
     *          <li>parent (String): the HTML element where the display will be appended (default is "body")</li>
     *          <li>heartRate (Integer) Heart rate in BPM. This will affect the speed of wave. Default is 60</li>
     *          <li>waveColor (uInt). Default is #00FF00 </li>
     *          <li>backgroundColor (uInt). widget background color. Default is #000</li>
     *          <li>waveType (String) Default: wave type. options are: heartrate, co2, pleth. Default is heartrate</li>
     * @memberof module:Wave
     * @instance
     */
    function Wave(id, coords, opt) {
        opt = opt || {};
        this.type = this.type || "Wave";
        this.heartRate = parseInt(opt.heartRate) || 60
        this.waveColor = opt.waveColor || "#00FF00"
        this.backgroundColor = opt.background || "#000000"
        /* set transition duration 8 beats (this wave has 8 beats) * 60 *1000 (transform in ms) over heartrate*/
        this.animation_duration = 8*60*1000 / this.heartRate
        this.waveType = opt.waveType || 'heartrate'
        this.id = property.call(this, id);
        this.parent = (opt.parent) ? ("#" + opt.parent) : "body";
        this.top = coords.top || 0;
        this.left = coords.left || 0;
        this.aspectRatio = 1125/155
        /** check if width is set. If not, calculate based on height and aspect ratio. Set default if cannot calculate it.*/
        if(coords.width === undefined){
            this.width = this.aspectRatio * parseInt(coords.height) || 1125
        }else{
            this.width = parseInt(coords.width) || 1125;
        }
        /** check if height is set. If not, calculate it based on width an aspect ratio. Set default if cannot calculate it*/
        if(coords.height === undefined){
            this.height = this.width / this.aspectRatio
        }else{
            this.height = parseInt(coords.height) || 155;
        }
        
        opt.position = opt.position || "absolute";
        opt.opacity = opt.opacity || 1;
        
        var elemClass = id + " waveWidget" + " noselect ";
        this.div = d3.select(this.parent)
                        .append("div").style("position", opt.position)
                        .style("top", this.top + "px").style("left", this.left + "px")
                        .style("width", this.width + "px").style("height", this.height + "px")
                        .style("margin", 0).style("padding", 0).style("opacity", opt.opacity)
                        .style("display", "block").attr("id", id).attr("class", elemClass);

        this.wave = this.div.append("div").attr("id", id + "_wave").html(wavesvg)

        var background = this.wave.select('#background')
                            .attr('fill', this.backgroundColor)
        
        /* select the waves into variables */
        /* heart rate wave  */
        var hr = this.wave.select("#wavePath")
                    .attr("fill", this.waveColor)
                    .attr('display', 'block')
        /* CO2 wave */
        var co2 = this.wave.select("#co2_wave_normal")
                        .attr("fill", this.waveColor)
                        .attr('display','none')
        /* PLETH wave */
        var pleth = this.wave.select('#pleth_wave')
                        .attr("fill", this.waveColor)
                        .attr('display', 'none')
        
        /* show wave depending on wave type*/        
        switch(this.waveType){
            case 'heartrate':
                hr.attr('display','block')
                co2.attr('display','none')
                pleth.attr('display','none')
            break
            case 'co2':
                hr.attr('display','none')
                co2.attr('display','block')
                pleth.attr('display','none')
            break
            case 'pleth':
                hr.attr('display','none')
                co2.attr('display','none')
                pleth.attr('display','block')
            break
            default: 
                hr.attr('display','block')
                co2.attr('display','none')
                pleth.attr('display','none')
        }

        /** create the rectangle that will create the ilusion of real time wave */
        createRectangle(this.wave.select('svg'), 100, 200, this.backgroundColor, this.animation_duration)

        WidgetEVO.apply(this, [ id, coords, opt ]);
        return this;
    }

    /**
     * @function <a name="createRectangle">createRectangle</a>
     * @description This function will append a rectangle to wave svg and define a transition that make the rectangle go through
     *              the svg creating the ilusion of real time wave
     * @param svg d3 svg in which rectangle will be appended
     * @param rectWidth (Integer) rectangle width. Default is 100
     * @param rectHeight (Integer) rectangle height. Default is 200
     * @param color (uInt) rectagle color. Default is #000
     * @param duration (Integer) time in ms that rectangle will take to go through all svg width. Usually this duration is 
     *                  a function of heart rate and number of beats that exists on svg. Default is 1000
     * @return void             
     */
    function createRectangle(svg, rectWidth, rectHeight, color, duration){
        /** return if there are no svg */
        if(svg === undefined) return
        /** set defaults */
        rectWidth = parseInt(rectWidth) || 100;
        rectHeight = parseInt(rectHeight) || 200;
        color = color || '#000'
        duration = parseInt(duration) || 1000

        var rect = svg.append('rect')
                    .attr('x',-50)
                    .attr('y',0)
                    .attr('width', rectWidth)
                    .attr('height', rectHeight)
                    .attr('fill', color)
                    .transition()
                        .duration(duration)
                        .ease("linear")
                        .attr('transform', `translate(1125)`)
                        /** calling each with the self function will create a infite loop with the transition*/
                        .each("end",function(){
                            createRectangle(svg, rectWidth, rectHeight, color, duration)
                        })
                        .remove()
        return this
    }

    Wave.prototype = Object.create(WidgetEVO.prototype);
    Wave.prototype.constructor = Wave;
    Wave.prototype.parentClass = WidgetEVO.prototype;
   
   /**
    * @function render
    * @description this method will render the widget
    * @param {*} level 
    * @param {*} opt 
    */
    Wave.prototype.render = function (level, opt) {
        opt = opt || {};
        var isEnabled = false;
        this.div.select("svg g").style("display", "block"); 
        if (isEnabled) {
            return this.reveal();
        }else{
            return this.reveal();
        }
    };

    /**
    * @function <a name="setColor">setColor</a>
    * @description Rendering function for button widgets.
    * @param color {uInt | string} ex. #f0a204 or blue
    * @memberof module:Wave
    * @instance
    */
    Wave.prototype.setColor = function (color) {
        this.waveColor = color || this.waveColor
    }
   
    module.exports = Wave;

});
