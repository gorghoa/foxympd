/*
    © barosofts, César & Rodrigue Villetard, 2013

    This file is part of FoxyMPD.

    FoxyMPD is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    FoxyMPD is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with FoxyMPD.  If not, see <http://www.gnu.org/licenses/>.
*/
"use strict";

require.config({
  paths: {
    // Major libraries
    jquery: 'libs/jquery/jquery-min',
    underscore: 'libs/underscore/underscore-min', // https://github.com/amdjs
    backbone: 'libs/backbone/backbone', // https://github.com/amdjs
    "backbone.subroute": "libs/backbone/backbone.subroute",
    "backbone.indexeddb": "libs/backbone/backbone.indexeddb",
    "backbone.mpd": "libs/backbone/backbone.mpd",
    "timetools":"libs/timetools",


    //auth backends
    browserid:"https://browserid.org/include",

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
    'jquery',
    'underscore',
    'backbone',
    'app',
    'views/controls',
    'views/header'
],function($,_,Backbone,App, ControlsView, HeaderView) {



        App.initialize();

        App.headerView = new  HeaderView();
        App.headerView.render();

        App.toolbarView = new ControlsView();
        App.toolbarView.render();

        App.beginRouting();

        window.addEventListener('home',function(e) {
            console.log('home !');
        });

        window.addEventListener('volumedown',function(e) {
            console.log('volume down !');
        });
        window.addEventListener('volumeup',function(e) {
            console.log('volume up !');
        });

});
