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

    'tpl!templates/error'

],function($,_,Backbone,app,tpl) {

    var view = Backbone.View.extend({

        render: function() {
            var done = $('<a href="#" role="button">home</a>');
            app.headerView.setActionButtons([done]);
            this.$el.html(_.template(tpl,{model:this.model}));
            app.headerView.setTitle('Error Occured');
            console.error(this.model.get('raw_exception'));
        }
    });


    return view;


});


