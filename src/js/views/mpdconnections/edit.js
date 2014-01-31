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

    'timetools',

    'app',

    'models/mpdconnection',

    'tpl!templates/mpdconnections/info',
    'tpl!templates/mpdconnections/edit'


],function($,_,Backbone,timetools,app,MPDConnectionModel,tplInfo,tplEdit) {


    var view = Backbone.View.extend({

        update:false,
        initialize: function() {
            if(!this.model) {
                this.model = new MPDConnectionModel();
                this.update = true;
            }
        },

        close: function() {

            $('div[role=toolbar]').show();
            $('section[role=network-status]').show();

        },

        render: function() {

            $('div[role=toolbar]').hide();
            $('section[role=network-status]').hide();
            var self=this;


            console.log(this.model.attributes);
            var data={model:this.model,update:this.update};

            var done;
            if (this.update) {
                done = $('<a id="done" class="lsf">ok</a>');
                done.click(function() {self.save();});
                app.headerView.setActionButtons([done]);
                this.$el.html(tplEdit(data));
                return;
            } 


            done = $('<a id="done" class="lsf" >edit</a>');
            done.click(function() {
                self.update=true;
                self.render();
            });

            app.headerView.setActionButtons([done]);

            var date = new Date();
            data.timetools = timetools;

            /*timetools.run_tests();*/
            data.lasttimewas = date.getTime() - this.model.get('last_connection');
            this.$el.html(tplInfo(data));

        },
        events:{
            "click a[role=button].delete":'destroy_connection',
            "click button[role=connect]":'connect',
            "change #host":'update_url',
            "change #http_stream_active":'active_url'
        },
        update_url:function(e) {
            this.$el.find('#http_stream_url').val('http://'+$(e.target).val()+':8000/mpd.ogg');
        },
        active_url:function(e) {
            var t = e.target;
            if(t.checked) {
                this.$el.find('#http_stream_url').attr('readonly','readonly');
            } else {
                this.$el.find('#http_stream_url').removeAttr('readonly','readonly');
            }
        },
        'destroy_connection':function() {
            if(confirm('are you sure you want to delete connection?')) {
                console.log('destroy');
                this.model.destroy();
                app.registry.app_router.navigate('connections',{trigger:true});
            }
        },
        'connect':function() {
            console.log('connecting with',this.model.get('host'));
            app.mpdconnect(this.model);
            $('[role=toolbar]').show();
            app.registry.app_router.navigate('/',{trigger:true});
        },
        'save':function() {
            console.log('saving');
            this.model.set('name',this.$el.find('input[name=name]').val());
            this.model.set('host',this.$el.find('input[name=host]').val());
            this.model.set('port',this.$el.find('input[name=port]').val());
            this.model.set('password',this.$el.find('input[name=password]').val());

            $http_stream_checkbox = this.$el.find('input[name=http_stream_active]');
            

            var value = ($http_stream_checkbox.attr('checked'))?true:false;
            console.log('WTFTFTFT',$http_stream_checkbox.attr('checked'),value);
            
            this.model.set('http_stream_active',value);
            var stream_url = this.$el.find('input[name=http_stream_url]').val() || null;
            this.model.set('http_stream_url',stream_url);

            console.log(this.model.attributes);
            this.model.save();
            console.log(this.model.attributes);
            
            app.mpdconnect(this.model);
            $('[role=toolbar]').show();
            app.registry.app_router.navigate('/',{trigger:true});
        }
    });

    return view;
});
