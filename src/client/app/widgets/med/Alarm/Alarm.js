/**
 * @module Alarm
 * @version 1.0.0
 * @author Tiago Carvalheira
 * @desc This module will allow playing alarms, mute, unmute set volume up and down
 * 
 * @date Mar 21, 2018
 * 
 * @example <caption>Usage of Alarm within a PVSio-web demo.</caption>
 * define(function(require, exports, module){
 *      "use strict";
 * 
 *      //Require the Alarm module
 *         require("widgets/med/Alarm")
 * 
 *      function main(){
 *          let Alarm = new Alarm(
 *              'example', // id of element
 *              {top: 100, left: 100, width: 100, height: 100 }, // coordinates
 *              {
 *                  parent: 'xpto',
 *                  muted: true,
 *                  audio: "alarm/alarm1.wav",
 *                  loop: true,
 *                  volume: 50 // percentage og volume
 *              } // options object
 *          )
 *          // render
 *          Alarm.render()
 *      }
 * })
 */
/*jslint lets: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */

require.config({
    baseUrl: '../../client/app',
    path: {
        jquery: '../lib/jquery.js'
    }
})

/* Alarm definition */
define(function(require, exports, module){
    "use strict"
    let d3 = require("d3/d3")
    let Widget = require("widgets/Widget")
    let PVSioStateParser = require("util/PVSioStateParser")
    let StateParser = require("util/PVSioStateParser")
    let property = require("util/property")

    /**
     * @function <a name="Alarm">Alarm</a>
     * @description Constructor for Alarm widget
     * @param id {String} widget instance id
     * @param {Object} coords coordinates of widget: top, left, with, height 
     *                 Default {top: 100, left: 100, width: 100, height: 100}
     * @param {Object} opt options object
     * @param {String} [opt.parent='alarm'] HTML element where widget will be appended
     * @param {Object} [opt.audio='/alarms/alarm.mp3'] is the location of sound. Could be a location inside server or an external url
     * @param {Boolean} [opt.loop=false] set if alarm should play in loop or not
     * @param {Iumber}  [opt.loop_frequency=1000] Loop freency for the alarm. The alarm will sound each loop_frequency ms.
     * @param {Float}   [opt.volume=50] set alarm volume
     * @param {Object} [opt.pvsDefinition] pvsDefinition variables
     * @param {String} [opt.pvsDefinition.isOn='isAlarmOn'] string with the name of pvs state that will carry if alarm is on or off
     * @param {String} [opt.pvsDefinition.heartRate='heartRate'] string with the pvs state name of heartrate
     * @param {String} [opt.pvsDefinition.volume='volume']
     * @memberof module:Alarm
     * @instance
     */
    function Alarm(id, coords, opt) {
        opt = opt || {}
        opt.pvsDefinition = opt.pvsDefinition || {} // make sure pvsDefinition is not null or undefined
        coords = coords || {}
        opt.parent = opt.parent || "alarm"
        opt.audio = opt.audio || `../../client/app/widgets/med/Alarm/alarms/alarm.mp3`
        this.audioSrc = opt.audio
        opt.loop = opt.loop || false
        this.muted = opt.muted || false
        this.loop = opt.loop
        this.loop_frequency = parseInt(opt.loop_frequency) || 1000
        opt.volume = parseFloat(opt.volume) || 0.5

        /* pvs state variables */
        this.isAlarmOn = opt.pvsDefinition.isOn || 'isAlarmOn'
        this.heartRatePvs = opt.pvsDefinition.heartRate || 'heartRate'
        this.volumePvs = opt.pvsDefinition.volume || 'volume'


        this.parent = (opt.parent) ? (`#${opt.parent}`) : 'alarm'

        this.div = d3.select(this.parent)
                        .append('div')
                        .attr("id", `${id}_audio_div` )
                        .style("position", "absolute")
                        .style("top", `${this.top}px`)
                        .style("left", `${this.left}px`)

        this.alarmDiv = this.div
        this.body = d3.select("body")
        this.div.append("audio")
                .attr("id", `${id}_audio`)
                .attr("name", "alarm")
                .attr("src", opt.audio)
        
        /** get element by id so that it can be played and muted */
        this.alarm = document.getElementById(`${id}_audio`)
        this.alarm.volume=opt.volume

        /* check muted attribute and mute alarm if setted to true */
        if(this.muted === true){
            this.mute()
        }

        Widget.call(this, id, coords, opt)
        return this
    }

    Alarm.prototype = Object.create(Widget.prototype);
    Alarm.prototype.constructor = Alarm;
    Alarm.prototype.parentClass = Widget.prototype;

    /**
     * @function hide
     * @description This method will hide the widget.
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.hide = function () {
        this.alarmDiv.style("visibility", "hidden")
        return this
    }

     /**
      * @function reveal
      * @description This methor will show the widget
      * @memberof module:Alarm
      * @instance
      */
     Alarm.prototype.reveal = function () {
        if(this.alarmDiv !== undefined){
            this.alarmDiv.style("visibility", "visible")

        }
        return this
    }

    /**
     * @function play
     * @description this will play alarm when it is called. Plays in loop or only one time based on configuration
     * @param
     * @memberof module:Alarm
     * @instance 
     */
    Alarm.prototype.play = function () {
        this.stop()
        this.alarm.src = this.audioSrc
        if(this.loop){
            // use this.intervalLoop reference to stop loop if needed
            this.intervalLoop = setInterval(() => {
                if(!this.alarm.mute){
                    this.alarm.currentTime = 0; 
                    this.alarm.play()           
                }
            },this.loop_frequency);    
        }else{
            this.alarm.play()
        }
        return this
    }

    /**
     * @function <a name="isPaused">isPaused</a>
     * @description returns if sound is paused or not
     * @return this
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.isPaused = function () {
        return this.alarm.paused
    }

    /**
     * @function <a name="pause">pause</a>
     * @description pause sound
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.pause = function () {
        this.alarm.pause()
        return this
    }

    /**
     * @function <a name="setVolume">setVolume</a>
     * @description set sound volume
     * @param volume (float) value beetween 0 and 1. Default is 0.5
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.setVolume = function (volume) {
        volume = parseFloat(volume) || 0.5
        this.alarm.volume = volume
        return this
    }

    /**
     * @function <a name="volumeUp">volumeUp</a>
     * @description increase volume by <value>
     * @param value (Float) amount to increase. Default is 0.1
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.volumeUp = function (value) {
        value = parseFloat(value) || 0.1
        if(this.alarm.volume + value <= 1){
            this.alarm.volume += value
        }
        return this
    }

    /**
     * @function <a name="volumeDown">volumeDown</a>
     * @description decrease volume by <value>
     * @param value (Float) amount to decrease. Default is 0.1
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.volumeDown = function (value) {
        value = parseFloat(value) || 0.1
        if(this.alarm.volume - value >= 0){
            this.alarm.volume -= value
        }
        return
    }

    /**
     * @function mute
     * @description This method mutes the alarm, making every sound not audible
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.mute = function () {
        this.alarm.mute = true
        return this
    }

    /**
     * @function isMuted
     * @description return true if sound is or isn't muted.
     * @param
     * @memberof module:Alarm
     * @return Boolean
     * @instance
     */
    Alarm.prototype.isMuted = function () {
        return this.alarm.mute || false
    }

    	/**
        * @function <a name="toggle">toggle</a>
        * @description Toggle on or off the alarm
        * @memberof module:Alarm
        * @instance
        */
        Alarm.prototype.toggle = function () {
        if(this.isMuted()){
            this.unmute()
        }else{
            this.mute()
        }
    } 

    /**
     * @function unmute
     * @description This method unmutes the alarm making the sound audible again.
     * @memberof module:Alarm
     * @instance
     */
    Alarm.prototype.unmute = function () {
        this.alarm.mute = false
        return this
    }
    
    	/**
        * @function <a name="stop">stop</a>
        * @description This method will stop alarm loop.
        * @returns self to chained calls
        * @memberof module:Alarm
        * @instance
        */
        Alarm.prototype.stop = function () {
            clearInterval(this.intervalLoop)
            return this
    }

    /**
     * @function render
     * @description Render method for the Alarm widget
     * @param {Object} state PVS state
     * @param {Object} opt Options paramters
     * @param {Object} [opt.pvsDefinition] Optional object with definition of pvs variables
     * @param {String} [opt.pvsDefinition.isOn='isAlarmOn'] String with the name of pvs state
     * @param {String} [opt.pvsDefinition.heartRate='heartRate'] String with the name of pvs state that sets the heart rate
     * @param {String} [opt.pvsDefinition.volume='volume']
     */
    Alarm.prototype.render = function (state, opt) {
        opt = opt || {}
        opt.pvsDefinition = opt.pvsDefinition ||{}
        this.isAlarmOn = opt.pvsDefinition.isOn || this.isAlarmOn
        this.heartRatePvs = opt.pvsDefinition.heartRate || this.heartRatePvs
        this.volumePvs = opt.pvsDefinition.volume || this.volumePvs

        if(state[this.volumePvs] !== undefined && state[this.volumePvs] !== null){
            let vol = state[this.volumePvs] || ''
            // vol = vol.toString().replace(/"/g, "")
            vol = PVSioStateParser.evaluate(vol)
            if(vol!==''){
                this.setVolume(vol)
            }
        }

        let heartrate = 0
        // if it is a number assume that is the heart rate. calculate the loop frequency
        if(typeof state === 'number'){
            heartrate = state
        }else{ // is an object, check for heartrate variable
            heartrate = state[this.heartRatePvs]
        }

        if(parseInt(heartrate) !== NaN && heartrate !== 0){
            this.loop_frequency = Math.floor(60 / heartrate * 1000)
        }

        this.stop()
        if(state[this.isAlarmOn] === 'TRUE'){
            if(this.isMuted()){
                this.unmute()
                this.play()
            }else{
                this.play()
            }
        }else{
            this.mute()
        }
        
        return Alarm.prototype.reveal()
    }

    module.exports = Alarm;
})