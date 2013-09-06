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

    'app'
],function($,_,Backbone,app) {


    var view = Backbone.View.extend({

        render: function() {
            var name = prompt('Playlist name');
            var prom = app.registry.mpd.savePlaylist(name);
            prom.done(function() {
                alert('Your playlist has been saved');
                app.registry.app_router.navigate('',{trigger:true});
            });

            return false;
        }

    });
    return view;
});

