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
define([
    'jquery',
    'underscore',
    'backbone',

    //plugins
    'backbone.subroute',

    'views/playlists/build',
    'views/playlists/save',
    'views/mpdconnections/list'

], function($,_,Backbone,buildView,saveView,listView) {

    var view;

    var router = Backbone.SubRoute.extend({

        appManager:null,        

        routes: {

            "": "list", 
            "build": "build",
            "save": "save"
        },

        build : function() {
            var self=this;
            view = new buildView();
            self.appManager.showView(view);
        },

        save : function() {
            var self=this;
            view = new saveView();
            self.appManager.showView(view);
        },

        list : function() {
            var self=this;
            view = new listView();
            self.appManager.showView(view);
        }

    });


    return router;


});


