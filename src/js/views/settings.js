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

    'tpl!templates/settings'

],function($,_,Backbone,app,tpl) {


    var view = Backbone.View.extend({

        initialize : function() {
            this.model=app.registry.settings;
        },
        render: function() {

            this.$el.html(tpl({model:this.model}));

            this.$el.find('#no-lock').attr('checked',(this.model.get('noLock')===true)?true:false);
            this.$el.find('#show-covers').attr('checked',(this.model.get('showCovers')===true)?true:false);

        },
        events:{
            "submit form":'send'
        },
        'send':function(e) {

            var msn=$('[role=messenger]');
            var noLock = (this.$el.find('#no-lock').attr('checked')==='checked')?true:false;
            var showCovers = (this.$el.find('#show-covers').attr('checked')==='checked')?true:false;

            this.model.set('noLock',noLock);
            this.model.set('showCovers',showCovers);


            msn.text('saving…');
            var res =this.model.save();

            res.done(function() {
                setTimeout(function() {
                    msn.text('reloading…');
                    setTimeout(function() {
                        document.location='/index.html'; //rechargement de l’application
                    },500);
                },200);
            });


            return false;
        }
    });

    return view;
});


