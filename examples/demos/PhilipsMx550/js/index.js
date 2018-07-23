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
        "widgets/med/ImageRender/ImageRender",
        "widgets/med/Plug/Plug",
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
              ImageRender,
              Plug,
              stateParser,
              PVSioWebClient,
              NCDevice) {
        "use strict";


        var deviceID = "Mx550";
        var deviceType = "SpO2 Monitor";
        let alarmsOn = true
        let triangle0 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><!-- Created with Inkscape (http://www.inkscape.org/) --><svg   width="100%" height="100%" viewBox="0 0 52.916665 105.83334"   version="1.1"   id="svg8">  <defs     id="defs2" />  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(-1,-190)">    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 0,191.16665 h 52.916666 v 13.22917 H 6.6145832 Z"       id="path3705"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="M 6.6145832,204.39582 H 52.916666 v 13.22916 H 13.229167 Z"       id="path3707"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 13.229167,217.62498 h 39.687499 v 13.22917 H 19.84375 Z"       id="path3709"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 19.84375,230.85415 h 33.072916 v 13.22917 H 26.458333 Z"       id="path3711"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1       d="m 26.458333,244.08332 h 26.458333 v 13.22916 h -19.84375 z"       id="path3713"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 33.072916,257.31248 h 19.84375 v 13.22917 H 39.6875 Z"       id="path3715"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,270.54165 v 13.22917 H 46.302083 L 39.6875,270.54165 v 0 0 0 0 0 z"       id="path3717"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,283.77082 v 13.22916 l -6.614583,-13.22916 z"       id="path3719" /></g></svg>'
        let triangle1 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><!-- Created with Inkscape (http://www.inkscape.org/) --><svg   width="100%" height="100%"   viewBox="0 0 52.916665 105.83334"   version="1.1"   id="svg8">  <defs     id="defs2" />  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(-1,-190)">    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 0,191.16665 h 52.916666 v 13.22917 H 6.6145832 Z"       id="path3705"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="M 6.6145832,204.39582 H 52.916666 v 13.22916 H 13.229167 Z"       id="path3707"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 13.229167,217.62498 h 39.687499 v 13.22917 H 19.84375 Z"       id="path3709"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 19.84375,230.85415 h 33.072916 v 13.22917 H 26.458333 Z"       id="path3711"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 26.458333,244.08332 h 26.458333 v 13.22916 h -19.84375 z"       id="path3713"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 33.072916,257.31248 h 19.84375 v 13.22917 H 39.6875 Z"       id="path3715"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,270.54165 v 13.22917 H 46.302083 L 39.6875,270.54165 v 0 0 0 0 0 z"       id="path3717"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,283.77082 v 13.22916 l -6.614583,-13.22916 z"       id="path3719" />  </g></svg>'
        let triangle2 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><!-- Created with Inkscape (http://www.inkscape.org/) --><svg   width="100%" height="100%"   viewBox="0 0 52.916665 105.83334"   version="1.1"   id="svg8">  <defs     id="defs2" />  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(-1,-190)">    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 0,191.16665 h 52.916666 v 13.22917 H 6.6145832 Z"       id="path3705"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="M 6.6145832,204.39582 H 52.916666 v 13.22916 H 13.229167 Z"       id="path3707"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 13.229167,217.62498 h 39.687499 v 13.22917 H 19.84375 Z"       id="path3709"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 19.84375,230.85415 h 33.072916 v 13.22917 H 26.458333 Z"       id="path3711"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 26.458333,244.08332 h 26.458333 v 13.22916 h -19.84375 z"       id="path3713"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 33.072916,257.31248 h 19.84375 v 13.22917 H 39.6875 Z"       id="path3715"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,270.54165 v 13.22917 H 46.302083 L 39.6875,270.54165 v 0 0 0 0 0 z"       id="path3717"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,283.77082 v 13.22916 l -6.614583,-13.22916 z"       id="path3719" />  </g></svg>'
        let triangle3 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><!-- Created with Inkscape (http://www.inkscape.org/) --><svg   width="100%" height="100%"   viewBox="0 0 52.916665 105.83334"   version="1.1"   id="svg8">  <defs     id="defs2" />  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(-1,-190)">    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 0,191.16665 h 52.916666 v 13.22917 H 6.6145832 Z"       id="path3705"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="M 6.6145832,204.39582 H 52.916666 v 13.22916 H 13.229167 Z"       id="path3707"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 13.229167,217.62498 h 39.687499 v 13.22917 H 19.84375 Z"       id="path3709"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 19.84375,230.85415 h 33.072916 v 13.22917 H 26.458333 Z"       id="path3711"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 26.458333,244.08332 h 26.458333 v 13.22916 h -19.84375 z"       id="path3713"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 33.072916,257.31248 h 19.84375 v 13.22917 H 39.6875 Z"       id="path3715"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,270.54165 v 13.22917 H 46.302083 L 39.6875,270.54165 v 0 0 0 0 0 z"       id="path3717"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,283.77082 v 13.22916 l -6.614583,-13.22916 z"       id="path3719" />  </g></svg>'
        let triangle4 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><!-- Created with Inkscape (http://www.inkscape.org/) --><svg   width="100%" height="100%"   viewBox="0 0 52.916665 105.83334"   version="1.1"   id="svg8">  <defs     id="defs2" />  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(-1,-190)">    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 0,191.16665 h 52.916666 v 13.22917 H 6.6145832 Z"       id="path3705"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="M 6.6145832,204.39582 H 52.916666 v 13.22916 H 13.229167 Z"       id="path3707"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 13.229167,217.62498 h 39.687499 v 13.22917 H 19.84375 Z"       id="path3709"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 19.84375,230.85415 h 33.072916 v 13.22917 H 26.458333 Z"       id="path3711"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 26.458333,244.08332 h 26.458333 v 13.22916 h -19.84375 z"       id="path3713"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 33.072916,257.31248 h 19.84375 v 13.22917 H 39.6875 Z"       id="path3715"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,270.54165 v 13.22917 H 46.302083 L 39.6875,270.54165 v 0 0 0 0 0 z"       id="path3717"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,283.77082 v 13.22916 l -6.614583,-13.22916 z"       id="path3719" />  </g></svg>'
        let triangle5 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><!-- Created with Inkscape (http://www.inkscape.org/) --><svg   width="100%" height="100%"   viewBox="0 0 52.916665 105.83334"   version="1.1"   id="svg8">  <defs     id="defs2" />  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(-1,-190)">    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 0,191.16665 h 52.916666 v 13.22917 H 6.6145832 Z"       id="path3705"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="M 6.6145832,204.39582 H 52.916666 v 13.22916 H 13.229167 Z"       id="path3707"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 13.229167,217.62498 h 39.687499 v 13.22917 H 19.84375 Z"       id="path3709"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 19.84375,230.85415 h 33.072916 v 13.22917 H 26.458333 Z"       id="path3711"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 26.458333,244.08332 h 26.458333 v 13.22916 h -19.84375 z"       id="path3713"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 33.072916,257.31248 h 19.84375 v 13.22917 H 39.6875 Z"       id="path3715"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,270.54165 v 13.22917 H 46.302083 L 39.6875,270.54165 v 0 0 0 0 0 z"       id="path3717"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,283.77082 v 13.22916 l -6.614583,-13.22916 z"       id="path3719" />  </g></svg>'
        let triangle6 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><!-- Created with Inkscape (http://www.inkscape.org/) --><svg   width="100%" height="100%"   viewBox="0 0 52.916665 105.83334"   version="1.1"   id="svg8">  <defs     id="defs2" />  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(-1,-190)">    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 0,191.16665 h 52.916666 v 13.22917 H 6.6145832 Z"       id="path3705"/>    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="M 6.6145832,204.39582 H 52.916666 v 13.22916 H 13.229167 Z"       id="path3707"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 13.229167,217.62498 h 39.687499 v 13.22917 H 19.84375 Z"       id="path3709"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 19.84375,230.85415 h 33.072916 v 13.22917 H 26.458333 Z"       id="path3711"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 26.458333,244.08332 h 26.458333 v 13.22916 h -19.84375 z"       id="path3713"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 33.072916,257.31248 h 19.84375 v 13.22917 H 39.6875 Z"       id="path3715"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,270.54165 v 13.22917 H 46.302083 L 39.6875,270.54165 v 0 0 0 0 0 z"       id="path3717"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,283.77082 v 13.22916 l -6.614583,-13.22916 z"       id="path3719" />  </g></svg>'
        let triangle7 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><!-- Created with Inkscape (http://www.inkscape.org/) --><svg   width="100%" height="100%"   viewBox="0 0 52.916665 105.83334"   version="1.1"   id="svg8">  <defs     id="defs2" />  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(-1,-190)">    <path       style="fill:none;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 0,191.16665 h 52.916666 v 13.22917 H 6.6145832 Z"       id="path3705"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="M 6.6145832,204.39582 H 52.916666 v 13.22916 H 13.229167 Z"       id="path3707"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 13.229167,217.62498 h 39.687499 v 13.22917 H 19.84375 Z"       id="path3709"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 19.84375,230.85415 h 33.072916 v 13.22917 H 26.458333 Z"       id="path3711"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 26.458333,244.08332 h 26.458333 v 13.22916 h -19.84375 z"       id="path3713"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 33.072916,257.31248 h 19.84375 v 13.22917 H 39.6875 Z"       id="path3715"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,270.54165 v 13.22917 H 46.302083 L 39.6875,270.54165 v 0 0 0 0 0 z"       id="path3717"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,283.77082 v 13.22916 l -6.614583,-13.22916 z"       id="path3719" />  </g></svg>'
        let triangle8 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><!-- Created with Inkscape (http://www.inkscape.org/) --><svg   width="100%" height="100%"   viewBox="0 0 52.916665 105.83334"   version="1.1"   id="svg8">  <defs     id="defs2" />  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(-1,-190)">    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 0,191.16665 h 52.916666 v 13.22917 H 6.6145832 Z"       id="path3705"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="M 6.6145832,204.39582 H 52.916666 v 13.22916 H 13.229167 Z"       id="path3707"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 13.229167,217.62498 h 39.687499 v 13.22917 H 19.84375 Z"       id="path3709"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 19.84375,230.85415 h 33.072916 v 13.22917 H 26.458333 Z"       id="path3711"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 26.458333,244.08332 h 26.458333 v 13.22916 h -19.84375 z"       id="path3713"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 33.072916,257.31248 h 19.84375 v 13.22917 H 39.6875 Z"       id="path3715"/>    <path       style="fill:#0FF0FF;stroke:#04d5e2;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,270.54165 v 13.22917 H 46.302083 L 39.6875,270.54165 v 0 0 0 0 0 z"       id="path3717"/>    <path       style="fill:#0FF0FF;stroke:#04d5e293bcff;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 52.916666,283.77082 v 13.22916 l -6.614583,-13.22916 z"       id="path3719" />  </g></svg>'
        let rectangle0 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg   width="100%"   height="100%"   viewBox="0 0 26.458333 79.375002"   id="svg16">0  <g     id="layer1"     transform="translate(0,-217.62498)">    <rect       style="fill:none;stroke:#04d5e2;stroke-width:4"       id="rect3732"       width="25.324404"       height="78.241081"       x="0.66145831"       y="218.09744"       ry="5.6843419e-14" />    <rect style="fill:#04d5e2;stroke:#04d5e2;stroke-width:0.26458332" id="rect8" width="17.105249" height="43.564945" x="4.2816849" y="221.57956" ry="5.6843348e-14" /></g></svg>'
        let rectangle1 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><!-- Created with Inkscape (http://www.inkscape.org/) --><svg   width="100%"   height="100%"   viewBox="0 0 26.458333 79.375002"   id="svg16">  <g     id="layer1"     transform="translate(0,-217.62498)">    <rect       style="fill:none;stroke:#04d5e2;stroke-width:4"       id="rect3732"       width="25.324404"       height="78.241081"       x="0.66145831"       y="218.09744"       ry="5.6843419e-14" />    <rect       style="fill:#04d5e2;stroke:#04d5e2;stroke-width:0.26458332"       id="rect8"       width="17.105249"       height="43.564945"       x="4.8108516"       y="234.45891"       ry="5.6843348e-14" />  </g></svg>'
        let rectangle2 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg   width="100%"   height="100%"   viewBox="0 0 26.458333 79.375002"   id="svg16" >  <g     id="layer1"     transform="translate(0,-217.62498)">    <rect       style="fill:none;stroke:#04d5e2;stroke-width:4"       id="rect3732"       width="25.324404"       height="78.241081"       x="0.66145831"       y="218.09744"       ry="5.6843419e-14" />    <rect       style="fill:#04d5e2;stroke:#04d5e2;stroke-width:0.26458332"       id="rect8"       width="17.105249"       height="43.564945"       x="4.6472802"       y="249.06947"       ry="5.6843348e-14" />  </g></svg>' 
        let alarmVol0 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg   width="100%"   height="100%"   viewBox="0 0 26.458332 13.229167"   id="svg8">  <g     id="layer1"     transform="translate(0,-283.77082)">    <path       style="fill:none;stroke:#FFFFFF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="M 0.42522322,296.62201 H 25.749628 v -12.33147 z"       id="path12"/>  </g></svg>'
        let alarmVol1 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg   width="100%"   height="100%"   viewBox="0 0 26.458332 13.229167"   id="svg8">  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(0,-283.77082)">    <path       style="fill:none;stroke:#FFFFFF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="M 0.42522322,296.62201 H 25.749628 v -12.33147 z"       id="path12"       inkscape:connector-curvature="0" />    <path       style="fill:none;stroke:#FFFFFF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 9.4966516,292.27528 c 0,4.20499 0.047247,4.39398 0.047247,4.39398 z"       id="path33"       inkscape:connector-curvature="0" />    <path       style="fill:#cccccc;stroke:#ffffff;stroke-width:2px"       d="m 6.228187,46.993884 c 1.0803571,-0.540989 8.03125,-3.936161 15.446429,-7.544828 l 13.482142,-6.561213 0.109025,4.38556 c 0.05996,2.412057 0.120231,5.811898 0.133929,7.555202 l 0.0249,3.169643 -15.580358,-0.01037 -15.5803567,-0.01038 1.9642857,-0.983615 z"       id="path4637"       inkscape:connector-curvature="0"       transform="matrix(0.26458333,0,0,0.26458333,0,283.77082)" />  </g></svg>'
        let alarmVol2 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg   width="100%"   height="100%"   viewBox="0 0 26.458332 13.229167"   id="svg8">  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(0,-283.77082)">    <path       style="fill:none;stroke:#FFFFFF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="M 0.42522322,296.62201 H 25.749628 v -12.33147 z"       id="path12"       inkscape:connector-curvature="0" />    <path       style="fill:none;stroke:#FFFFFF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 9.4966516,292.27528 c 0,4.20499 0.047247,4.39398 0.047247,4.39398 z"       id="path33"       inkscape:connector-curvature="0" />    <path       style="fill:none;stroke:#FFFFFF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 15.827753,289.15698 v 7.37054 z"       id="path54"       inkscape:connector-curvature="0" />    <path       style="fill:#cccccc;stroke:#FFFFFF;stroke-width:2px"       d="m 6.228187,46.993884 c 1.0803571,-0.540989 8.03125,-3.936161 15.446429,-7.544828 l 13.482142,-6.561213 0.109025,4.38556 c 0.05996,2.412057 0.120231,5.811898 0.133929,7.555202 l 0.0249,3.169643 -15.580358,-0.01037 -15.5803567,-0.01038 1.9642857,-0.983615 z"       id="path4624"       inkscape:connector-curvature="0"       transform="matrix(0.26458333,0,0,0.26458333,0,283.77082)" />    <path       style="fill:#cccccc;stroke:#FFFFFF;stroke-width:2px"       d="m 36.592602,42.417891 c -0.06773,-3.069197 -0.09708,-6.622013 -0.06521,-7.895148 l 0.05794,-2.31479 9.821428,-4.795051 c 5.401786,-2.637278 10.484375,-5.106035 11.294643,-5.486126 l 1.473215,-0.691075 V 34.616974 47.998248 H 47.945184 36.715753 Z"       id="path4626"       inkscape:connector-curvature="0"       transform="matrix(0.26458333,0,0,0.26458333,0,283.77082)" />  </g></svg>'        
        let alarmVol3 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg   width="100%"   height="100%"   viewBox="0 0 26.458332 13.229167" >  <g     id="layer1"     transform="translate(0,-283.77082)">    <path       style="fill:none;stroke:#FFFFFF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="M 0.42522322,296.62201 H 25.749628 v -12.33147 z"       id="path12"       />    <path       style="fill:none;stroke:#FFFFFF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 9.4966516,292.27528 c 0,4.20499 0.047247,4.39398 0.047247,4.39398 z"       id="path33"       />    <path       style="fill:none;stroke:#FFFFFF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 15.827753,289.15698 v 7.37054 z"       id="path54"       />    <path       style="fill:#b3b3b3;stroke:#FFFFFF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 20.930431,286.55839 v 9.96913 z"       id="path75"       />    <path       style="fill:#e6e6e6;stroke:#ffffff;stroke-width:0.17857143"       d="M 4.4229713,47.904654 C 4.5245611,47.803064 35.179145,32.851951 35.213164,32.887401 c 0.01138,0.01186 0.06525,3.41665 0.119706,7.566204 l 0.09902,7.544642 H 19.880632 c -8.55319,0 -15.5091371,-0.04212 -15.4576607,-0.09359 z"       id="path4608"       transform="matrix(0.26458333,0,0,0.26458333,0,283.77082)" />    <path       style="fill:#e6e6e6;stroke:#ffffff;stroke-width:0.17857143"       d="m 36.648901,46.257176 c -0.06341,-0.957589 -0.113809,-4.513393 -0.111993,-7.901786 l 0.0033,-6.160714 10.452986,-5.089286 c 5.749142,-2.799107 10.84992,-5.268522 11.335059,-5.48759 L 59.21033,21.219496 V 34.608871 47.998247 H 47.987263 36.764196 Z"       id="path4610"       transform="matrix(0.26458333,0,0,0.26458333,0,283.77082)" />    <path       style="fill:#e6e6e6;stroke:#ffffff;stroke-width:0.17857143"       d="M 60.46033,34.283378 V 20.568506 l 9.017857,-4.393376 9.017858,-4.393376 V 29.890001 47.998247 H 69.478187 60.46033 Z"       id="path4612"       transform="matrix(0.26458333,0,0,0.26458333,0,283.77082)" />  </g></svg>'
        let alarmVol4 = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg   width="100%"   height="100%"   viewBox="0 0 26.458332 13.229167"   id="svg8">  <g     id="layer1"     transform="translate(0,-283.77082)">    <path       style="fill:none;stroke:#FFFFFF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="M 0.42522322,296.62201 H 25.749628 v -12.33147 z"       id="path12"       inkscape:connector-curvature="0" />    <path       style="fill:none;stroke:#FFFFFF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 9.4966516,292.27528 c 0,4.20499 0.047247,4.39398 0.047247,4.39398 z"       id="path33"       inkscape:connector-curvature="0" />    <path       style="fill:none;stroke:#FFFFFF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 15.827753,289.15698 v 7.37054 z"       id="path54"       inkscape:connector-curvature="0" />    <path       style="fill:#b3b3b3;stroke:#FFFFFF;stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"       d="m 20.930431,286.55839 v 9.96913 z"       id="path75"       inkscape:connector-curvature="0" />    <path       style="fill:#e6e6e6;stroke:#ffffff;stroke-width:0.17857143"       d="M 4.4229713,47.904654 C 4.5245611,47.803064 35.179145,32.851951 35.213164,32.887401 c 0.01138,0.01186 0.06525,3.41665 0.119706,7.566204 l 0.09902,7.544642 H 19.880632 c -8.55319,0 -15.5091371,-0.04212 -15.4576607,-0.09359 z"       id="path4608"       inkscape:connector-curvature="0"       transform="matrix(0.26458333,0,0,0.26458333,0,283.77082)" />    <path       style="fill:#e6e6e6;stroke:#ffffff;stroke-width:0.17857143"       d="m 36.648901,46.257176 c -0.06341,-0.957589 -0.113809,-4.513393 -0.111993,-7.901786 l 0.0033,-6.160714 10.452986,-5.089286 c 5.749142,-2.799107 10.84992,-5.268522 11.335059,-5.48759 L 59.21033,21.219496 V 34.608871 47.998247 H 47.987263 36.764196 Z"       id="path4610"       inkscape:connector-curvature="0"       transform="matrix(0.26458333,0,0,0.26458333,0,283.77082)" />    <path       style="fill:#e6e6e6;stroke:#ffffff;stroke-width:0.17857143"       d="M 60.46033,34.283378 V 20.568506 l 9.017857,-4.393376 9.017858,-4.393376 V 29.890001 47.998247 H 69.478187 60.46033 Z"       id="path4612"       inkscape:connector-curvature="0"       transform="matrix(0.26458333,0,0,0.26458333,0,283.77082)" />    <path       style="fill:#e6e6e6;stroke:#ffffff;stroke-width:0.17857143"       d="m 79.789853,29.567242 0.04548,-18.431004 8.303572,-4.0570687 c 4.566964,-2.2313879 8.363839,-4.0624357 8.4375,-4.0689954 0.07366,-0.00656 0.133928,10.1130731 0.133928,22.4880731 v 22.5 h -8.482977 -8.482977 z"       id="path4614"       inkscape:connector-curvature="0"       transform="matrix(0.26458333,0,0,0.26458333,0,283.77082)" />  </g></svg>'
        
        let contador = 0;
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

        /* ncDevice.addListener("update", parseNCUpdate);
        ncDevice.addListener("control", parseNCControl);
        ncDevice.addListener("error", errorMessage);
        ncDevice.addListener("notify", notifyMessage);
        ncDevice.addListener("connected", onConnect);
        ncDevice.addListener("disconnected", onDisconnect);
 */

        var d3 = require("d3/d3");
        var serverLogs = [], maxLogSize = 40;

        var client = PVSioWebClient.getInstance();

        // FIXME: create a library with APIs to create SAPERE control panels
       /*  var content = d3.select("#content").append("div").style("width", "600px").style("padding", "20px").style("display", "none");
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
        }); */


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

        mx550.btnAlarmOff = new ButtonEVO("btn_alarm_off", {
            top: 250, left: 990, height: 20, width: 20
          }, {
            /* callback: function (err, data) {
                mx550.pulseAlarm.toggle()
                if(alarmsOn){
                    mx550.alarmsoff_display.reveal()
                    mx550.alarmsoff_img.reveal()
                    alarmsOn = false
                }else{
                    mx550.alarmsoff_display.hide()
                    mx550.alarmsoff_img.hide()
                    alarmsOn = true
                }
                
            } */
            callback: onMessageReceived
          });

          mx550.btnOnOff = new ButtonEVO("btn_on_off", {
            top: 935, left: 316, height: 46, width: 46
          }, {
              //backgroundColor: 'red',
            callback: onMessageReceived
          });

        // WAVES
        mx550.ecgII_wave = new Wave('ecgii-wave',
            {top: 210, left: 115, height: 70, width: 730},
            { 
                waveType: 'ecg',
                title: 'II',
                parent: 'prototype', 
                heartRate: 90,
                waveColor: "#00FF00",
                background: "#000000",
                scanBarWidth:20,
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
                 heartRate: 120,
                 waveColor: "#00FF00",
                 background: "#000000",
                 scanBarWidth:20,
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
                  heartRate: 75,
                  waveColor: "#0FF0FF",
                  background: "#000000",
                  scanBarWidth:20,
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
                 heartRate: 75,
                 waveColor: "#E33632",
                 background: "#000000",
                 scanBarWidth:20,
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
                  heartRate: 75,
                  waveColor: "#FAE15C",
                  background: "#000000",
                  scanBarWidth:20,
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
                   heartRate: 75,
                   waveColor: "#41DAF9",
                   background: "#000000",
                   scanBarWidth:20,
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
                    heartRate: 75,
                    waveColor: "#E827F4",
                    background: "#000000",
                    scanBarWidth:20,
                    pvsDefinition: {
                        waveColor: 'icp_wave_color',
                        backgroundColor: 'icp_wave_back_color',
                        heartRate: 'breath_rate'
                    }
                 })


               
        mx550.co2_wave = new Wave(
            'co2-wave',
            { top: 610, left: 115, height:50, width: 730 },
            { 
                waveType: 'co2', 
                parent: 'prototype',
                heartRate: 75 ,
                waveColor: '#FFFFFF',
                background: '#000000',
                filled: 'down',
                fillColor: '#999a9b',
                scanBarWidth:20,
                pvsDefinition: {
                    waveColor: 'co2_wave_color',
                    backgroundColor: 'co2_wave_back_color',
                    heartRate: 'breath_rate',
                    fillColor: 'co2_fill_color'
                }
            }
        )


        // DISPLAYs
        mx550.date_display = new BasicDisplayEVO('date-display', 
            {top: 203, left: 670, width: 200, height: 17},
            {
                fontColor: "#FFFFFF",
                backgroundColor: 'none',
                visibleWhen: "true",
                align: 'left',
                fontSize: 8,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontWeight: 'bold'
            }
        )
        mx550.alarmsoff_display = new BasicDisplayEVO('alarmsoff-display', 
            {top: 223, left: 930, width: 200, height: 17},
            {
                fontColor: "#FF0000",
                backgroundColor: '#FFFFFF',
                visibleWhen: "true",
                align: 'left',
                fontSize: 14,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontWeight: 'bold'
            }
        )
        mx550.alarmsoff_img = new BasicDisplayEVO('alarmsoff-img', 
            {top: 222, left: 910, width: 20, height: 17},
            {
                fontColor: "#FF0000",
                backgroundColor: '#FFFFFF',
                visibleWhen: "true",
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
                visibleWhen: 'true',
                /* title: 'HR',
                type: 'Integer',
                valueMin: '50',
                valueMax: '120',
                value: '76' */
                pvsValue:'pulse', 
                pvsMinValue: 'hr_min', 
                pvsMaxValue:'hr_max', 
                pvsTitle:'hr_label'
            }
        )
        mx550.pulse_display = new BasicDisplayEVO('pulse-display', 
            {top: 245, left: 1030, width: 50, height: 50},
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
            {top: 336, left: 860, width: 100, height: 50},
            {
                parent: 'prototype',
                fontColor: '#0FF0FF',
                fontSize: 24,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: 'true',
                /* title: 'SpO2',
                type: 'Integer',
                valueMin: '96',
                valueMax: '100',
                value: '95', */
                pvsValue:'spo2', 
                pvsMinValue: 'spo2_min', 
                pvsMaxValue:'spo2_max', 
                pvsTitle:'spo2_label'
            }
        )
        
        mx550.perf_display = new BasicDisplayEVO('perf-display', 
            {top: 360, left: 1030, width: 70, height: 50},
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
            {top: 660, left: 860, width: 100, height: 60},
            {
                parent: 'prototype',
                fontColor: '#00FF00',
                fontSize: 35,
                fontFamily: 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif',
                backgroundColor: 'none',
                visibleWhen: 'true',
                //title: 'Tcore',
                // type: 'Float', // I need to change it because i don't know how to pass float on PVS state
                type: 'String',
                //valueMin: '36.0',
                //valueMax: '39.0',
                //value: '37.0',
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
                visibleWhen: 'true',
                // title: 'Tskin',
                type: 'String',
                //valueMin: '36.0',
                //valueMax: '39.0',
                //value: '37.0',
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
                visibleWhen: 'true',
                /* title: 'NBP', */
                type: 'String',
                //valueMin: '90',
                //valueMax: '160',
                //value: '123/79 (89)'
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
                visibleWhen: 'true',
                /* title: 'ABP',
                subtitle: 'Sys.',
                type: 'String',
                valueMin: '90',
                valueMax: '160',
                value: '120/70 (91)', */
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
                visibleWhen: 'true',
                /* title: 'PAP',
                subtitle: 'Dia.',
                type: 'String',
                valueMin: '0',
                valueMax: '16',
                value: '28/15 (21)', */
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
                visibleWhen: 'true',
                /* title: 'CVP',
                subtitle: 'Mean', */
                type: 'Integer',
                bracket: 'parenthesis',
                /* valueMin: '0',
                valueMax: '10',
                value: '9', */
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
                visibleWhen: 'true',
                /* title: 'ICP',
                subtitle: 'Mean', */
                type: 'Integer',
                bracket: 'parenthesis',
                /* valueMin: '0',
                valueMax: '10',
                value: '9', */
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
                visibleWhen: 'true',
                /* title: 'ICP', */
                type: 'Integer',
                /* valueMin: '50',
                valueMax: '130',
                value: '82', */
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
                visibleWhen: 'true',
                /* title: 'etCO2', */
                type: 'Integer',
                /* valueMin: '30',
                valueMax: '50',
                value: '28', */
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
                visibleWhen: 'true',
                /* title: 'awRR', */
                type: 'Integer',
                /* valueMin: '8',
                valueMax: '30',
                value: '17', */
                pvsValue: 'awrr',
                pvsTitle: 'awrr_label',
                pvsMinValue: 'awrr_min',
                pvsMaxValue: 'awrr_max'
            }
        )

        mx550.spo2_graphics = new ImageRender(
            'spo2_graphics',
            {top: 370, left: 860, width: 20, height: 20},
            {
                parent: 'prototype',
            }
        )

        mx550.spo2_rec = new ImageRender(
            'spo2_rectangle',
            {top: 330, left: 995, width: 10, height: 70},
            {
                parent: 'prototype',
            }
        )

        mx550.alarmVol = new ImageRender(
            'wifi',
            {top: 205, left: 1090, width: 30, height:15},
            {
                parent: 'prototype'
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

        // LEDs
        mx550.onoff_led = new LED("onoff_led", {
            top: 930,
            left: 380,
            width: 17,
            height: 17
        },{
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

        // led and onOff button
        function render_onoff(res){
            // onOff button is allways rendered
            mx550.btnOnOff.render(res)
            // led will display different color based on state
            if(res.isOn === 'TRUE'){
                mx550.onoff_led.render(res, {color: "#b0ff77"}) /* bright green */
            }else{
                mx550.onoff_led.render(res, {color: 'grey'})
            }
        }

        // alarm
        function render_alarms(res){
            if(res.isOn === 'TRUE'){
                mx550.pulseAlarm.render(res)
                // mx550.pulseAlarm.play()
                mx550.btnAlarmOff.render();
                mx550.alarmsoff_display.render('ALARMS OFF')
                mx550.alarmsoff_img.renderGlyphicon('glyphicon-bell',{'blinking':false});
                /* toggle the images on and off */
                //if(alarmsOn){
                if(res.isAlarmOn === 'TRUE'){
                    mx550.alarmsoff_display.hide()
                    mx550.alarmsoff_img.hide()
                }else{
                    //mx550.pulseAlarm.mute()
                    mx550.pulseAlarm.stop()
                }
            }else{
                mx550.pulseAlarm.stop()
                mx550.pulseAlarm.hide()
                //mx550.pulseAlarm.hide()
                mx550.btnAlarmOff.hide()
                mx550.alarmsoff_display.hide()
                mx550.alarmsoff_img.hide()
            }
            
        }
        function hide_alarms(res){
            mx550.pulseAlarm.hide()
            mx550.btnAlarmOff.hide()
            mx550.alarmsoff_display.hide()
            mx550.alarmsoff_img.hide()
        }

        // waves
        function render_waves(res){
            if(res.isOn === 'TRUE'){
                mx550.ecgII_wave.render(res)
                mx550.ecgV_wave.render(res)
                mx550.spo2_wave.render(res)
                mx550.co2_wave.render(res)
                mx550.abp_wave.render(res)
                mx550.pap_wave.render(res)
                mx550.cvp_wave.render(res)
                mx550.icp_wave.render(res)
            }else{
                mx550.ecgII_wave.hide({resetWave:true})
                mx550.ecgV_wave.hide({resetWave:true})
                mx550.spo2_wave.hide({resetWave:true})
                mx550.co2_wave.hide({resetWave:true})
                mx550.abp_wave.hide({resetWave:true})
                mx550.pap_wave.hide({resetWave:true})
                mx550.cvp_wave.hide({resetWave:true})
                mx550.icp_wave.hide({resetWave:true})
            }
            
        }

        function render_plugs(res){
            mx550.spo2_plug.render(res)
            mx550.ecg_plug.render(res)
        }

        function render_displays(res){
            if(res.isOn === 'TRUE'){
                mx550.hr_display.render(res)
                mx550.pulse_display.render(res.pulse)
                mx550.spo2_display.render(res)
                mx550.perf_display.render(res.perf.toString().replace(/"/g, ""))
                mx550.etco2_display.render(res)
                mx550.awRR_display.render(res)
                mx550.tCore_display.render(res)
                mx550.tSkin_display.render(res)
                mx550.nbp_display.render(res)
                mx550.abp_display.render(res)
                mx550.pap_display.render(res)
                mx550.cvp_display.render(res)
                mx550.icp_display.render(res)
                mx550.cpp_display.render(res)
                mx550.spo2_graphics.render(res)
                mx550.spo2_rec.render(res)
                mx550.alarmVol.render(res)
                //mx550.onoff_led.render(res)
                let today = new Date()
                mx550.date_display.render(today.toLocaleDateString('en-GB', {year: 'numeric', month: 'short', day: 'numeric', hour: "2-digit", minute: "2-digit"  }))

            }else{
                mx550.hr_display.hide()
                mx550.pulse_display.hide()
                mx550.spo2_display.hide()
                mx550.perf_display.hide()
                mx550.etco2_display.hide()
                mx550.awRR_display.hide()
                mx550.tCore_display.hide()
                mx550.tSkin_display.hide()
                mx550.nbp_display.hide()
                mx550.abp_display.hide()
                mx550.pap_display.hide()
                mx550.cvp_display.hide()
                mx550.icp_display.hide()
                mx550.cpp_display.hide()
                mx550.spo2_graphics.hide()
                mx550.spo2_rec.hide()
                mx550.alarmVol.hide()
                //mx550.onoff_led.render(res)
                let today = new Date()
                mx550.date_display.hide(today.toLocaleDateString('en-GB', {year: 'numeric', month: 'short', day: 'numeric', hour: "2-digit", minute: "2-digit"  }))

            }
                        /* this is here just to simulate animation of the imagerender widget */
            /* setInterval(function() {
                // method to be executed;
              
                    switch(contador % 9){
                        case 0: 
                                mx550.spo2_graphics.setImage(triangle0)
                                mx550.spo2_rec.setImage(rectangle0)
                                mx550.alarmVol.setImage(alarmVol0)
                        break
                        case 1: 
                                mx550.spo2_graphics.setImage(triangle1)
                                mx550.spo2_rec.setImage(rectangle0)
                                mx550.alarmVol.setImage(alarmVol1)
                                break
                        case 2: 
                                mx550.spo2_graphics.setImage(triangle2)
                                mx550.spo2_rec.setImage(rectangle1)
                                mx550.alarmVol.setImage(alarmVol2)
                                break
                        case 3: 
                                mx550.spo2_graphics.setImage(triangle3)
                                mx550.spo2_rec.setImage(rectangle1)
                                mx550.alarmVol.setImage(alarmVol3)
                        break
                        case 4: 
                                mx550.spo2_graphics.setImage(triangle4)
                                mx550.spo2_rec.setImage(rectangle2)
                                mx550.alarmVol.setImage(alarmVol4)
                                break
                        case 5: 
                                mx550.spo2_graphics.setImage(triangle5)
                                mx550.spo2_rec.setImage(rectangle2)
                                mx550.alarmVol.setImage(alarmVol4)
                                break
                        case 6: 
                                mx550.spo2_graphics.setImage(triangle6)
                                mx550.spo2_rec.setImage(rectangle1)
                                mx550.alarmVol.setImage(alarmVol3)
                                break
                        case 7: 
                                mx550.spo2_graphics.setImage(triangle7)
                                mx550.spo2_rec.setImage(rectangle1)
                                mx550.alarmVol.setImage(alarmVol2)
                                break
                        case 8: 
                                mx550.spo2_graphics.setImage(triangle8)
                                mx550.spo2_rec.setImage(rectangle0)
                                mx550.alarmVol.setImage(alarmVol1)
                                break
                    }

                    contador += 1
                }, 1000); */
        }

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
                // console.log(`STATE: ${res}`)
                if (res.indexOf("(#") === 0) {
                    res = stateParser.parse(event.data.toString());
                    if (res) {
                        console.log(`Vou renderizar`)
                        render_onoff(res)
                        render_waves(res)
                        render_displays(res)
                        render_alarms(res)
                        render_plugs(res)
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
