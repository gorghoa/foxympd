require.config({
  paths: {
    // Major libraries
    jquery: '../js/libs/jquery/jquery-min',
    underscore: '../js/libs/underscore/underscore-min', // https://github.com/amdjs
    backbone: '../js/libs/backbone/backbone', // https://github.com/amdjs
    "backbone.subroute": "../js/libs/backbone/backbone.subroute",
    "backbone.indexeddb": "../js/libs/backbone/backbone.indexeddb",
    "backbone.mpd": "../js/libs/backbone/backbone.mpd",
    "timetools":"../js/libs/timetools",


    //auth backends
    browserid:"https://browserid.org/include",

    foxy:"../js",

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
  'testMPD',
  'testTimeTools'
], function() {
});

