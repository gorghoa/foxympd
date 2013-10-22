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
  base_url: '/js',
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
    templates: '../templates',

    //plugins
    text:'libs/require/text',
    tpl:'libs/require/tpl'
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

  },



  tpl:  {
    extension: '.tpl'
  }

});

require([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'views/controls',
    'views/header',
    'views/networkstatus',
    'router',
    'appmanager'
],function($,_,Backbone,App, ControlsView, HeaderView,NetworkstatusView,Router,AppManager) {



            var promise = App.initialize();


            promise.always(function() {

                App.headerView = new  HeaderView();
                App.headerView.render();

                App.toolbarView = new ControlsView();
                App.toolbarView.render();

                App.networkstatusView = new NetworkstatusView();
                App.networkstatusView.render();

                //            App.beginRouting();
                App.registry.app_router= new Router.AppRouter();
                App.registry.app_router.appManager=new AppManager();


                Router.initialize(App.registry.app_router);

            });

});
