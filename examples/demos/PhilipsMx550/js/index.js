/**
 *
 * @author Tiago Carvalheira
 * @date 23/05/18 20:30:33 PM
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
        "widgets/LED",
        "widgets/TracingsDisplay",
        "widgets/med/Wave/Wave2",
        "widgets/med/DetailPanel/MaxMinDisplay",
        "widgets/core/BasicDisplayEVO",
        "widgets/med/Alarm/Alarm",
        "widgets/core/ButtonEVO",
        "widgets/med/ImageRender/ImageRender",
        "widgets/med/Plug/Plug",
        "widgets/core/DateTime",
        "widgets/core/ButtonImage",
        "stateParser",
        "PVSioWebClient",
        "NCDevice"],
    function (LED,
              TracingsDisplay,
              Wave,
              MaxMinDisplay,
              BasicDisplayEVO,
              Alarm,
              ButtonEVO,
              ImageRender,
              Plug,
              DateTime,
              ButtonImage,
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

        var d3 = require("d3/d3");
        var serverLogs = [], maxLogSize = 40;

        var client = PVSioWebClient.getInstance();

        // append a div that will contain the canvas elements
        var tick = null;
        var start_tick = null, stop_tick = null;


        // append displays
        var mx550 = {};

        // ALARMS
        mx550.pulseAlarm = new Alarm(
            'pulse-alarm',
            {top: 0, left: 0, width: 0, height: 0},
            {
                parent: 'prototype',
                volume: '0.2',
                loop: true,
                loop_frequency: 500,
                muted: false,
                pvsDefinition:{
                    isOn: 'isAlarmOn',
                    heartRate: 'pulse',
                    volume: 'alarm_vol'
                } 
            }
        ),

        /* mx550.btnAlarmOff = new ButtonEVO("btn_alarm_off", {
            top: 230, left: 990, height: 20, width: 20
          }, {
            //visibleWhen: "isOn = TRUE", //TODO: i can use this attribute insted of checking if it is on or off on javascript
            visibleWhen: 'isOn = TRUE',
            parent: 'prototype',
            callback: onMessageReceived,
            softLabel: 'Pulse',
            fontColor: '#00FFFF',
            fontSize: 6,
            align: 'left'
          }); */

          mx550.pulseAlarmOff = new ImageRender('pulse_alarm',
            {top: 222, left: 988, height: 30, width: 20},
            {
                parent: 'prototype',
                displayKey: 'pulseAlarmOffImage',
                visibleWhen: 'isAlarmOn = FALSE'
            })

          mx550.btnOnOff = new ButtonEVO("btn_on_off", {
            top: 915, left: 316, height: 46, width: 46
          }, {
              parent: 'prototype',
              //backgroundColor: 'red',
            callback: onMessageReceived
          });




        /* TOP information */

        /* TODO: define this as an imagerender as there isn't any glyphicon with network to render */
        mx550.network = new BasicDisplayEVO('network',
        {top: 179, left: 106, width: 78, height: 17},
        {
            parent: 'prototype',
            fontColor: "#FFFFFF",
            backgroundColor: "#211E1C",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            align: 'left'
        }
        )

        mx550.bed = new BasicDisplayEVO('bed',
            {top: 180, left: 184, width: 186, height: 17},
            {
                parent: 'prototype',
                fontColor: '#FFFFFF',
                backgroundColor: '#211E1C',
                visibleWhen: 'isOn = TRUE',
                fontWeight: 'bolder',
                fontSize: 8,
                align: 'left',
                displayKey: 'bed'
            }
        )


        mx550.patientName = new BasicDisplayEVO('patient-name',
            {top: 179, left: 370, width: 300, height: 17},
            {
                parent: 'prototype',
                fontColor: "#FFFFFF",
                backgroundColor: "#211E1C",
                visibleWhen: "isOn = TRUE",
                fontWeight: 'bolder',
                fontSize: 8,
                align: 'left',
                displayKey: 'patientName',            
            }
        )

        mx550.date_display = new DateTime('datetime',
            {left: 670, top: 180, width: 142, height: 17},
            {
                    parent: "prototype",
                    fontColor: 'white',
                    backgroundColor: "#211E1C",
                    useCurrentDateTime: true,
                    fontFamilly: 'sans-serif',
                    dateFontSize: '8',
                    timeFontSize: '8',
                    relativePosition: 'horizontal',
                    visibleWhen: 'isOn = TRUE',
                    locale: 'en-US',
                    dateFormat: { year: 'numeric', month: 'short', day: 'numeric'},
                    timeFormat: { hour12: false, hour:'numeric', minute: 'numeric'},
            })

        mx550.profile = new BasicDisplayEVO('profile-display',
            {top: 179, left: 812, width: 165, height: 17},
            {
                parent: 'prototype',
                fontColor: "#FFFFFF",
                backgroundColor: "#211E1C",
                visibleWhen: "isOn = TRUE",
                fontWeight: 'bolder',
                fontSize: 8,
                align: 'left',
                displayKey: 'profile',            
            }
        )
        mx550.view = new BasicDisplayEVO('view-display',
            {top: 179, left: 977, width: 114, height: 17},
            {
                parent: 'prototype',
                fontColor: '#FFFFFF',
                backgroundColor: '#211E1C',
                visibleWhen: 'isOn = TRUE',
                fontWeight: 'bolder',
                fontSize: 8, 
                align: 'left',
                displayKey: 'view'
            })


            mx550.alarmVol = new ImageRender(
                'alarm-volume-graphics',
                {top: 179, left: 1092, width: 30, height:20},
                {
                    parent: 'prototype',
                    displayKey: 'alarmVolGraphics',
                    visibleWhen: 'isOn = TRUE',
                    backgroundColor: '#211E1C'
                }
            )


        /* TOP Buttons */
        mx550.topButton1 = new ButtonEVO('top_button_1',
            {
                top: 162, left: 108, height: 18, width: 55
            }, 
            {
                visibleWhen: 'isOn = TRUE',
                parent: 'prototype',
                callback: onMessageReceived,
                softLabel: 'Guest2',
                fontColor: '#FFFFFF',
                backgroundColor: '#211E1C',
                fontSize: 7,
                align: 'center'
              }
        )

        mx550.topButton2 = new ButtonEVO('top_button_2',
        {
            top: 162, left: 165, height: 18, width: 55
        }, 
        {
            visibleWhen: 'isOn = TRUE',
            parent: 'prototype',
            callback: onMessageReceived,
            softLabel: 'Ovw6',
            fontColor: '#FFFFFF',
            backgroundColor: '#403D3B',
            fontSize: 7,
            align: 'center'
          }
    )        
    mx550.topButton3 = new ButtonEVO('top_button_3',
        {
            top: 162, left: 222, height: 18, width: 55
        }, 
        {
            visibleWhen: 'isOn = TRUE',
            parent: 'prototype',
            callback: onMessageReceived,
            softLabel: 'Wmon1',
            fontColor: '#000000',
            backgroundColor: '#00E7E8',
            fontSize: 7,
            align: 'center'
          }
    ) 
    mx550.topButton4 = new ButtonEVO('top_button_4',
        {
            top: 162, left: 281, height: 18, width: 55
        }, 
        {
            visibleWhen: 'isOn = TRUE',
            parent: 'prototype',
            callback: onMessageReceived,
            softLabel: 'Ovw1',
            fontColor: '#FFFFFF',
            backgroundColor: '#211E1C',
            fontSize: 7,
            align: 'center'
          }
    )
        
    mx550.topButton5 = new ButtonEVO('top_button_5',
        {
            top: 162, left: 370, height: 18, width: 55
        }, 
        {
            visibleWhen: 'isOn = TRUE',
            parent: 'prototype',
            callback: onMessageReceived,
            softLabel: 'Ovw2',
            fontColor: '#FFFFFF',
            backgroundColor: '#211E1C',
            fontSize: 7,
            align: 'center'
          }
    )
    mx550.topButton6 = new ButtonEVO('top_button_6',
        {
            top: 162, left: 427, height: 18, width: 56
        }, 
        {
            visibleWhen: 'isOn = TRUE',
            parent: 'prototype',
            callback: onMessageReceived,
            softLabel: 'Ovw3',
            fontColor: '#FFFFFF',
            backgroundColor: '#211E1C',
            fontSize: 7,
            align: 'center'
          }
    )

    mx550.topButton7 = new ButtonEVO('top_button_7',
        {
            top: 162, left: 487, height: 18, width: 56
        }, 
        {
            visibleWhen: 'isOn = TRUE',
            parent: 'prototype',
            callback: onMessageReceived,
            softLabel: 'Ovw4',
            fontColor: '#FFFFFF',
            backgroundColor: '#211E1C',
            fontSize: 7,
            align: 'center'
          }
    )
    mx550.topButton8 = new ButtonEVO('top_button_8',
        {
            top: 162, left: 545, height: 18, width: 56
        }, 
        {
            visibleWhen: 'isOn = TRUE',
            parent: 'prototype',
            callback: onMessageReceived,
            softLabel: 'Ovw5',
            fontColor: '#FFFFFF',
            backgroundColor: '#211E1C',
            fontSize: 7,
            align: 'center'
          }
    )
    mx550.topButton9 = new ButtonEVO('top_button_9',
        {
            top: 162, left: 632, height: 18, width: 56
        }, 
        {
            visibleWhen: 'isOn = TRUE',
            parent: 'prototype',
            callback: onMessageReceived,
            softLabel: 'Ovw7',
            fontColor: '#000000',
            backgroundColor: '#00E7E8',
            fontSize: 7,
            align: 'center'
          }
    )

    mx550.topButton10 = new ButtonEVO('top_button_10',
        {
            top: 162, left: 690, height: 18, width: 56
        }, 
        {
            visibleWhen: 'isOn = TRUE',
            parent: 'prototype',
            callback: onMessageReceived,
            softLabel: 'Ovw9',
            fontColor: '#FFFFFF',
            backgroundColor: '#211E1C',
            fontSize: 7,
            align: 'center'
          }
    )

    mx550.topButton11 = new ButtonEVO('top_button_11',
        {
            top: 162, left: 748, height: 18, width: 56
        }, 
        {
            visibleWhen: 'isOn = TRUE',
            parent: 'prototype',
            callback: onMessageReceived,
            softLabel: 'Guest3',
            fontColor: '#FFFFFF',
            backgroundColor: '#211E1C',
            fontSize: 7,
            align: 'center'
          }
    )
    mx550.topButton12 = new ButtonEVO('top_button_12',
        {
            top: 162, left: 804, height: 18, width: 56
        }, 
        {
            visibleWhen: 'isOn = TRUE',
            parent: 'prototype',
            callback: onMessageReceived,
            softLabel: 'Bed31',
            fontColor: '#000000',
            backgroundColor: '#00E7E8',
            fontSize: 7,
            align: 'center'
          }
    )

    mx550.topButton13 = new ButtonEVO('top_button_13',
        {
            top: 162, left: 893, height: 18, width: 56
        }, 
        {
            visibleWhen: 'isOn = TRUE',
            parent: 'prototype',
            callback: onMessageReceived,
            softLabel: '*** Bed32',
            fontColor: '#FFFFFF',
            backgroundColor: '#E20000',
            fontSize: 7,
            align: 'center'
          }
    )

    mx550.topButton14 = new ButtonEVO('top_button_14',
        {
            top: 162, left: 951, height: 18, width: 56
        }, 
        {
            visibleWhen: 'isOn = TRUE',
            parent: 'prototype',
            callback: onMessageReceived,
            softLabel: 'Bed33',
            fontColor: '#FFFFFF',
            backgroundColor: '#211E1C',
            fontSize: 7,
            align: 'center'
          }
    )
    mx550.topButton15 = new ButtonEVO('top_button_15',
        {
            top: 162, left: 1009, height: 18, width: 56
        }, 
        {
            visibleWhen: 'isOn = TRUE',
            parent: 'prototype',
            callback: onMessageReceived,
            softLabel: '** Bed34',
            fontColor: '#000000',
            backgroundColor: '#E2E300',
            fontSize: 7,
            align: 'center'
          }
    )

    mx550.topButton16 = new ButtonEVO('top_button_16',
        {
            top: 162, left: 1067, height: 18, width: 56
        }, 
        {
            visibleWhen: 'isOn = TRUE',
            parent: 'prototype',
            callback: onMessageReceived,
            softLabel: 'Bed35',
            fontColor: '#000000',
            backgroundColor: '#00E7E8',
            fontSize: 7,
            align: 'center'
          }
    )

        // WAVES
        mx550.ecgII_wave = new Wave('ecgii-wave',
            {top: 210, left: 115, height: 70, width: 730},
            { 
                waveType: 'ecg',
                title: 'II',
                parent: 'prototype', 
                visibleWhen: "isOn = TRUE",
                scanBarWidth:20,
                fontSize: 10,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                pvsDefinition: {
                    waveColor: 'ecg_color',
                    backgroundColor: 'ecg_back_color',
                    heartRate: 'pulse'
                }
             })
        mx550.ecgV_wave = new Wave('ecgv-wave',
             {top: 270, left: 115, height: 70, width: 730},
             { 
                 waveType: 'ecg',
                 title: 'V',
                 parent: 'prototype', 
                 visibleWhen: "isOn = TRUE",
                 scanBarWidth:20,
                 fontSize: 10,
                 fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                 pvsDefinition: {
                     waveColor: 'ecg_color',
                     backgroundColor: 'ecg_back_color',
                     heartRate: 'pulse'
                 }
              })
        mx550.spo2_wave = new Wave('spo2-wave',
              {top: 320, left: 115, height: 70, width: 730},
              { 
                  waveType: 'pleth',
                  title: 'Pleth',
                  parent: 'prototype', 
                  visibleWhen: "isOn = TRUE",
                  scanBarWidth:20,
                  fontSize: 10,
                  fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                  pvsDefinition: {
                      waveColor: 'spo2_wave_color',
                      backgroundColor: 'spo2_wave_back_color',
                      heartRate: 'pulse'
                  }
               })
        
        mx550.abp_wave = new Wave('abp-wave',
             {top: 380, left: 115, height: 70, width: 730},
             { 
                 waveType: 'abp',
                 title: 'ABP',
                 parent: 'prototype', 
                 visibleWhen: "isOn = TRUE",
                 scanBarWidth:20,
                 fontSize: 10,
                 fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                 pvsDefinition: {
                    waveColor: 'abp_wave_color',
                    backgroundColor: 'abp_wave_back_color',
                    heartRate: 'breath_rate'
                }
              })
        
        mx550.pap_wave = new Wave('pap-wave',
              {top: 420, left: 115, height: 70, width: 730},
              { 
                  waveType: 'pap',
                  title: 'PAP',
                  parent: 'prototype', 
                  visibleWhen: "isOn = TRUE",
                  scanBarWidth:20,
                  fontSize: 10,
                  fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                  pvsDefinition: {
                    waveColor: 'pap_wave_color',
                    backgroundColor: 'pap_wave_back_color',
                    heartRate: 'breath_rate'
                }
               })

        mx550.cvp_wave = new Wave('cvp-wave',
               {top: 480, left: 115, height: 60, width: 730},
               { 
                   waveType: 'cvp',
                   title: 'CVP',
                   parent: 'prototype', 
                   visibleWhen: "isOn = TRUE",
                   scanBarWidth:20,
                   fontSize: 10,
                   fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                   pvsDefinition: {
                        waveColor: 'cvp_wave_color',
                        backgroundColor: 'cvp_wave_back_color',
                        heartRate: 'breath_rate'
                    }
                })

        mx550.icp_wave = new Wave('icp-wave',
                {top: 540, left: 115, height: 70, width: 730},
                { 
                    waveType: 'icp',
                    title: 'ICP',
                    parent: 'prototype', 
                    visibleWhen: "isOn = TRUE",
                    scanBarWidth:20,
                    fontSize: 10,
                    fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                    pvsDefinition: {
                        waveColor: 'icp_wave_color',
                        backgroundColor: 'icp_wave_back_color',
                        heartRate: 'breath_rate'
                    }
                 })


               
        mx550.co2_wave = new Wave('co2-wave',
            { top: 610, left: 115, height:50, width: 730 },
            { 
                waveType: 'co2', 
                title: 'CO2',
                parent: 'prototype',
                visibleWhen: "isOn = TRUE",
                filled: 'down',
                scanBarWidth:20,
                fontSize: 10,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                pvsDefinition: {
                    waveColor: 'co2_wave_color',
                    backgroundColor: 'co2_wave_back_color',
                    heartRate: 'breath_rate',
                    fillColor: 'co2_fill_color'
                }
            }
        )

        mx550.alarmsoff_display = new BasicDisplayEVO('alarmsoff-display', 
            {top: 200, left: 925, width: 200, height: 17},
            {
                parent: 'prototype',
                fontColor: "#FF0000",
                backgroundColor: '#FFFFFF',
                /*TODO: arranjar forma de fcriar um novo parametro que seja algo como isOnANDisAlarmOff como tratar isto no PVS? */
                visibleWhen: "isAlarmOn = FALSE",
                align: 'left',
                fontSize: 10,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontWeight: 'bold',
                displayKey: 'alarmsOffMsg'
            }
        )
        mx550.alarmsoff_img = new BasicDisplayEVO('alarmsoff-img', 
            {top: 199, left: 905, width: 20, height: 17},
            {
                parent: 'prototype',
                fontColor: "#FF0000",
                backgroundColor: '#FFFFFF',
                visibleWhen: "isAlarmOn = FALSE",
                align: 'left',
                fontSize: 12,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontWeight: 'bold'
            }
        )

        mx550.hr_display = new MaxMinDisplay(
            'heartrate-display',
            {top: 220, left: 860, width: 100, height: 50},
            {
                parent: 'prototype',
                fontColor: '#00FF00',
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: "isOn = TRUE",
                pvsValue:'pulse', 
                pvsMinValue: 'hr_min', 
                pvsMaxValue:'hr_max', 
                pvsTitle:'hr_label'
            }
        )
        mx550.pulse_display = new BasicDisplayEVO('pulse-display', 
            {top: 245, left: 1030, width: 50, height: 50},
            {
                parent: 'prototype',
                fontColor: "#0FF0FF",
                backgroundColor: 'none',
                visibleWhen: "isOn = TRUE",
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                displayKey: 'pulse'
            }
        )

        mx550.spo2_display = new MaxMinDisplay('sop2-display',
            {top: 336, left: 860, width: 100, height: 50},
            {
                parent: 'prototype',
                fontColor: '#0FF0FF',
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: "isOn = TRUE",
                pvsValue:'spo2', 
                pvsMinValue: 'spo2_min', 
                pvsMaxValue:'spo2_max', 
                pvsTitle:'spo2_label'
            }
        )

        mx550.perf_display = new MaxMinDisplay('perf-display',
            {top: 336, left: 1000, width: 100, height: 50},
            {
                parent: 'prototype',
                fontColor: '#0FF0FF',
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'transparent',
                visibleWhen: "isOn = TRUE",
                pvsValue:'perf', 
                pvsTitle:'perfLabel'
            })
        
        mx550.STI = new BasicDisplayEVO('sti',
            {top: 257, left: 854, width: 50, height: 20},
            {
                parent: 'prototype',
                fontColor: "#00FF00",
                backgroundColor: "transparent",
                visibleWhen: "isOn = TRUE",
                fontSize: 8,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                align: 'left',
                displayKey: 'sti'
            }
            )

        mx550.STII = new BasicDisplayEVO('stii',
        {top: 267, left: 854, width: 50, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'stii'
        }
        )
        mx550.STIII = new BasicDisplayEVO('stiii',
        {top: 277, left: 854, width: 50, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'stiii'
        }
        )
        mx550.STAVR = new BasicDisplayEVO('stavr',
        {top: 287, left: 854, width: 50, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'staVR'
        }
        )
        mx550.STAVL = new BasicDisplayEVO('stavl',
        {top: 297, left: 854, width: 50, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'staVL'
        }
        )
        mx550.STAVF = new BasicDisplayEVO('stavf',
            {top: 307, left: 854, width: 50, height: 20},
            {
                parent: 'prototype',
                fontColor: "#00FF00",
                backgroundColor: "transparent",
                visibleWhen: "isOn = TRUE",
                fontSize: 8,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                align: 'left',
                displayKey: 'staVF'
            }
        )
        /* STI values */

        mx550.STI_val = new BasicDisplayEVO('sti_val',
            {top: 257, left: 890, width: 20, height: 20},
            {
                parent: 'prototype',
                fontColor: "#00FF00",
                backgroundColor: "transparent",
                visibleWhen: "isOn = TRUE",
                fontSize: 8,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                align: 'right',
                displayKey: 'sti_v'
            }
        )

        mx550.STII_val = new BasicDisplayEVO('stii_val',
            {top: 267, left: 890, width: 20, height: 20},
            {
                parent: 'prototype',
                fontColor: "#00FF00",
                backgroundColor: "transparent",
                visibleWhen: "isOn = TRUE",
                fontSize: 8,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                align: 'right',
                displayKey: 'stii_v'
            }
        )
        mx550.STIII_val = new BasicDisplayEVO('stiii_val',
            {top: 277, left: 890, width: 20, height: 20},
            {
                parent: 'prototype',
                fontColor: "#00FF00",
                backgroundColor: "transparent",
                visibleWhen: "isOn = TRUE",
                fontSize: 8,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                align: 'right',
                displayKey: 'stiii_v'
            }
        )
        mx550.STAVR_val = new BasicDisplayEVO('stavr_val',
            {top: 287, left: 890, width: 20, height: 20},
            {
                parent: 'prototype',
                fontColor: "#00FF00",
                backgroundColor: "transparent",
                visibleWhen: "isOn = TRUE",
                fontSize: 8,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                align: 'right',
                displayKey: 'staVR_v'
            }
        )
        mx550.STAVL_val = new BasicDisplayEVO('stavl_val',
            {top: 297, left: 890, width: 20, height: 20},
            {
                parent: 'prototype',
                fontColor: "#00FF00",
                backgroundColor: "transparent",
                visibleWhen: "isOn = TRUE",
                fontSize: 8,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                align: 'right',
                displayKey: 'staVL_v'
            }
        )
        mx550.STAVF_val = new BasicDisplayEVO('stavf_val',
        {top: 307, left: 890, width: 20, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'right',
            displayKey: 'staVF_v'
        }
        )
        
        mx550.STV1 = new BasicDisplayEVO('stv1',
        {top: 257, left: 920, width: 20, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'stv1'
        }
        )
        mx550.STV1_val = new BasicDisplayEVO('stv1_val',
        {top: 257, left: 955, width: 20, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'right',
            displayKey: 'stv1_v'
        }
        )
        mx550.STV2 = new BasicDisplayEVO('stv2',
        {top: 267, left: 920, width: 20, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'stv2'
        }
        )
        mx550.STV2_val = new BasicDisplayEVO('stv2_val',
        {top: 267, left: 955, width: 20, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'right',
            displayKey: 'stv2_v'
        }
        )
        mx550.STV3 = new BasicDisplayEVO('stv3',
        {top: 277, left: 920, width: 20, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'stv3'
        }
        )
        mx550.STV3_val = new BasicDisplayEVO('stv3_val',
        {top: 277, left: 955, width: 20, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'right',
            displayKey: 'stv3_v'
        }
        )
        mx550.STV4 = new BasicDisplayEVO('stv4',
        {top: 287, left: 920, width: 20, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'stv4'
        }
        )
        mx550.STV4_val = new BasicDisplayEVO('stv4_val',
        {top: 287, left: 955, width: 20, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'right',
            displayKey: 'stv4_v'
        }
        )
        mx550.STV5 = new BasicDisplayEVO('stv5',
        {top: 297, left: 920, width: 20, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'stv5'
        }
        )
        mx550.STV5_val = new BasicDisplayEVO('stv5_val',
        {top: 297, left: 955, width: 20, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'right',
            displayKey: 'stv5_v'
        }
        )
        mx550.STV6 = new BasicDisplayEVO('stv6',
        {top: 307, left: 920, width: 20, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'stv6'
        }
        )
        mx550.STV6_val = new BasicDisplayEVO('stv6_val',
        {top: 307, left: 955, width: 20, height: 20},
        {
            parent: 'prototype',
            fontColor: "#00FF00",
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'right',
            displayKey: 'stv6_v'
        }
        )

        mx550.noPatientMessage = new BasicDisplayEVO('no_patient_message',
        {top: 735, left: 106, width: 500, height: 15},
        {
            parent: 'prototype',
            fontColor: "#FFFFFF",
            backgroundColor: "transparent",
            visibleWhen: "noPatient = TRUE",
            fontWeight: 'bolder',
            align: 'left',
            fontSize: 8,
            /* fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif', */
            displayKey: 'noPatientMsg',
            
        }
        )

        mx550.tCore_display = new MaxMinDisplay(
            'tcore-display',
            {top: 660, left: 860, width: 100, height: 60},
            {
                parent: 'prototype',
                fontColor: '#00FF00',
                fontSize: 35,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: "isOn = TRUE",
                type: 'String',
                pvsValue: 'tcore',
                pvsMinValue: 'tcore_min',
                pvsMaxValue: 'tcore_max',
                pvsTitle: 'tcore_label'
            }
        )

        mx550.tSkin_display = new MaxMinDisplay(
            'tskin-display',
            {top: 660, left: 1010, width: 100, height: 60},
            {
                parent: 'prototype',
                fontColor: '#F98BFB',
                fontSize: 35,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: "isOn = TRUE",
                type: 'String',
                pvsValue: 'tskin',
                pvsTitle: 'tskin_label',
                pvsMinValue: 'tskin_min',
                pvsMaxValue: 'tskin_max'
            }
        )

        mx550.nbp_display = new MaxMinDisplay(
            'nbp-display',
            {top: 660, left: 115, width: 100, height: 60},
            {
                parent: 'prototype',
                fontColor: '#F47F7E',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: "isOn = TRUE",
                type: 'String',
                pvsValue: 'nbp',
                pvsTitle: 'nbp_label',
                pvsMinValue: 'nbp_min',
                pvsMaxValue: 'nbp_max'
            }
        )

        mx550.abp_display = new MaxMinDisplay(
            'abp-display',
            {top: 390, left: 860, width: 200, height: 60},
            {
                parent: 'prototype',
                fontColor: '#E33632',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: "isOn = TRUE",
                pvsValue:'abp', 
                pvsMinValue: 'abp_min', 
                pvsMaxValue:'abp_max', 
                pvsTitle:'abp_label', 
                pvsSubtitle:'abp_sublabel'
            }
        )

        mx550.pap_display = new MaxMinDisplay(
            'pap-display',
            {top: 440, left: 860, width: 200, height: 60},
            {
                parent: 'prototype',
                fontColor: '#FAE15C',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: "isOn = TRUE",
                pvsValue:'pap', 
                pvsMinValue: 'pap_min', 
                pvsMaxValue:'pap_max', 
                pvsTitle:'pap_label', 
                pvsSubtitle:'pap_sublabel'
            }
        )

        mx550.cvp_display = new MaxMinDisplay(
            'cvp-display',
            {top: 490, left: 860, width: 200, height: 60},
            {
                parent: 'prototype',
                fontColor: '#41DAF9',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: "isOn = TRUE",
                type: 'Integer',
                bracket: 'parenthesis',
                pvsValue:'cvp', 
                pvsMaxValue:'cvp_max', 
                pvsTitle:'cvp_label',
                pvsSubtitle: 'cvp_sublabel'
            }
        )

        mx550.icp_display = new MaxMinDisplay(
            'icp-display',
            {top: 540, left: 860, width: 200, height: 60},
            {
                parent: 'prototype',
                fontColor: '#E827F4',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: "isOn = TRUE",
                type: 'Integer',
                bracket: 'parenthesis',
                pvsValue:'icp', 
                pvsMaxValue:'icp_max', 
                pvsTitle:'icp_label',
                pvsSubtitle: 'icp_sublabel'
            }
        )
        mx550.cpp_display = new MaxMinDisplay(
            'cpp-display',
            {top: 540, left: 1010, width: 100, height: 60},
            {
                parent: 'prototype',
                fontColor: '#E827F4',
                fontSize: 30,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: "isOn = TRUE",
                type: 'Integer',
                pvsValue:'cpp', 
                pvsMinValue: 'cpp_min', 
                pvsMaxValue:'cpp_max', 
                pvsTitle:'cpp_label',
            }
        )

        mx550.etco2_display = new MaxMinDisplay(
            'etco2-display',
            {top: 610, left: 860, width: 100, height: 50},
            {
                parent: 'prototype',
                fontColor: '#999a9b',
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: "isOn = TRUE",
                type: 'Integer',
                pvsValue: 'etco2',
                pvsTitle: 'etco2_label',
                pvsMaxValue: 'etco2_max',
                pvsMinValue: 'etco2_min'
            }
        )

        mx550.awRR_display = new MaxMinDisplay(
            'awrr-display',
            {top: 610, left: 1010, width: 100, height: 50},
            {
                parent: 'prototype',
                fontColor: '#999a9b',
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: "isOn = TRUE",
                type: 'Integer',
                pvsValue: 'awrr',
                pvsTitle: 'awrr_label',
                pvsMinValue: 'awrr_min',
                pvsMaxValue: 'awrr_max'
            }
        )

        mx550.spo2_graphics = new ImageRender(
            'spo2_graphics',
            {top: 370, left: 860, width: 10, height: 20},
            {
                parent: 'prototype',
                displayKey: 'spo2Graphics',
                visibleWhen: 'isOn = TRUE'
            }
        )

        mx550.spo2_rec = new ImageRender(
            'spo2_rectangle',
            {top: 355, left: 1005, width: 7, height: 50},
            {
                parent: 'prototype',
                displayKey: 'spo2Rectangle',
                visibleWhen: 'isOn = TRUE'
            }
        )


        // PLUGS
        mx550.spo2_plug = new Plug(
            'spo2_plug',
            { top: 155, left: 1350, width: 40, height:50, top_plug: 250, left_plug: 1350 },
            { 
                parent: 'plug-rack-widgets', 
                image_unplugged: 'img/spo2_unplugged.png',
                image_plugged: 'img/spo2_unplugged.png',
                image_socket: 'img/spo2_socket.png',
                isPlugged: false
             }
        )
        mx550.ecg_plug = new Plug(
            'ecg_plug',
            { top: 155, left: 1295, width: 50, height:50, top_plug: 250, left_plug: 1250 },
            { 
                parent: 'plug-rack-widgets', 
                image_unplugged: 'img/ecg_unplugged.png',
                image_plugged: 'img/ecg_plugged.png',
                image_socket: 'img/ecg_socket.png',
                isPlugged: false
             }
        )


        /* NBPs displays */
        mx550.NBP_title = new BasicDisplayEVO('nbp_title',
        {top: 680, left: 470, width: 30, height: 17},
        {
            parent: 'prototype',
            fontColor: '#F47F7E',
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontWeight: 'bold',
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'nbpTitle'
        }
        )

        mx550.NBP_subtitle = new BasicDisplayEVO('nbp_subtitle',
        {top: 693, left: 470, width: 30, height: 17},
        {
            parent: 'prototype',
            fontColor: '#F47F7E',
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 6,
            fontWeight: 'bold',
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'nbpSubtitle'
        }
        )

        mx550.NBP1h = new BasicDisplayEVO('nbp1hour',
        {top: 682, left: 533, width: 30, height: 17},
        {
            parent: 'prototype',
            fontColor: '#F47F7E',
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 6,
            fontWeight: 'bold',
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'nbp1hour'
        }
        )

        mx550.NBP1 = new BasicDisplayEVO('nbp1',
        {top: 682, left: 584, width: 50, height: 17},
        {
            parent: 'prototype',
            fontColor: '#F47F7E',
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontWeight: 'bold',
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'nbp1'
        }
        )

        mx550.NBP2h = new BasicDisplayEVO('nbp2hour',
        {top: 692, left: 533, width: 30, height: 17},
        {
            parent: 'prototype',
            fontColor: '#F47F7E',
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 6,
            fontWeight: 'bold',
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'nbp2hour'
        }
        )

        mx550.NBP2 = new BasicDisplayEVO('nbp2',
        {top: 692, left: 584, width: 50, height: 17},
        {
            parent: 'prototype',
            fontColor: '#F47F7E',
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontWeight: 'bold',
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'nbp2'
        }
        )

        mx550.NBP3h = new BasicDisplayEVO('nbp3hour',
        {top: 703, left: 533, width: 30, height: 17},
        {
            parent: 'prototype',
            fontColor: '#F47F7E',
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 6,
            fontWeight: 'bold',
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'nbp3hour'
        }
        )

        mx550.NBP3 = new BasicDisplayEVO('nbp3',
        {top: 703, left: 584, width: 50, height: 17},
        {
            parent: 'prototype',
            fontColor: '#F47F7E',
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontWeight: 'bold',
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'nbp3'
        }
        )

        mx550.NBP4h = new BasicDisplayEVO('nbp4hour',
        {top: 714, left: 533, width: 30, height: 17},
        {
            parent: 'prototype',
            fontColor: '#F47F7E',
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 6,
            fontWeight: 'bold',
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'nbp4hour'
        }
        )

        mx550.NBP4 = new BasicDisplayEVO('nbp4',
        {top: 714, left: 584, width: 50, height: 17},
        {
            parent: 'prototype',
            fontColor: '#F47F7E',
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontWeight: 'bold',
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'nbp4'
        }
        )

        mx550.NBP5h = new BasicDisplayEVO('nbp5hour',
        {top: 725, left: 533, width: 30, height: 17},
        {
            parent: 'prototype',
            fontColor: '#F47F7E',
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 6,
            fontWeight: 'bold',
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'nbp5hour'
        }
        )

        mx550.NBP5 = new BasicDisplayEVO('nbp5',
        {top: 725, left: 584, width: 50, height: 17},
        {
            parent: 'prototype',
            fontColor: '#F47F7E',
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontWeight: 'bold',
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'nbp5'
        }
        )

        mx550.NBP6h = new BasicDisplayEVO('nbp6hour',
        {top: 736, left: 533, width: 30, height: 17},
        {
            parent: 'prototype',
            fontColor: '#F47F7E',
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 6,
            fontWeight: 'bold',
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'nbp6hour'
        }
        )

        mx550.NBP6 = new BasicDisplayEVO('nbp6',
        {top: 736, left: 584, width: 50, height: 17},
        {
            parent: 'prototype',
            fontColor: '#F47F7E',
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 8,
            fontWeight: 'bold',
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'nbp6'
        }
        )

        mx550.NBPMode = new BasicDisplayEVO('nbp_mode',
        {top: 660, left: 245, width: 50, height: 17},
        {
            parent: 'prototype',
            fontColor: '#F47F7E',
            backgroundColor: "transparent",
            visibleWhen: "isOn = TRUE",
            fontSize: 7,
            fontWeight: 'bold',
            fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
            align: 'left',
            displayKey: 'nbpMode'
        }
        )

        mx550.NBPGraphics = new ImageRender(
            'nbp_graphics',
            {top: 660, left: 370, width: 26, height: 6},
            {
                parent: 'prototype',
                backgroundColor: "transparent",
                displayKey: 'nbpGraphics',
                visibleWhen: 'isOn = TRUE'
            }
        )
        mx550.NBPTime = new BasicDisplayEVO('nbp_time',
            {top: 665, left: 396, width: 30, height: 10},
            {
                parent: 'prototype',
                fontColor: '#F47F7E',   
                backgroundColor: "transparent",
                visibleWhen: 'isOn = TRUE',
                fontSize: 7,
                fontWeight: 'bold',
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                align: 'left',
                displayKey: 'nbpTime' 
            }
        )

        /* Bottom buttons */

        mx550.silenceButton = new ButtonImage('silence',
            {top: 752, left: 108, width: 48, height: 38},
            {
                parent: 'prototype',
                backgroundColor: '#FFCB00',
                visibleWhen: 'isOn = TRUE',
                fontSize: 7,
                fontColor: '#000000',
                fontWeight: 'bold',
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                align: 'center',
                textDisplayKey: 'silenceButtonText',
                imageDisplayKey: 'silenceButtonImage'
            })
        
        mx550.alarmsoffborder = new BasicDisplayEVO('alarms-off-border',
            {top: 752, left: 155, width: 48 , height: 38},
            {
                parent: 'prototype',
                backgroundColor: '#FFCB00',
                visibleWhen: 'isOn = TRUE'
            })


        mx550.alarmsOffButton = new ButtonImage('alarms-off-button',
            {top: 754, left: 157, width: 43, height: 34},
            {
                parent: 'prototype',
                backgroundColor: '#32352E', //'#FFCB00',
                visibleWhen: 'isOn = TRUE',
                fontSize: 6,
                fontColor: '#FFFFFF',
                fontWeight: 'bold',
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                align: 'center',
                textDisplayKey: 'alarmsOffText',
                imageDisplayKey: 'alarmsOffImage'
            })

        // LEDs
        mx550.onoff_led = new LED("onoff_led", 
            {top: 930, left: 380, width: 17, height: 17},
            {
                parent: "prototype",
                color: "orange",
                callback: onMessageReceived,
                backgroundColor: "transparent" // does this button light up?
            })

        // utility function
        function evaluate(str) {
            var v = +str;
            if (str.indexOf("/") >= 0) {
                var args = str.split("/");
                v = +args[0] / +args[1];
            }
            return (v <= 0) ? "--" : ((v < 10) ? v.toFixed(1).toString() : v.toFixed(0).toString());
        }

        function render_widgets(res){
            for(var widget in mx550){
                if(!mx550.hasOwnProperty(widget)) continue;
                mx550[widget].render(res)
            }

            mx550.network.renderGlyphicon('glyphicon-user', {'blinking':false})
            mx550.patientName.renderGlyphicon('glyphicon-user',{'blinking':false})
            mx550.profile.renderGlyphicon('glyphicon-credit-card', {'blinking': false})
            mx550.view.renderGlyphicon('glyphicon-modal-window', {'blinking': false})
            mx550.alarmsoff_img.renderGlyphicon('glyphicon-bell',{'blinking':false});
            if(res.isOn === 'TRUE'){
                mx550.onoff_led.render(res, {color: "#b0ff77"}) /* bright green */
            }else{
                mx550.onoff_led.render(res, {color: 'grey'})
            }
        }

        /**
         function to handle when an output has been received from the server after sending a guiAction
         if the first parameter is truthy, then an error occured in the process of evaluating the gui action sent
         */
        function onMessageReceived(err, event) {
            function prettyprintState(str) {
                var state = stateParser.parse(str);
                //state.spo2_label = state.spo2_label.replace(/"/g, "");
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
                        render_widgets(res)
                    }
                }
            } else {
                console.log(err);
            }
        }


        //--- tick function -------------------
        start_tick = function () {
            console.log(`Start Tick`)
            if (!tick) {
                tick = setInterval(function () {
                    client.getWebSocket()
                        .sendGuiAction("tick(" + client.getWebSocket().lastState() + ");", onMessageReceived);
                }, 2000);
            }
        };

        stop_tick = function () {
            console.log(`Stop Tick`)
            if (tick) {
                clearInterval(tick);
                tick = null;
            }
        };

        // set demo prototype folder. PVS specification will load from here
        var demoFolder = "PhilipsMx550";
        //register event listener for websocket connection from the client
        client.addListener('WebSocketConnectionOpened', function (e) {
            console.log("web socket connected");
            //start pvs process
            client.getWebSocket().startPVSProcess({name: "main.pvs", demoName: demoFolder + "/pvs"}, function (err, event) {
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
