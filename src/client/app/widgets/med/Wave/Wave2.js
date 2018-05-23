/**
 * @module Wave
 * @version 1.0
 * @description Renders a wave shape
 *              This module provides an API for setting up visual appearence, e.g., wave or background color
 *              This wave widget uses the browser requestAnimationFrame functions and creates a loop functions that will render the wave
 *              There area already some wavetypes defined by an array of y but it provide an API to render a wave passed as argument
 * @author Tiago Carvalheira
 * @date 04 may 2018
 *
 * @example <caption>Typical use of Wave APIs within a PVSio-web plugin module.</caption>
 * // Example module that uses Syringe.
 * define(function (require, exports, module) {
 *     "use strict";
 *     var device = {};
 *     device.wave = new Wave("ecg", { top: 222, left: 96, height: 8, width: 38 }, { waveType: 'pleth', 
                                                        parent: 'prototype',
                                                        heartRate: 60,
                                                        waveColor: '#FFFFFF',
                                                        background: '#000000',
                                                        scanBarWidth: 10,
                                                        wavesPerScreen: 4.5
                                                    });
 *     device.wave.render();
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
     *          <li>title (String): presented on top left corner with wave's color
     *          <li>heartRate (Integer) Heart rate in BPM. This will affect the speed of wave. Default is 60</li>
     *          <li>waveColor (uInt). Default is #00FF00 </li>
     *          <li>backgroundColor (uInt). widget background color. Default is #000</li>
     *          <li>waveType (String) Define the wave type that will be rendered. options are: ecg, co2, pleth, userDefined. Default is ecg</li>
     *          <li>userDefinedWave (Array[Integer]) [optional] when waveType is userDefined the wave rendered will be the points in this array</li>
     *          <li>filled (string): Default is none
     *                  <li>none</li>
     *                  <li>up</li>
     *                  <li>down</li>
     *          <li>fillColor (uInt). Default is wavecolor</li>
     *          <li>wavesPerScreen (Integer) [optional] set the number of waves that should be rendered in each line of the screen at 60bps</li>
     *          <li>scanBarWidth (Integer) [optional] set scanBarWidth, Default is 50</li>
     * @memberof module:Wave
     * @instance
     */
    function Wave(id, coords, opt) {
        opt = opt || {};
        this.type = this.type || "Wave";
        this.heartRate = parseInt(opt.heartRate) || 60
        this.waveColor = opt.waveColor || "#00FF00"
        this.backgroundColor = opt.background || "#000000"
        this.waveType = opt.waveType || 'ecg'
        this.id = property.call(this, id);
        this.parent = (opt.parent) ? ("#" + opt.parent) : "body";
        this.parentRaw = opt.parent || 'body'
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
        
        opt.position = opt.position || 'absolute';
        opt.opacity = opt.opacity || 1;

        this.parentElem = document.getElementById(this.parentRaw)
        this.w = this.width
        this.h = this.height
        this.px = 0
        this.opx = 0
        this.py = this.h/2
        this.opy = this.py
        this.speed = 1
        this.scanBarWidth = opt.scanBarWidth || 50
        this.frame = null
        this.userDefinedWave = opt.userDefinedWave || this.ecg
        this.waveIndex = 0
        this.sign = '+'
        this.parentElem.width = this.width
        this.parentElem.height = this.height
        this.title = opt.title || ''
        this.filled = opt.filled || 'none'
        this.fillColor = opt.fillColor || this.waveColor
        
        /* set how many wave it should be on each screen if heartrate is 60bps. */
        this.wavesPerScreen = parseInt(opt.wavesPerScreen) || 0
        /* calculate the speed based on wavesPerScreen. If waves per screen is not defined set speed to 1*/
        if(this.wavesPerScreen !== 0){
            this.speed = this.width / (120*this.wavesPerScreen)
        }

        /* canvas creation to wave render */
        let canvas = document.createElement('canvas');
        canvas.id     = `${id}_canvas`;
        canvas.width  = this.width;
        canvas.height = this.height;
        canvas.style.position = opt.position
        canvas.style.top = `${this.top}px`
        canvas.style.left = `${this.left}px`
        canvas.style.zIndex   = 8;
        this.ctx = canvas.getContext('2d')
        canvas.style.backgroundColor = this.backgroundColor

        var elemClass = id + " waveWidget" + " noselect ";
        /* set wave points based on wavetype */
        this.setUpWave()

        /* add a horizontal line to complete the wave length based on heartrate*/
        this.addArrayElems();

        this.titleDiv = document.createElement('div')
        this.titleDiv. id = `${id}_title`
        this.titleDiv.style.top = `${this.top}px`
        this.titleDiv.style.left = `${this.left}px`
        this.titleDiv.style.position = opt.position
        this.titleDiv.style.zIndex = 20
        this.titleDiv.width = 30
        this.titleDiv.height = 10
        this.titleDiv.style.color = this.waveColor
        this.titleDiv.innerHTML = this.title

        this.parentElem.appendChild(canvas)
        this.parentElem.appendChild(this.titleDiv)
        
        
        WidgetEVO.apply(this, [ id, coords, opt ]);
        return this;
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
            this.frame = requestAnimationFrame(this.animationLoop.bind(this))
            return this
    };

    	/**
        * @private
        * @function <a name="animationLoop">animationLoop</a>
        * @description This function is responsible for render wave. It is recursive so that the function is a render loop. In majoraty of
        *               Browsers the requestAnimationFrame is called at 60Hz so it is assumed that at speed 1, as we set process 2 pixel per 
        *               function call, a wave needs to have 120 points to be rendered at 60bps
        * @param 
        * @memberof module:Wave
        * @instance
        */
        Wave.prototype.animationLoop = function () {
            this.px += this.speed;
            this.ctx.clearRect(this.px, 0, this.scanBarWidth, this.h);

            for(let xx = 0; xx < 1; xx++){
                
                if(this.filled === 'down'){
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.px, this.py);
                    this.ctx.lineTo(this.px, this.height);
                    this.ctx.strokeStyle = this.fillColor
                    this.ctx.stroke();
                }
                if(this.filled === 'up'){
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.px, 0);
                    this.ctx.lineTo(this.px, this.py);
                    this.ctx.strokeStyle = this.fillColor
                    this.ctx.stroke();
                }
                this.ctx.beginPath();
                this.ctx.moveTo(this.opx, this.opy);
                this.ctx.lineTo(this.px, this.py);
                this.ctx.strokeStyle = this.waveColor
                this.ctx.stroke();
                
                this.opx = this.px;
                this.opy = this.py;

                if (this.opx > this.w) {
                    this.px = this.opx = -this.speed;
                }                
                this.py = this.modifiedWave[this.waveIndex]/ (200 / this.h)
                if(this.waveIndex >= this.modifiedWave.length - 1){
                    this.waveIndex = 0
                }else{
                    this.waveIndex++;
                }
            }
            this.reRender()
    }

    /**
    * @function <a name="setColor">setColor</a>
    * @description Rendering function for button widgets.
    * @param color {uInt | string} ex. #f0a204 or blue
    * @memberof module:Wave
    * @instance
    */
    Wave.prototype.setColor = function (color) {
        this.waveColor = color || this.waveColor
        this.setUpWave()
            .reRender()
        return this
    }
   
    	/**
        * @private
        * @function <a name="addArrayElems">addArrayElems</a>
        * @description This function defines the points of wave in order to get the suitable size
        * @param ... {Object} ... 
        * @memberof module:Wave
        * @instance
        */
        Wave.prototype.addArrayElems = function () {
            /* This function should set the remaining points. The quantity of points needed is inversely proportional to 
                to the heartRate. At 60bps the total of points should be 120. */
            let n = Math.floor(120*60/this.heartRate) - this.wave.length;
            for(let x = 0; x < n; x++){
                this.modifiedWave.push(this.modifiedWave[this.wave.length-1])
            }
            return this
    }

    	/**
        * @private
        * @function <a name="setUpWave">setUpWave </a>
        * @description Setup wave with new params
        * @param 
        * @memberof module:Wave
        * @instance
        */
        Wave.prototype.setUpWave = function () {
            const ecg = [100,100,100,100,100,100,100,100,98,96,94,92,90,90,90,90,90,92,94,96,98,100,100,100,100,100,100,100,105,110,115,100,75,55,20,55,75,100,140,115,110,100,100,100,100,100,100,100,100,96,91,87,80,80,80,80,87,91,96,100]
            /*TODO: define this wave better */
            const co2 = [150,150,150,150,150,150,150,150,130,110,90,70,70,68,68,67,67,66,66,65,65,64,64,63,63,62,62,62,62,62,61,61,60,60,59,59,58,58,57,57,56,56,55,55,54,54,53,53,52,52,51,51,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,54,58,65,70,82,130,150]
            /*TODO: Define this wave better */
            const pleth = [150,145,140,135,130,125,120,115,110,105,100,95,90,85,80,75,70,65,60,58,56,55,56,58,60,65,70,75,80,85,90,95,98,100,102,104,105,107,109,110,115,120,125,125,123,123,121,121,120,120,121,123,123,125,130,135,140,145, 147, 149,150, 150, 150]
            /*TODO: Define more wave types */
            const abp = [50]
            const pap = [50]
            const cvp = [50]
            const icp = [50]
            switch(this.waveType){
                case 'ecg':
                    this.wave = ecg
                break;
                case 'co2':
                    this.wave = co2
                break
                case 'pleth':
                    this.wave = pleth
                break
                case 'abp':
                    this.wave = abp
                    break
                case 'pap':
                    this.wave = pap
                    break
                case 'cvp':
                    this.wave = cvp
                break
                case 'icp':
                this.wave = icp
                break
                case 'userdefined':
                    this.wave = this.userDefinedWave
                break
                default:
                    this.wave = this.ecg
                break
            }
            this.modifiedWave = this.wave.slice()
            this.ctx.strokeStyle = this.waveColor
            this.ctx.lineWidth = 2.0
            return this
    }

    	/***
        * @function <a name="setHeartRate">setHeartRate</a>
        * @description Set a new heart Rate to wave form
        * @param newHeartRate {Integer} new heart rate setted to wave. Default value is 60
        * @memberof module:Wave
        * @instance
        */
        /* Wave.prototype.setHeartRate = function (newHeartRate) {
            // set default to 60
            let hr = parseInt(newHeartRate) || 60
            this.heartRate = hr
            this.setUpWave()
                .reRender()
            return this
    } */

    	/***
        * @function <a name="setWaveType">setWaveType</a>
        * @description This method will set the wave type within a predefined range of wave types.
        * @param newWaveType (String) options are:
        *                       <li>ecg</li> 
        *                       <li>co2</li>
        *                       <li>pleth</li>
        *                       <li>userdefined</li> 
        * @param wavePoints (Array[<Integer>]) [Optional] If newWaveType is userdefined then this points shoul be setted
        * @memberof module:Wave
        * @instance
        */
        /* Wave.prototype.setWaveType = function (newWaveType, wavePoints) {
             //defult is ECG 
            this.waveType = newWaveType.toLowerCase() || 'ecg'
            if(newWaveType === 'userdefined'){
                this.userDefinedWave = wavePoints
            }
            this.userDefinedWave = wavePoints
            this.setUpWave().reRender()
            return this
    } */ 

    	/**
        * @private 
        * @function <a name="reRender">rerender</a>
        * @description Call the necessary functions to reRender the wave
        * @param . 
        * @memberof module:Wave
        * @instance
        */
        Wave.prototype.reRender = function () {
            cancelAnimationFrame(this.frame)
            this.frame = requestAnimationFrame(this.animationLoop.bind(this))
            return this
    }

    	/***
        * @function <a name="setScanBarWidth">setScanBarWidth</a>
        * @description Sets the width of scan bar.
        * @param width (Integer) - scan bar width. Default value is 50
        * @memberof module:Wave
        * @instance
        */
        /* Wave.prototype.setScanBarWidth = function (width) {
            this.scanBarWidth = parseInt(width) || 50
            this.reRender()
            return this
    }  */ 

    	/**
        * @function <a name="setParameters">setParameters</a>
        * @description Set new parameters to waves. It can be setted one or more parameters at once.
        * @param newOpt {Object} - object with the parameters to be setted
        *                   <li>title</li>
        *                   <li>heartRate</li> 
        *                   <li>waveColor</li> 
        *                   <li>backgroundColor</li> 
        *                   <li>waveType</li> 
        *                   <li>scanBarWidth</li> 
        *                   <li>userDefinedWave</li> 
        *                   <li>wavesPerScreen</li>
        * @memberof module:Wave
        * @instance
        * @returns {Wave} this wave instance to be used in a chain
        */
        Wave.prototype.setParameters = function (newOpt) {
            this.title = newOpt.title || this.title
            this.heartRate = newOpt.heartRate || this.heartRate
            this.waveColor = newOpt.waveColor || this.waveColor
            this.backgroundColor = newOpt.backgroundColor || this.backgroundColor
            this.waveType = newOpt.waveType || this.waveType
            this.scanBarWidth = newOpt.scanBarWidth || this.scanBarWidth
            this.userDefinedWave = newOpt.userDefinedWave || this.userDefinedWave
            this.wavesPerScreen = newOpt.wavesPerScreen || this.wavesPerScreen
            this.filled = newOpt.filled || this.filled
            this.fillColor = newOpt.fillColor || this.fillColor
            this.setUpWave()
                .reRender()
            return this
    }

    module.exports = Wave;

});
