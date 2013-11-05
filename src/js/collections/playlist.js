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

    'collections/songs',

    'models/song',

    'backbone.mpd'
],function($,_,Backbone,SongCollection,SongModel,BackboneMpd) {


    var PlaylistCollection = SongCollection.extend({

            mpdmethodmapping:{
                read:'playlistinfo'
            },
            parse:function(data) {
                return this.parse_mpd_response(data);
            },
            parse_mpd_response:function(data) {


                var re = new RegExp("\n");
                data = data.split(re);


                re = new RegExp("(^$)|(^OK)");
                data = _.reject(data,function(item) {
                    return item.match(re);
                });

                re = new RegExp("^(.*): (.*)$");
                var done;

                var ret=[];
                var model=new SongModel;
                _.each(data,function(item) {
                    done = item.match(re);
                    
                    if(done) {
                        model.set(done[1],done[2]);

                        if(done[1]==='Id') {
                            ret[ret.length]=model;
                            model=new SongModel;
                        }
                    } else {
                        console.log('tiens… tiens…',item);
                    }
                });

                return ret;

            },
            comparator: function(mdl1,mdl2) {
                    var first = parseInt(mdl1.get('Id'),10);
                    var second = parseInt(mdl2.get('Id'),10);
                    return ( (first > second && first) || !second)?1:-1;
            },
    });

    return PlaylistCollection;

});
