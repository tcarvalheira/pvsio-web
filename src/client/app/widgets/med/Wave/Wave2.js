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
     * @param {String} [opt.parent='body'] (String): the HTML element where the display will be appended (default is "body")
     * @param {String} [opt.title] presented on top left corner with wave's color
     * @param {Integer} [opt.heartRate=60] Heart rate in BPM. This will affect the speed of wave. Default is 60
     * @param {uInt} [opt.waveColor='#00FF00'] (uInt). Default is #00FF00 
     * @param {uInt} [opt.backgroundColor='#000000'] widget background color. Default is #000
     * @param {('ecg'| 'co2' | 'pleth' | 'userDefined')} [opt.waveType='ecg'] Define the wave type that will be rendered. options are: ecg, co2, pleth, userDefined. Default is ecg
     * @param {Integer[]} opt.userDefinedWave (Array[Integer]) [optional] when waveType is userDefined the wave rendered will be the points in this array
     * @param {('none' | 'up' | 'down')} [opt.filled='none'] (string): Default is none
     * @param {uInt} [opt.fillColor=waveColor] (uInt). Default is wavecolor
     * @param {Integer} [opt.wavesPerScreen] set the number of waves that should be rendered in each line of the screen at 60bps
     * @param {Integer} [opt.scanBarWidth=50]  set scanBarWidth, Default is 50
     
     * @param {Object} [opt.pvsDefinition] - defines the pvs state variables that holds waves definition
     * @param {uInt} [opt.pvsDefinition.waveColor] ex. waveColor: 'red'
     * @param {Integer} [opt.pvsDefinition.heartRate]
     * @param {uInt} [opt.pvsDefinition.backgroundColor]
     * @param {uInt} [opt.pvsDefinition.fillColor]
     * @param {String} [opt.visibleWhen] - set visibility condition for wave, based on PVS state
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
        this.visibleWhen = this.visibleWhen || opt.visibleWhen || true
    


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
        this.canvas = document.createElement('canvas');
        this.canvas.id     = `${id}_canvas`;
        this.canvas.width  = this.width;
        this.canvas.height = this.height;
        this.canvas.style.position = opt.position
        this.canvas.style.top = `${this.top}px`
        this.canvas.style.left = `${this.left}px`
        this.canvas.style.zIndex   = 8;
        this.ctx = this.canvas.getContext('2d')
        this.canvas.style.backgroundColor = this.backgroundColor

        var elemClass = id + " waveWidget" + " noselect ";
        /* set wave points based on wavetype */
        this.setUpWave()
        this.setParameters(null, opt)

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

        this.parentElem.appendChild(this.canvas)
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
    * @param {Object} state 
    * @param {Object} opt Optional parameter passed to the render function. These can be either style, funcional parameter or pvs definition parameters
    * @param {Object} [opt.pvsDefinition] - defines the pvs state variables that holds waves definition
    * @param {uInt} [opt.pvsDefinition.waveColor] ex. waveColor: 'red'
    * @param {Integer} [opt.pvsDefinition.heartRate]
    * @param {uInt} [opt.pvsDefinition.backgroundColor]
    * @param {uInt} [opt.pvsDefinition.fillColor]
    */
    Wave.prototype.render = function (state, opt) {

        this.setParameters(state, opt)
            
        this.canvas.style.display = 'block'
        this.titleDiv.style.display = 'block'

        
        /* TODO: define the others variables from the state and define a state. */

        this.frame = requestAnimationFrame(this.animationLoop.bind(this))

        if(this.evalViz(state)){
            this.reveal()
        }else{
            this.hide()
        }
        return this
    };

    	/**
        * @function <a name="hide">hide</a>
        * @description This method hides the wave. The wave will not be reset and when it will be shown it will render from where it stops.
        * @param {Object} opt Options:
        * @param {Boolean} [opt.resetWave=false]
        * @return returns this so that it could be chained
        * @memberof module:Wave
        * @instance
        */
        Wave.prototype.hide = function (opt) {
            opt = opt || {}
            let reset = opt.resetWave || false
            this.canvas.style.display = 'none'
            this.titleDiv.style.display = 'none'
            if(reset === true){
                this.resetWave()
            }
            return this
    }

    	/**
        * @function <a name="resetWave">resetWave</a>
        * @description resetWaveMethod will reset waves to initial position. An example of use is when prototype is shutted down
        * @return method return it self so that it can be called in a chain
        * @memberof module:Wave
        * @instance
        */
        Wave.prototype.resetWave = function () {
            cancelAnimationFrame(this.frame)
            this.px = 0
            this.opx = 0
            this.py = this.h/2
            this.opy = this.py
            this.ctx.clearRect(0, 0, this.w, this.h)
            return this
    }

    	/**
        * @protected
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
                if(this.waveIndex >= this.modifiedWave.length - 2){
                    this.waveIndex = 0
                }else{
                    this.waveIndex++;
                    this.waveIndex++;
                }
            }
            this.reRender()
    }

    /**
    * @function <a name="setColor">setColor</a>
    * @description Rendering function for button widgets.
    * @param {(uInt | string)} color ex. #f0a204 or blue
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
        * @protected
        * @function <a name="addArrayElems">addArrayElems</a>
        * @description This function defines the points of wave in order to get the suitable size
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
            const abp = [95,95,95,95,90,85,80,75,65,64,63,62,61,60,59,59,58,58,57,57,57,58,58,58,59,59,60,61,62,63,64,65,67,70,72,75,77,77,77,77,76,75,75,77,80,82,85,85,86,86,87,87,88,88,89,89,90,90,91,91,92,92,93,93,94,94,95]
            const pap = [133,133,133,133,126,119,112,105,91,89,88,86,85,84,83,82,81,81,80,80,80,81,81,81,82,83,84,85,86,88,89,91,94,98,101,105,108,108,108,108,106,105,105,108,112,115,119,119,120,121,121,122,123,123,124,125,126,126,127,128,128,129,130,130,131,132,133]
            const cvp = [150,148, 148,146, 146,144, 144,142, 142,140,140, 140, 140,140,139,139,138,138,130, 129, 128, 127, 126, 125,125,125,125,124,123,122,119,118,117,116,115,114,113,112,111,110, 110, 110, 110, 110, 112, 115, 117,120, 122,125, 127,130, 132,135, 137, 140, 143, 145, 148, 150]
            const icp = [150,148, 148,146, 146,144, 144,142, 142,140,140, 140, 140,140,139,139,138,138,130, 129, 128, 127, 126, 125,125,125,125,124,123,122,119,118,117,116,115,114,113,112,111,110, 110, 110, 110, 110, 112, 115, 117,120, 122,125, 127,130, 132,135, 137, 140, 143, 145, 148, 150]
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
            // this way the modifiedWave is a copy of wave, i can change it while keep wave untouched
            this.modifiedWave = this.wave.slice()
            // add necessary values to make wave shorter or longer
            this.addArrayElems()
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
        * @param {Object} newOpt Options
        * @param {String} newOpt.title
        * @param {Number} newOpt.heartRate
        * @param {uInt} newOpt.waveColor
        * @param {uInt} newOpt.backgroundColor
        * @param {String} newOpt.waveType
        * @param {Number} newOpt.scanBarWidth
        * @param {Integer[]} newOpt.userDefinedWave
        * @param {Number}newOpt.wavesPerScreen
        * @memberof module:Wave
        * @instance
        * @returns {Wave} this wave instance to be used in a chain
        */
        Wave.prototype.setParameters = function (state, newOpt) {
            newOpt = newOpt || {}
            this.title = newOpt.title || this.title
            this.heartRate = newOpt.heartRate || this.heartRate
            this.waveColor = newOpt.waveColor || this.waveColor
            this.backgroundColor = newOpt.backgroundColor || this.backgroundColor
            /*** TODO: wave type is enumerable. Check if it is one of the options before set waveType */
            this.waveType = newOpt.waveType || this.waveType
            this.scanBarWidth = newOpt.scanBarWidth || this.scanBarWidth
            this.userDefinedWave = newOpt.userDefinedWave || this.userDefinedWave
            this.wavesPerScreen = newOpt.wavesPerScreen || this.wavesPerScreen
            this.filled = newOpt.filled || this.filled
            this.fillColor = newOpt.fillColor || this.fillColor

            if(newOpt!== undefined && newOpt !== null && newOpt.pvsDefinition !== undefined && newOpt.pvsDefinition !== null){
                this.pvsWaveColor = newOpt.pvsDefinition.waveColor || this.pvsWaveColor
                this.pvsHeartRate = newOpt.pvsDefinition.heartRate || this.pvsHeartRate
                this.pvsBackgroundColor = newOpt.pvsDefinition.backgroundColor || this.pvsBackgroundColor
                this.pvsFillColor = newOpt.pvsDefinition.fillColor || this.pvsFillColor
            }
            if(state !== null && state !== undefined){

                if(this.pvsWaveColor !== undefined && this.pvsWaveColor !== null){
                    let wavecolortmp = state[this.pvsWaveColor] || ''
                    this.waveColor = `#${wavecolortmp.replace(/"/g, "")}` || this.waveColor
                }
                if(this.pvsHeartRate !== undefined && this.pvsHeartRate !== null){
                    this.heartRate = state[this.pvsHeartRate] || this.heartRate
                }
                if(this.pvsBackgroundColor !== undefined && this.pvsBackgroundColor !== null){
                    let backcolortmp = state[this.pvsBackgroundColor] || ''
                    this.backgroundColor = `#${backcolortmp.replace(/"/g,"")}` || this.backgroundColor
                }
                if(this.pvsFillColor !== undefined && this.pvsFillColor !== null){
                    let fillcolortmp = state[this.pvsFillColor]
                    this.fillColor = `#${fillcolortmp.replace(/"/g, "")}` || this.fillColor
                }
            }

            // these variables must re reset to new colors
            if(this.canvas !== undefined && this.canvas !== null){
                this.canvas.style.backgroundColor = this.backgroundColor
            }
            if(this.titleDiv !== undefined && this.titleDiv !== null){
                this.titleDiv.style.color = this.waveColor 
            }
            this.addArrayElems();
            this.setUpWave()
                .reRender()
            return this
    }

    module.exports = Wave;

});
