/**
 *
 * @author Paolo Masci, Patrick Oladimeji
 * @date 27/03/15 20:30:33 PM
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
        stateParser: './util/PVSioStateParser',
        NCDevice: 'plugins/networkController/NCDevice'
    }
});

require([
        "widgets/core/ButtonEVO",
        "widgets/LED",
        "widgets/TracingsDisplay",
        "widgets/med/Wave/Wave2",
        "widgets/med/DetailPanel/MaxMinDisplay",
        "widgets/core/BasicDisplayEVO",
        "widgets/med/Alarm/Alarm",
        "stateParser",
        "PVSioWebClient",
        "NCDevice"],
    function (Button,
              LED,
              TracingsDisplay,
              Wave,
              MaxMinDisplay,
              BasicDisplayEVO,
              Alarm,
              stateParser,
              PVSioWebClient,
              NCDevice) {
        "use strict";


        var deviceID = "Mx550";
        var deviceType = "SpO2 Monitor";


        function parseNCUpdate(event) {

            var from = event.from;

            if (from === "Mx550") {

                var res = stateParser.parse(event.message);
                client.getWebSocket()
                    .sendGuiAction("update_spo2(" + res.spo2 + ")" +
                    "(" + client.getWebSocket().lastState() + ");",
                    onMessageReceived);
            }
        }

        function parseNCControl(event) {
//            var from = event.from;
        }

        function errorMessage(event) {
            console.log("!!! " + event.message);
        }

        function notifyMessage(event) {
            console.log(">>> " + event.message);
        }

        function onConnect(event) {
            console.log(">>> CONNECTED");
        }

        function onDisconnect(event) {
            console.log(">>> DISCONNECTED");
        }


        var url = window.location.href.split(":").slice(0,2).join(":") + ":8080/NetworkController/devices";
        url = url.replace("http://", "ws://");
        var ncDevice = new NCDevice({id: deviceID, type: deviceType}, { url: url });

        ncDevice.addListener("update", parseNCUpdate);
        ncDevice.addListener("control", parseNCControl);
        ncDevice.addListener("error", errorMessage);
        ncDevice.addListener("notify", notifyMessage);
        ncDevice.addListener("connected", onConnect);
        ncDevice.addListener("disconnected", onDisconnect);


        var d3 = require("d3/d3");
        var serverLogs = [], maxLogSize = 40;

        var client = PVSioWebClient.getInstance();

        // FIXME: create a library with APIs to create SAPERE control panels
        var content = d3.select("#content").append("div").style("width", "600px").style("padding", "20px").style("display", "none");
        content.append("div").attr("style", "margin-bottom: 10px;").append("input").attr("type", "button")
            .attr("id", "btnShowPanel").attr("value", "Show Advanced Controls");
        var controlPanel = content.append("div").attr("id", "controlPanel").style("display", "none");
        // sapere
        var sapereControl = controlPanel.append("div").attr("class", "sapere");
        sapereControl.append("div").attr("class", "sapere_control_panel")
            .append("input").attr("type", "button").attr("class", "btnAddDevice")
            .attr("value", "Add New Radical7");
        sapereControl.append("div").attr("id", "sapere_response_log").attr("class", "console_log");
        sapereControl.append("input").attr("type", "text").attr("name", "address")
            .attr("placeholder", "Please type a message")
            .attr("id", "updateMessage");
        sapereControl.append("input").attr("type", "button").attr("class", "btnUpdateDevice")
            .attr("value", "Send");
        // pvsio
        controlPanel.append("div").attr("class", "pvsio")
            .text("Device State").append("div").attr("class", "dbg").attr("id", "dbg")
            .style("position", "absolute").style("top", "20px")
            .attr("style", "height: 100%; width: 100%; height: 600px;");

        d3.select("#btnShowPanel").on("click", function toggleDebug() {
            if (document.getElementById("controlPanel").style.display === "none") {
                document.getElementById("controlPanel").style.display = "block";
                document.getElementById("btnShowPanel").value = "Hide Advanced Controls";
            } else {
                document.getElementById("controlPanel").style.display = "none";
                document.getElementById("btnShowPanel").value = "Show Advanced Controls";
            }
        });


        // append a div that will contain the canvas elements
        var tick = null;
        var start_tick = null, stop_tick = null;


        // append displays
        var radical = {};
        /* radical.spo2_display = new PatientMonitorDisplay("spo2_display",
            {top: 56, left: 150, height: 34, width: 160},
            {parent: "prototype", label: "%SpO2"});
        radical.rra_display = new PatientMonitorDisplay("rra_display",
            {top: 102, left: 150, height: 34, width: 160},
            {parent: "prototype", label: "RRa", fontColor: "aqua"});
        radical.btn_on = new Button("btn_on", {
            top: 112, left: 364
        }, { callback: onMessageReceived }); */


        // ALARMS

        radical.pulseAlarm = new Alarm(
            'pulse-alarm',
            {top: 0, left: 0, width: 0, height: 0},
            {
                parent: 'prototype',
                volume: '0.2',
                loop: true,
                loop_frequency: 1000,
                muted: true
            }
        ),

        // WAVES
        radical.ecgII_wave = new Wave('ecgii-wave',
            {top: 120, left: 5, height: 70, width: 730},
            { 
                waveType: 'ecg',
                title: 'II',
                parent: 'prototype', 
                heartRate: 75,
                waveColor: "#00FF00",
                background: "#000000",
                scanBarWidth:20
             })
        radical.ecgV_wave = new Wave('ecgv-wave',
             {top: 170, left: 5, height: 70, width: 730},
             { 
                 waveType: 'ecg',
                 title: 'V',
                 parent: 'prototype', 
                 heartRate: 75,
                 waveColor: "#00FF00",
                 background: "#000000",
                 scanBarWidth:20
              })
        radical.spo2_wave = new Wave('spo2-wave',
              {top: 220, left: 5, height: 70, width: 730},
              { 
                  waveType: 'pleth',
                  title: 'Pleth',
                  parent: 'prototype', 
                  heartRate: 75,
                  waveColor: "#0FF0FF",
                  background: "#000000",
                  scanBarWidth:20
               })
        
        radical.abp_wave = new Wave('ecgv-wave',
             {top: 280, left: 5, height: 70, width: 730},
             { 
                 waveType: 'abp',
                 title: 'ABP',
                 parent: 'prototype', 
                 heartRate: 75,
                 waveColor: "#E33632",
                 background: "#000000",
                 scanBarWidth:20
              })
        
        radical.pap_wave = new Wave('ecgv-wave',
              {top: 340, left: 5, height: 70, width: 730},
              { 
                  waveType: 'pap',
                  title: 'PAP',
                  parent: 'prototype', 
                  heartRate: 75,
                  waveColor: "#FAE15C",
                  background: "#000000",
                  scanBarWidth:20
               })

        radical.cvp_wave = new Wave('ecgv-wave',
               {top: 400, left: 5, height: 70, width: 730},
               { 
                   waveType: 'cvp',
                   title: 'CVP',
                   parent: 'prototype', 
                   heartRate: 75,
                   waveColor: "#41DAF9",
                   background: "#000000",
                   scanBarWidth:20
                })

        radical.icp_wave = new Wave('ecgv-wave',
                {top: 460, left: 5, height: 70, width: 730},
                { 
                    waveType: 'icp',
                    title: 'ICP',
                    parent: 'prototype', 
                    heartRate: 75,
                    waveColor: "#E827F4",
                    background: "#000000",
                    scanBarWidth:20
                 })


               
        radical.co2_wave = new Wave(
            'co2-wave',
            { top: 500, left: 5, height:70, width: 730 },
            { 
                waveType: 'co2', 
                parent: 'prototype',
                heartRate: 75 ,
                waveColor: '#FFFFFF',
                background: '#000000',
                filled: 'down',
                fillColor: '#999a9b',
                scanBarWidth:20
            }
        )


        // DISPLAYs
        radical.hr_display = new MaxMinDisplay(
            'heartrate-display',
            {top: 115, left: 750, width: 100, height: 50},
            {
                parent: 'prototype',
                fontColor: '#00FF00',
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                background: 'black',
                visibleWhen: 'true',
                title: 'HR',
                type: 'Integer',
                valueMin: '50',
                valueMax: '120',
                value: '75',
            }
        )
        radical.pulse_display = new BasicDisplayEVO('pulse-display', 
            {top: 135, left: 920, width: 50, height: 50},
            {
                fontColor: "#0FF0FF",
                background: 'blue',
                visibleWhen: "true",
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            }
        )

        radical.spo2_display = new MaxMinDisplay(
            'sop2-display',
            {top: 230, left: 750, width: 100, height: 50},
            {
                parent: 'prototype',
                fontColor: '#0FF0FF',
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                background: 'black',
                visibleWhen: 'true',
                title: 'SpO2',
                type: 'Integer',
                valueMin: '96',
                valueMax: '100',
                value: '95',
            }
        )
        
        radical.perf_display = new BasicDisplayEVO('perf-display', 
            {top: 250, left: 920, width: 70, height: 50},
            {
                fontColor: "#0FF0FF",
                background: 'blue',
                visibleWhen: "true",
                fontSize: 26,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            }
        )
        
        radical.tCore_display = new MaxMinDisplay(
            'tcore-display',
            {top: 570, left: 750, width: 100, height: 60},
            {
                parent: 'prototype',
                fontColor: '#00FF00',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                background: 'black',
                visibleWhen: 'true',
                title: 'Tcore',
                type: 'Float',
                valueMin: '36.0',
                valueMax: '39.0',
                value: '37.0',
            }
        )

        radical.tSkin_display = new MaxMinDisplay(
            'tskin-display',
            {top: 570, left: 900, width: 100, height: 60},
            {
                parent: 'prototype',
                fontColor: '#F98BFB',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                background: 'black',
                visibleWhen: 'true',
                title: 'Tskin',
                type: 'Float',
                valueMin: '36.0',
                valueMax: '39.0',
                value: '37.0',
            }
        )

        radical.nbp_display = new MaxMinDisplay(
            'nbp-display',
            {top: 570, left: 5, width: 100, height: 60},
            {
                parent: 'prototype',
                fontColor: '#F47F7E',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                background: 'black',
                visibleWhen: 'true',
                title: 'NBP',
                type: 'String',
                valueMin: '90',
                valueMax: '160',
                value: '123/79 (89)',
            }
        )

        radical.abp_display = new MaxMinDisplay(
            'abp-display',
            {top: 270, left: 750, width: 200, height: 60},
            {
                parent: 'prototype',
                fontColor: '#E33632',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                background: 'black',
                visibleWhen: 'true',
                title: 'ABP',
                subtitle: 'Sys.',
                type: 'String',
                valueMin: '90',
                valueMax: '160',
                value: '120/70 (91)',
            }
        )

        radical.pap_display = new MaxMinDisplay(
            'pap-display',
            {top: 330, left: 750, width: 200, height: 60},
            {
                parent: 'prototype',
                fontColor: '#FAE15C',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                background: 'black',
                visibleWhen: 'true',
                title: 'PAP',
                subtitle: 'Dia.',
                type: 'String',
                valueMin: '0',
                valueMax: '16',
                value: '28/15 (21)',
            }
        )

        radical.cvp_display = new MaxMinDisplay(
            'cvp-display',
            {top: 380, left: 750, width: 200, height: 60},
            {
                parent: 'prototype',
                fontColor: '#41DAF9',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                background: 'black',
                visibleWhen: 'true',
                title: 'CVP',
                subtitle: 'Mean',
                type: 'Integer',
                bracket: 'parenthesis',
                valueMin: '0',
                valueMax: '10',
                value: '9',
            }
        )

        radical.icp_display = new MaxMinDisplay(
            'icp-display',
            {top: 450, left: 750, width: 200, height: 60},
            {
                parent: 'prototype',
                fontColor: '#E827F4',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                background: 'black',
                visibleWhen: 'true',
                title: 'ICP',
                subtitle: 'Mean',
                type: 'Integer',
                bracket: 'parenthesis',
                valueMin: '0',
                valueMax: '10',
                value: '9',
            }
        )
        radical.cpp_display = new MaxMinDisplay(
            'cpp-display',
            {top: 450, left: 900, width: 100, height: 60},
            {
                parent: 'prototype',
                fontColor: '#E827F4',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                background: 'black',
                visibleWhen: 'true',
                title: 'ICP',
                type: 'Integer',
                valueMin: '50',
                valueMax: '130',
                value: '82',
            }
        )

        radical.etco2_display = new MaxMinDisplay(
            'etco2-display',
            {top: 520, left: 750, width: 100, height: 50},
            {
                parent: 'prototype',
                fontColor: '#999a9b',
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                background: 'black',
                visibleWhen: 'true',
                title: 'etCO2',
                type: 'Integer',
                valueMin: '30',
                valueMax: '50',
                value: '28',
            }
        )

        radical.awRR_display = new MaxMinDisplay(
            'awrr-display',
            {top: 520, left: 900, width: 100, height: 50},
            {
                parent: 'prototype',
                fontColor: '#999a9b',
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                background: 'black',
                visibleWhen: 'true',
                title: 'awRR',
                type: 'Integer',
                valueMin: '8',
                valueMax: '30',
                value: '17',
            }
        )

        // utility function
        function evaluate(str) {
            var v = +str;
            if (str.indexOf("/") >= 0) {
                var args = str.split("/");
                v = +args[0] / +args[1];
            }
            return (v <= 0) ? "--" : ((v < 10) ? v.toFixed(1).toString() : v.toFixed(0).toString());
        }

        // alarm
        function render_alarms(res){
            radical.pulseAlarm.render()
            radical.pulseAlarm.play()
        }

        // waves
        function render_waves(res){
            radical.ecgII_wave.render()
            radical.ecgV_wave.render()
            radical.spo2_wave.render()
            radical.co2_wave.render()
            radical.abp_wave.render()
            radical.pap_wave.render()
            radical.cvp_wave.render()
            radical.icp_wave.render()
        }

        function render_displays(res){
            radical.hr_display.render()
            radical.pulse_display.render('75')
            radical.spo2_display.render()
            radical.perf_display.render('2.1')
            radical.etco2_display.render()
            radical.awRR_display.render()
            radical.tCore_display.render()
            radical.tSkin_display.render()
            radical.nbp_display.render()
            radical.abp_display.render()
            radical.pap_display.render()
            radical.cvp_display.render()
            radical.icp_display.render()
            radical.cpp_display.render()
        }

        // spo2
        /* function render_spo2(res) {
            if (res.isOn === "TRUE") {
                radical.spo2_display.set_alarm({min: parseFloat(res.spo2_min), max: parseFloat(res.spo2_max)});
                radical.spo2_display.set_range({min: 0, max: 100});
                if (res.spo2_fail === "FALSE") {
                    if (res.spo2_alarm === "off") {
                        radical.spo2_display.render(evaluate(res.spo2));
                    } else {
                        radical.spo2_display.render(evaluate(res.spo2), {fontColor: "red"});
                    }
                } else {
                    radical.spo2_display.fail("FAIL");
                }
                start_tick();
            } else {
                radical.spo2_display.hide();
                stop_tick();
            }
        } */

        // RRa
        /* function render_rra(res) {
            if (res.isOn === "TRUE") {
                radical.rra_display.set_alarm({min: parseFloat(res.rra_min), max: parseFloat(res.rra_max)});
                radical.rra_display.set_range({min: 0, max: 70});
                if (res.rra_fail === "FALSE") {
                    if (res.rra_alarm === "off") {
                        radical.rra_display.render(evaluate(res.rra));
                    } else {
                        radical.rra_display.render(evaluate(res.rra), {fontColor: "red"});
                    }
                } else {
                    radical.rra_display.fail("FAIL");
                }
                start_tick();
            } else {
                radical.rra_display.hide();
                stop_tick();
            }
        } */

        // alarms
        /* function render_alarms(res) {
            if (res.isOn === "TRUE") {
                if (res.spo2_alarm === "off") {
                    radical.spo2_display.alarm("off");
                } else if (res.spo2_alarm === "alarm") {
                    radical.spo2_display.alarm("glyphicon-bell");
                } else if (res.spo2_alarm === "mute") {
                    radical.spo2_display.alarm("glyphicon-mute");
                }
                if (res.rra_alarm === "off") {
                    radical.rra_display.alarm("off");
                } else if (res.rra_alarm === "alarm") {
                    radical.rra_display.alarm("glyphicon-bell");
                } else if (res.rra_alarm === "mute") {
                    radical.rra_display.alarm("glyphicon-mute");
                }
            } else {
                radical.spo2_display.hide();
                radical.rra_display.hide();
            }
        } */

        /**
         function to handle when an output has been received from the server after sending a guiAction
         if the first parameter is truthy, then an error occured in the process of evaluating the gui action sent
         */
        function onMessageReceived(err, event) {
            function prettyprintState(str) {
                var state = stateParser.parse(str);
                state.spo2_label = state.spo2_label.replace(/"/g, "");
                return JSON.stringify(state, null, " ");
            }

            if (!err) {
                client.getWebSocket().lastState(event.data);
                var dbg = prettyprintState(event.data.toString());

                // logging
                var date = new Date();
                serverLogs.push({data: dbg, date: date, id: event.id, type: "dbg"});
                if (serverLogs.length > maxLogSize) {
                    serverLogs = serverLogs.slice(-maxLogSize);
                }
                var logLines = d3.select(".dbg").selectAll("textarea").data(serverLogs, function (d, i) {
                    return d.id;
                });
                logLines.enter()
                    .insert("textarea", "textarea").html(function (d) {
                        return d.date.toString() + "\n" + d.data;
                    }).style("width", "100%")
                    .attr("readonly", true)
                    .attr("rows", function (d) {
                        return d.data.split("\n").length + 1;
                    }).attr("class", function (d) {
                        return d.type;
                    });
                logLines.exit().remove();

                ncDevice.sendDataUpdate(event.data.toString());

                // rendering
                var res = event.data.toString();
                if (res.indexOf("(#") === 0) {
                    res = stateParser.parse(event.data.toString());
                    if (res) {
                        render_waves(res)
                        render_displays(res)
                        render_alarms(res)
                        //radical.btn_on.render(res);
                    }
                }
            } else {
                console.log(err);
            }
        }


        //--- tick function -------------------
        start_tick = function () {
            if (!tick) {
                tick = setInterval(function () {
                    client.getWebSocket()
                        .sendGuiAction("tick(" + client.getWebSocket().lastState() + ");", onMessageReceived);
                }, 2000);
            }
        };

        stop_tick = function () {
            if (tick) {
                clearInterval(tick);
                tick = null;
            }
        };


        d3.select(".btn_on").on("click", function () {
            stop_tick();
            client.getWebSocket()
                .sendGuiAction("click_btn_on(" + client.getWebSocket().lastState() + ");", onMessageReceived);
            start_tick();
        });

        d3.select("#submit_spo2_sensor_data").on("click", function () {
            var data = d3.select("#spo2_sensor_data").node().value;
            if (data) {
                data = (isNaN(parseFloat(data))) ? -1 : parseFloat(data);
                stop_tick();
                client.getWebSocket()
                    .sendGuiAction("spo2_sensor_data(" + data + ")(" + client.getWebSocket().lastState() + ");", onMessageReceived);
                start_tick();
            }
        });

        d3.select("#submit_rra_sensor_data").on("click", function () {
            var data = d3.select("#rra_sensor_data").node().value;
            if (data) {
                data = (isNaN(parseFloat(data))) ? -1 : parseFloat(data);
                stop_tick();
                client.getWebSocket()
                    .sendGuiAction("rra_sensor_data(" + data + ")(" + client.getWebSocket().lastState() + ");", onMessageReceived);
                start_tick();
            }
        });


        //register event listener for websocket connection from the client
        client.addListener('WebSocketConnectionOpened', function (e) {
            console.log("web socket connected");
            //start pvs process
            client.getWebSocket().startPVSProcess({name: "main.pvs", demoName: "Radical7/pvs"}, function (err, event) {
                client.getWebSocket().sendGuiAction("init(0);", onMessageReceived);
                d3.select(".demo-splash").style("display", "none");
                d3.select(".content").style("display", "block");
                ncDevice.start().then(
                    function (res) {
                        ncDevice.connect();
                    }).catch(function(err){
                        console.log(err);
                    });
            });
        }).addListener("WebSocketConnectionClosed", function (e) {
            console.log("web socket closed");
        }).addListener("processExited", function (e) {
            var msg = "Warning!!!\r\nServer process exited. See console for details.";
            console.log(msg);
        });

        client.connectToServer();

    });
