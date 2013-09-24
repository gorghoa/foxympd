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

    'routers/mpdconnections',
    'routers/playlists',

    'views/home',
    'views/menu',
    'views/mpddebug',
    'views/about',
    'views/settings'

],function($,_,Backbone, mpdconnectionsRouter,playlistsRouter,homeView,menuView,mpddebugView,aboutView,settingsView) {


    var AppRouter = Backbone.Router.extend({
        routes: {
            "": "home",
            "menu": "menu",
            "mpddebug": "mpddebug",
            "about": "about",
            "settings":"settings"
        }
    });

    var initialize=function(app_router) {

        var appManager=app_router.appManager,view;

        app_router.on("route:home", function (path) {
				  view = new homeView();
                  appManager.showView(view);
        });

        app_router.on("route:menu", function (path) {
				  view = new menuView();
                  appManager.showView(view);
        });
        app_router.on("route:mpddebug", function (path) {
				  view = new mpddebugView();
                  appManager.showView(view);
        });
        app_router.on("route:about", function (path) {
				  view = new aboutView();
                  appManager.showView(view);
        });
        app_router.on("route:settings", function (path) {
				  view = new settingsView();
                  appManager.showView(view);
        });


        Backbone.history.start();

        mpdr = new mpdconnectionsRouter('connections');
        playr = new playlistsRouter('playlists');

        mpdr.appManager=appManager;
        playr.appManager=appManager;
        
	};
	
	
    return {
        initialize:initialize,
        AppRouter:AppRouter
    };
});
