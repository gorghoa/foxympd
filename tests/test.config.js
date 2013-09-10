require.config({

    paths:{
    jquery: '../src/js/libs/jquery/jquery-min',
    underscore: '../src/js/libs/underscore/underscore-min', // https://github.com/amdjs
    backbone: '../src/js/libs/backbone/backbone', // https://github.com/amdjs
    "backbone.subroute": "../src/js/libs/backbone/backbone.subroute",
    "backbone.indexeddb": "../src/js/libs/backbone/backbone.indexeddb",
    "backbone.mpd": "../src/js/libs/backbone/backbone.mpd",
    "timetools":"../src/js/libs/timetools",


    //auth backends
    browserid:"https://browserid.org/include",

    mocha:"vendor/mocha",
    sinon:"vendor/sinon",
    chai:"vendor/chai",

    foxy:"../src/js",

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
    browserid: {
        exports:'navigator'
    },
    "backbone.subroute": ['backbone'] ,
    "backbone.indexeddb": ['backbone'] 

  }
});

require([
    'mpd',

    //User Interface stuffs
    'ui/mpdconnections'

], function() {
  if (window.mochaPhantomJS) { mochaPhantomJS.run(); }
  else { mocha.run(); }
});

