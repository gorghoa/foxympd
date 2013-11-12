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

    'app',

    'tpl!templates/playlist/song_detail'

],function($,_,Backbone,app,tplData) {


    var view = Backbone.View.extend({

        el : '<li role="artist" class="list" >anuriset</li>',
        initialize:function() {
           this.$el.attr('data-id',this.model.cid);
           this.$el.attr('data-file',this.model.get('file'));
        },

        
        render:function() {
           this.$el.html(tplData({item:this.model}));
        },

        events : {
            "click":'select'
        },
        'select':function(e) {
            var target = $(e.currentTarget);
            $(target).toggleClass('selected');
        }


    });

    return view;

});

