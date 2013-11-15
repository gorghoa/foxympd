/* © barosofts, César & Rodrigue Villetard, 2013

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

    'collections/songs',

    'tpl!templates/playlist/artists',
    'tpl!templates/playlist/roledata',

    'views/playlists/song_detail'

],function($,_,Backbone,app,SongCollection,tpl,tplRoledata, detailedView) {


    var view = Backbone.View.extend({

        initialize:function()  {
              this.collection = new SongCollection({mpdconnection:app.registry.mpd});
        },
        collection:null,

        renderdata:function(data) {

            data = _.sortBy(data,function(mdl1) {
                return (mdl1.get('Artist'))?mdl1.get('Artist').toUpperCase():'';
            });

            var last=null,first,init,keys=[],view,percent=0,i=0,size=_.size(data),inter;
            el = $('<div/>');

            this.$el.html(tpl({size:_.size(data)}));

            var roledata=this.$el.children('[role=data]');
            roledata.empty();
            var el = $('<ul/>');

            var i=0;
            _.each(data,function(item) {


                view = new detailedView({model:item}); 

                first = (_.size(item.get('Artist')))?item.get('Artist'):'Mistagged Artists… <span class="lsf">wink</span>';

                if( first != last) {

                    roledata.append(el);
                    el=$('<ul/>');
                    keys[keys.length]=first;
                    last = first;
                    roledata.append(tplRoledata({last:last}));
                }
                view.render();
                el.append(view.$el);


             }); 



            roledata.append(el);
        },
        render: function() {

            var self=this;
            var data={};


            self.$el.html(tpl({size:'~'}));
            return self.$el;

        },

        filtering:function(val, e) {

            if(val.length<3) return;
            console.log('filtering songs');
            var self=this;

            var c=this.collection;

            c.search(val,{
                success:function(data) {
                    self.renderdata(data.models);
                }
            });


        },
        events: {
            'click h1':"selectArtist"
        },
        selectArtist:function(e) {
            var target=$(e.currentTarget).parent();
            $(target).children('li[role=artist]').toggleClass('selected');
        },
        'done':function(e) {

            var self=this;
            var checked=self.el.getElementsByClassName('selected');
            var mpd=app.registry.mpd;


            var selection = _.map(checked,function(item) {
                return $(item).attr('data-file');
            });

            mpd.addSongs(selection).done(function() {
                $(checked).removeClass('selected');
            });
        }
    });

    return view;
});
