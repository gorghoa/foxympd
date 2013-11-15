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

    'tpl!templates/toolbar_ctl'

],function($,_,Backbone,app,tpl) {


try{
    var controlsView = Backbone.View.extend({

        el : 'div[role=toolbar]',
        initialize:function() {

            var self=this;
            app.registry.mpd.on('player_changed',function(){
                    self.updateToolbar();
            });
            app.registry.mpd.on('open',function(){
                    try{

                        var stream_url = (app.registry.current_connection.get('http_stream_active') && app.registry.current_connection.get('http_stream_url'))?app.registry.current_connection.get('http_stream_url'):null;
                        self.render();
                    } catch(e) {
                        console.log(e.message,e.fileName,e.lineNumber);
                    }
                    self.updateToolbar();
            });
        },
        render: function(http_stream_url) {
            var http_stream_url = http_stream_url || null;
            var data={http_stream_url:http_stream_url};

            this.$el.html(tpl(data));
        },
        events : {
            "click .control[role=mpd-control]":"mpd_action"
        },

        updateToolbar:function() {
            var self=this;
            var txt=(app.registry.mpd.statusdata.state==="play")?"pause":"playmedia";
            this.$el.find("button[role=mpd-control][data-action=playpause]").text(txt);
            this.$el.find("button[role=mpd-control][data-action=stream]").attr('disabled',false);
            
        },

        mpd_action:function(e) {
            var action = e.target.getAttribute('data-action');
            var mpd=app.registry.mpd;

            switch (action) {

                case "shuffle":
                    mpd.shuffle();
                    break;

                case 'playpause':
                    mpd.togglePlayPause();
                    break;

                case 'stream':
                    var audio =  this.$el.find('#http_stream_player')[0];
                    console.log('ok',audio.paused);
                    var t=$(e.target);
                    if(audio.paused===false) {
                        t.removeClass('active');
                        audio.pause();
                    } else {
                        t.toggleClass('active',true);
                        audio.play();
                    }
                    break;

                case 'next':
                    mpd.next();
                    break;

                case 'previous':
                    mpd.previous();
                    break;

                case 'clear':
                    mpd.clearPlaylist();
                    break;

                case 'status':
                    mpd.getStatus();
                    break;

                case 'goto':
                    app.registry.event_manager.trigger('goto_song');
                    break;

                default:
                    break;
            }
            

        }
    });

    return controlsView;

} catch(e) {
    console.log(e.message);
}
});
