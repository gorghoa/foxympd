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

    'collections/songs',

    'tpl!templates/playlist/artists',

    'views/playlists/song_detail'

],function($,_,Backbone,app,SongCollection,tpl,detailedView) {


    var view = Backbone.View.extend({

        initialize:function()  {
              this.collection = new SongCollection({mpdconnection:app.registry.mpd});
        },
        collection:null,

        renderdata:function(data) {

            var last=null,first,init,keys=[],view,percent=0,i=0,size=_.size(data),inter;
            el = $('<div/>');

            this.$el.html(_.template(tpl,{size:_.size(data)}));

            var roledata=this.$el.children('[role=data]');
            roledata.empty();

            var divArtist=$('<div class="artist"/>');
            _.each(data,function(item) {
                i++;

                view = new detailedView({model:item}); 

                if(item.get('Title')) {
                    first = item.get('Artist');
                } else {
                    first = "_";
                }

                if( first != last) {
                    keys[keys.length]=first;
                    last = first;
                    el.append(divArtist);
                    divArtist=$('<div class="artist" />');
                    divArtist.append(_.template('<a name="goto-<%= last %>"></a><h1 class="last"><%=last%></h1><hr/>',{last:last}));
                }

                divArtist.append(view.render());


             }); 


            roledata.append(el);
        },
        render: function() {

            var self=this;
            var data={};

            var coll = this.collection;

            app.registry.mpd.stats().then(function(result) {

                self.$el.html(_.template(tpl,{size:'~'}));
                
            });

            return self.$el;

        },

        filtering:function(val, e) {

            if(val.length<4) return;
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
            var checked=this.$el.find('.selected');
            var mpd=app.registry.mpd;

            var selection = _.map(checked,function(item) {
                var id = $(item).attr('data-id');
                var model =  self.collection.get(id);
                return model.get('file');
            });

            mpd.addSongs(selection).done(function() {
                checked.removeClass('selected');
            
            });
        }
    });

    return view;
});


