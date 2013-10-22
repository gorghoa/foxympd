require.config({

    baseUrl:"../src/js",
    paths:{
    jquery: 'libs/jquery/jquery-min',
    underscore: 'libs/underscore/underscore-min', // https://github.com/amdjs
    backbone: 'libs/backbone/backbone', // https://github.com/amdjs
    "backbone.subroute": "libs/backbone/backbone.subroute",
    "backbone.indexeddb": "libs/backbone/backbone.indexeddb",
    "backbone.mpd": "libs/backbone/backbone.mpd",
    "timetools":"libs/timetools",

    dbs:"./dbs",

    tests:"../../tests",

    //plugins
    text:'libs/require/text',
    tpl:'libs/require/tpl',


    mocha:"../../tests/vendor/mocha",
    chai:"../../tests/vendor/chai",

    //templates
    templates: '../templates'
  },

  shim: {
    backbone: {
        deps:['jquery','underscore'],
        exports:'Backbone'
    },
    underscore : {
        exports:'_'
    },
    jquery : {
        exports:'jQuery'
    },
    "backbone.subroute": ['backbone'],
    "backbone.indexeddb": ['backbone'],
  },
    tpl:  {
      extension: '.tpl'
    }
});

require([

    'tests/mpd/mpd',
    'tests/mpd/backbone',

    //User Interface stuffs
    'tests/views/networkstatus'

], function() {

  if (window.mochaPhantomJS) { mochaPhantomJS.run(); }
  else { mocha.run(); }
});

