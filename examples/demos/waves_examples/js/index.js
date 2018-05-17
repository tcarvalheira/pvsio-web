/**
 * Waves widget demo page
 *
 * @author Tiago Carvalheira
 * @date 12/03/2018
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
require.config({
    baseUrl: "../../client/app",
    paths: {
        d3: "../lib/d3",
        "pvsioweb": "plugins/prototypebuilder",
        "imagemapper": "../lib/imagemapper",
        "text": "../lib/text",
        "lib": "../lib",
        "cm": "../lib/cm",
        stateParser: './util/PVSioStateParser'
    }
});

require([
        "widgets/Button",
        "widgets/med/Wave/Wave2",
        "widgets/med/DetailPanel/ArrowDisplay",
        "widgets/core/BasicDisplayEVO",
        "widgets/med/Alarm/Alarm",
        "widgets/med/DetailPanel/MaxMinDisplay",
        "widgets/med/ImageRender/ImageRender",
        "widgets/ButtonActionsQueue",
        "stateParser",
        "PVSioWebClient"
    ], function (
        Button,
        Wave,
        ArrowDisplay,
        BasicDisplayEVO,
        Alarm,
        MaxMinDisplay,
        ImageRender,
        ButtonActionsQueue,
        stateParser,
        PVSioWebClient
    ) {
        "use strict";
        var client = PVSioWebClient.getInstance();
        var tick;
        function start_tick() {
            if (!tick) {
                tick = setInterval(function () {
                    ButtonActionsQueue.getInstance().queueGUIAction("tick", onMessageReceived);
                }, 1000);
            }
        }
        function stop_tick() {
            if (tick) {
                clearInterval(tick);
                tick = null;
            }
        }
        function evaluate(str) {
            var v = +str;
            if (str.indexOf("/") >= 0) {
                var args = str.split("/");
                v = +args[0] / +args[1];
            }
            var ans = (v < 100) ? v.toFixed(1).toString() : v.toFixed(0).toString();
            return parseFloat(ans);
        }

        // Function automatically invoked by PVSio-web when the back-end sends states updates
        function onMessageReceived(err, event) {
            if (!err) {
                // get new state
                client.getWebSocket().lastState(event.data);
                // parse and render new state
                var res = event.data.toString();
                if (res.indexOf("(#") === 0) {
                    render(stateParser.parse(res));
                }
            } else {
                console.log(err);
            }
        }

        var widgets = {

            // wave wdgets
            heartRateWave: new Wave(
                /* ID */
                'hr_wave',
                /* coords  */
                { top: 70, left: 30, width: 900 },
                /* options */
                { 
                    waveType: 'ecg',
                    title: 'IV',
                    parent: 'wave-container', 
                    heartRate: 100,
                    waveColor: "#00FF00",
                    background: "#000000",
                 }
            ),
            co2WaveRed: new Wave(
                'co2_wave_red',
                { top: 200, left: 30, width: 900 },
                { 
                    waveType: 'ecg', 
                    parent: 'wave-container',
                    heartRate: 60 ,
                    waveColor: '#FF0000',
                    background: '#000000'
                }
            ),
            plethWaveLightBlue: new Wave(
                'pleth_wave_light_blue',
                { top: 350, left: 30, width: 900 },
                { 
                    waveType: 'pleth', 
                    parent: 'wave-container',
                    heartRate: 80,
                    waveColor: '#0FF0FF',
                    background: '#000000'
                }
            ),
            alarm: new Alarm(
                'alarm1',
                {top: 0, left: 0, width: 0, height: 0},
                {
                    parent: 'sound-container',
                    volume: '0.2',
                    loop: true,
                    loop_frequency: 1000,
                    muted: true
                    //,audio: 'audio/beep-07.mp3'
                }
            ),
            firstBasicDisplay: new BasicDisplayEVO(
                'bDisplay1',
                {top: 100, left: 0, width: 50, height:50},
                {
                    parent: 'basic-display-container',
                    fontColor: "#FF0000",
                    fontSize: 16,
                    background: 'blue',
                    visibleWhen: "true"
                }
            ),
            arrowUp: new ArrowDisplay(
                'arrowUp',
                {top: 100, left: 50, width: 50, height:50},
                {
                    parent: 'basic-display-container',
                    fontColor: "#00FF00",
                    fontSize: 16,
                    background: 'black',
                    visibleWhen: "true"
                }
            ),
            arrowRightUp: new ArrowDisplay(
                'arrowRightUp',
                {top: 100, left: 100, width: 50, height:50},
                {
                    parent: 'basic-display-container',
                    fontColor: "#00FF00",
                    fontSize: 16,
                    background: 'black',
                    visibleWhen: "true"
                }
            ),
            arrowRight: new ArrowDisplay(
                'arrowRight',
                {top: 100, left: 150, width: 50, height:50},
                {
                    parent: 'basic-display-container',
                    fontColor: "#00FF00",
                    fontSize: 16,
                    background: 'black',
                    visibleWhen: "true"
                }
            ),
            arrowRightDown: new ArrowDisplay(
                'arrowRightDown',
                {top: 100, left: 200, width: 50, height:50},
                {
                    parent: 'basic-display-container',
                    fontColor: "#00FF00",
                    fontSize: 16,
                    background: 'black',
                    visibleWhen: "true"
                }
            ),
            arrowDown: new ArrowDisplay(
                'arrowDown',
                {top: 100, left: 250, width: 50, height:50},
                {
                    parent: 'basic-display-container',
                    fontColor: "#00FF00",
                    fontSize: 16,
                    background: 'black',
                    visibleWhen: "true"
                }
            ),
            bloodPressure: new BasicDisplayEVO(
                'bloodPressureDisplay',
                {top: 100, left: 300, width: 200, height: 50},
                {
                    parent: 'blood-pressure-container',

                    fontColor: '#FF8C94',
                    fontSize: 24,
                    fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                    background: 'black',
                    visibleWhen: 'true'
                }
            ),
            temperatureDetail1: new MaxMinDisplay(
                'temperatureDisplay1',
                {top: 100, left: 0, width: 75, height: 50},
                {
                    parent: 'temperature-detail-container',
                    fontColor: '#00ce08',
                    fontSize: 24,
                    fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                    background: 'black',
                    visibleWhen: 'true',
                    title: 'Tcore',
                    valueMin: '36.1',
                    valueMax: '39.2',
                    value: '37.4',
                    type: 'Float'
                }
            ),
            temperatureDetail2: new MaxMinDisplay(
                'temperatureDisplay2',
                {top: 100, left: 200, width: 75, height: 50},
                {
                    parent: 'temperature-detail-container',
                    fontColor: '#F390F2',
                    fontSize: 24,
                    fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                    background: 'black',
                    visibleWhen: 'true',
                    title: 'Tskin',
                    type: 'Float'
                }
            ),
            HRDetail: new MaxMinDisplay(
                'heartrateDetail',
                {top: 100, left: 0, width: 100, height: 50},
                {
                    parent: 'other-detail-container',
                    fontColor: '#00FF00',
                    fontSize: 24,
                    fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                    background: 'black',
                    visibleWhen: 'true',
                    title: 'HR',
                    type: 'Integer',
                    valueMin: '50',
                    valueMax: '120',
                    value: '60',
                }
            ),
            etCO2: new MaxMinDisplay(
                'etCO2Detail',
                {top: 100, left: 120, width: 100, height: 50},
                {
                    parent: 'other-detail-container',
                    fontColor: '#FFFFFF',
                    fontSize: 24,
                    fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                    background: 'black',
                    visibleWhen: 'true',
                    title: 'etCO2',
                    type: 'Integer',
                    valueMin: '30',
                    valueMax: '50',
                    value: '28',
                    bracket: 'none'
                }
            ),
            imageSVG: new ImageRender(
                'imageSVG1',
                {top: 100, left: 0, width: 100, height: 100},
                {
                    parent: 'images-container',
                    //backColor: '#FF0000',
                    //color: '#0F00F0'
                }
            )
        };

        function muteSound(){
            widgets.alarm.mute()
        }

        // Render widgets
        function render(res) {
            widgets.heartRateWave.render();
            widgets.co2WaveRed.render();
            widgets.plethWaveLightBlue.render();
            widgets.alarm.render()
            widgets.alarm.play()
            // widgets.firstBasicDisplay.render("Hello World!");
            widgets.firstBasicDisplay.renderGlyphicon('glyphicon glyphicon-wrench',{'blinking':false})
            //widgets.arrowRight.renderGlyphicon('glyphicon glyphicon-arrow-right',{'blinking':false})
            widgets.arrowUp.render('0')
            widgets.arrowRightUp.render('45')
            widgets.arrowRight.render('90')
            widgets.arrowRightDown.render('135')
            widgets.arrowDown.render('180')
            widgets.bloodPressure.render('123/79 (89)')
            widgets.temperatureDetail1.render()
            widgets.temperatureDetail2.render()
            widgets.HRDetail.render()
            widgets.etCO2.render()
            widgets.imageSVG.render()
            widgets.imageSVG.setColor('#00FFF0')
            //widgets.imageSVG.setBackgroundColor('#00F')
            /* widgets.imageSVG.setImage(`<svg
            xmlns:svg="http://www.w3.org/2000/svg"
            xmlns="http://www.w3.org/2000/svg"
            width="300"
            height="300"
            viewBox="0 0 79.374998 79.375002"
            version="1.1"
            id="svg8"
            sodipodi:docname="alarmoff.svg">
           <g
              id="layer1"
              transform="translate(0,-217.62498)">
             <path
                style="fill:none;stroke:#0000FF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
                d="m 9.9673446,285.4814 c 60.1255954,0.23942 59.6433044,0.23942 59.6433044,0.23942 l -29.419743,-57.4613 z"
                id="path18"
                />
             <path
                style="fill:none;stroke:#0000FF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
                d="m 14.951017,234.78446 44.209996,57.39261 z"
                id="path22"
                />
             <path
                style="fill:none;stroke:#0000FF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
                d="M 15.111781,292.33783 64.144686,234.30217 Z"
                id="path24"
                />
           </g>
         </svg>`) */
        }

        /* update temperature button */
        let updTemp = document.getElementById('upd_temp_btn')
        updTemp.addEventListener('click', (ev) => {
             widgets.temperatureDetail1.updateValues({
                actualValue: document.getElementById('temp').value,
                minimalValue: document.getElementById('min-temp').value,
                maximalValue: document.getElementById('max-temp').value,
            })

            widgets.temperatureDetail1.setProperties({
                title: 'NewTitle'
            })
        })

        let updTemp1 = document.getElementById('upd_temp_btn_skin')
        updTemp1.addEventListener('click', (ev) => {
             widgets.temperatureDetail2.updateValues({
                actualValue: document.getElementById('temp').value,
                minimalValue: document.getElementById('min-temp').value,
                maximalValue: document.getElementById('max-temp').value,
            })
        })

        /* volume buttons */
        let mutebtn = document.getElementById("muteBtn")
        let volUp = document.getElementById("volUp")
        let volDown = document.getElementById("volDown")

        mutebtn.addEventListener('click', (ev) => {
            if(!widgets.alarm.isMuted()){
                widgets.alarm.mute()
                ev.target.textContent="Unmute"
            }else{
                widgets.alarm.unmute()
                ev.target.textContent="Mute"
            }
        }) 
        volUp.addEventListener('click', (ev) => {
            if(!widgets.alarm.isMuted()){
                widgets.alarm.volumeUp()
            }
        }) 
        volDown.addEventListener('click', (ev) => {
            if(!widgets.alarm.isMuted()){
                widgets.alarm.volumeDown()
            }
        }) 



        var demoFolder = "waves_examples";
        //register event listener for websocket connection from the client
        client.addListener('WebSocketConnectionOpened', function (e) {
            //start pvs process
            client.getWebSocket()
                .startPVSProcess({name: "main.pvs", demoName: demoFolder + "/pvs"}, function (err, event) {
                client.getWebSocket().sendGuiAction("init(0);", onMessageReceived);
                d3.select(".demo-splash").style("display", "none");
                d3.select("#content").style("display", "block");
                // start the simulation
                start_tick();
            });
        }).addListener("WebSocketConnectionClosed", function (e) {

        }).addListener("processExited", function (e) {
            var msg = "Warning!!!\r\nServer process exited. See console for details.";
        });
         client.connectToServer();
         render("1");
    });
