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
        "widgets/core/ButtonEVO",
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
              ButtonEVO,
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
        var mx550 = {};
        /* mx550.spo2_display = new PatientMonitorDisplay("spo2_display",
            {top: 56, left: 150, height: 34, width: 160},
            {parent: "prototype", label: "%SpO2"});
        mx550.rra_display = new PatientMonitorDisplay("rra_display",
            {top: 102, left: 150, height: 34, width: 160},
            {parent: "prototype", label: "RRa", fontColor: "aqua"});
        mx550.btn_on = new Button("btn_on", {
            top: 112, left: 364
        }, { callback: onMessageReceived }); */


        // ALARMS

        mx550.pulseAlarm = new Alarm(
            'pulse-alarm',
            {top: 0, left: 0, width: 0, height: 0},
            {
                parent: 'prototype',
                volume: '0.2',
                loop: true,
                loop_frequency: 1000,
                muted: false
            }
        ),

        mx550.btnAlarmOff = new ButtonEVO("btn-alarm-off", {
            top: 140, left: 885, height: 24, width: 24
          }, {
            // softLabel: "Ok",
            // fontColor: "black",
            // backgroundColor: "blue",
            // fontsize: 16,
            callback: function (err, data) {
                mx550.pulseAlarm.toggle()
            }
          });

        // WAVES
        mx550.ecgII_wave = new Wave('ecgii-wave',
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
        mx550.ecgV_wave = new Wave('ecgv-wave',
             {top: 180, left: 5, height: 70, width: 730},
             { 
                 waveType: 'ecg',
                 title: 'V',
                 parent: 'prototype', 
                 heartRate: 75,
                 waveColor: "#00FF00",
                 background: "#000000",
                 scanBarWidth:20
              })
        mx550.spo2_wave = new Wave('spo2-wave',
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
        
        mx550.abp_wave = new Wave('ecgv-wave',
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
        
        mx550.pap_wave = new Wave('ecgv-wave',
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

        mx550.cvp_wave = new Wave('ecgv-wave',
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

        mx550.icp_wave = new Wave('ecgv-wave',
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


               
        mx550.co2_wave = new Wave(
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
        mx550.hr_display = new MaxMinDisplay(
            'heartrate-display',
            {top: 135, left: 750, width: 100, height: 50},
            {
                parent: 'prototype',
                fontColor: '#00FF00',
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: 'true',
                title: 'HR',
                type: 'Integer',
                valueMin: '50',
                valueMax: '120',
                value: '75',
            }
        )
        mx550.pulse_display = new BasicDisplayEVO('pulse-display', 
            {top: 135, left: 920, width: 50, height: 50},
            {
                fontColor: "#0FF0FF",
                backgroundColor: 'none',
                visibleWhen: "true",
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            }
        )

        mx550.spo2_display = new MaxMinDisplay(
            'sop2-display',
            {top: 246, left: 750, width: 100, height: 50},
            {
                parent: 'prototype',
                fontColor: '#0FF0FF',
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: 'true',
                title: 'SpO2',
                type: 'Integer',
                valueMin: '96',
                valueMax: '100',
                value: '95',
            }
        )
        
        mx550.perf_display = new BasicDisplayEVO('perf-display', 
            {top: 250, left: 920, width: 70, height: 50},
            {
                fontColor: "#0FF0FF",
                backgroundColor: 'none',
                visibleWhen: "true",
                fontSize: 26,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            }
        )
        
        mx550.tCore_display = new MaxMinDisplay(
            'tcore-display',
            {top: 570, left: 750, width: 100, height: 60},
            {
                parent: 'prototype',
                fontColor: '#00FF00',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: 'true',
                title: 'Tcore',
                type: 'Float',
                valueMin: '36.0',
                valueMax: '39.0',
                value: '37.0',
            }
        )

        mx550.tSkin_display = new MaxMinDisplay(
            'tskin-display',
            {top: 570, left: 900, width: 100, height: 60},
            {
                parent: 'prototype',
                fontColor: '#F98BFB',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: 'true',
                title: 'Tskin',
                type: 'Float',
                valueMin: '36.0',
                valueMax: '39.0',
                value: '37.0',
            }
        )

        mx550.nbp_display = new MaxMinDisplay(
            'nbp-display',
            {top: 570, left: 5, width: 100, height: 60},
            {
                parent: 'prototype',
                fontColor: '#F47F7E',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: 'true',
                title: 'NBP',
                type: 'String',
                valueMin: '90',
                valueMax: '160',
                value: '123/79 (89)',
            }
        )

        mx550.abp_display = new MaxMinDisplay(
            'abp-display',
            {top: 300, left: 750, width: 200, height: 60},
            {
                parent: 'prototype',
                fontColor: '#E33632',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: 'true',
                title: 'ABP',
                subtitle: 'Sys.',
                type: 'String',
                valueMin: '90',
                valueMax: '160',
                value: '120/70 (91)',
            }
        )

        mx550.pap_display = new MaxMinDisplay(
            'pap-display',
            {top: 350, left: 750, width: 200, height: 60},
            {
                parent: 'prototype',
                fontColor: '#FAE15C',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: 'true',
                title: 'PAP',
                subtitle: 'Dia.',
                type: 'String',
                valueMin: '0',
                valueMax: '16',
                value: '28/15 (21)',
            }
        )

        mx550.cvp_display = new MaxMinDisplay(
            'cvp-display',
            {top: 400, left: 750, width: 200, height: 60},
            {
                parent: 'prototype',
                fontColor: '#41DAF9',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
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

        mx550.icp_display = new MaxMinDisplay(
            'icp-display',
            {top: 450, left: 750, width: 200, height: 60},
            {
                parent: 'prototype',
                fontColor: '#E827F4',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
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
        mx550.cpp_display = new MaxMinDisplay(
            'cpp-display',
            {top: 450, left: 900, width: 100, height: 60},
            {
                parent: 'prototype',
                fontColor: '#E827F4',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: 'true',
                title: 'ICP',
                type: 'Integer',
                valueMin: '50',
                valueMax: '130',
                value: '82',
            }
        )

        mx550.etco2_display = new MaxMinDisplay(
            'etco2-display',
            {top: 520, left: 750, width: 100, height: 50},
            {
                parent: 'prototype',
                fontColor: '#999a9b',
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: 'true',
                title: 'etCO2',
                type: 'Integer',
                valueMin: '30',
                valueMax: '50',
                value: '28',
            }
        )

        mx550.awRR_display = new MaxMinDisplay(
            'awrr-display',
            {top: 520, left: 900, width: 100, height: 50},
            {
                parent: 'prototype',
                fontColor: '#999a9b',
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
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
            mx550.pulseAlarm.render()
            mx550.pulseAlarm.play()
            mx550.btnAlarmOff.render();
        }

        // waves
        function render_waves(res){
            mx550.ecgII_wave.render()
            mx550.ecgV_wave.render()
            mx550.spo2_wave.render()
            mx550.co2_wave.render()
            mx550.abp_wave.render()
            mx550.pap_wave.render()
            mx550.cvp_wave.render()
            mx550.icp_wave.render()
        }

        function render_displays(res){
            mx550.hr_display.render()
            mx550.pulse_display.render('75')
            mx550.spo2_display.render()
            mx550.perf_display.render('2.1')
            mx550.etco2_display.render()
            mx550.awRR_display.render()
            mx550.tCore_display.render()
            mx550.tSkin_display.render()
            mx550.nbp_display.render()
            mx550.abp_display.render()
            mx550.pap_display.render()
            mx550.cvp_display.render()
            mx550.icp_display.render()
            mx550.cpp_display.render()
        }

        /**
         function to handle when an output has been received from the server after sending a guiAction
         if the first parameter is truthy, then an error occured in the process of evaluating the gui action sent
         */
        function onMessageReceived(err, event) {
            console.log(event)
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
                        //mx550.btn_on.render(res);
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
