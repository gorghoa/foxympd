/*
    © Pumpkin, barosofts, César & Rodrigue Villetard, 2013

    BIG DISCLAIMER:::: DIRECTLY INSPIRED BY Pumpkin’s SIMPLEMPC PROJECT!

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

    'jquery'
],function($) {


    
                console.log('auie');
    /**
     * getCover 
     * 
     * @param artist $artist 
     * @param album $album 
     * @access public
     * @return void
     */
    var getCover = function (artist, album){

            var dfd=$.Deferred();



                $.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=7facb82a2a573dd483d931044030e30c&artist=" + artist + "&format=json", function(data) {

                var cover_url;
                var cover_container = document.querySelector(".cover-container");

                $.each(data.artist.image, function(i,item){
                    if (item['size'] == 'mega'){
                        cover_url = item['#text'];
                    }
                });

                if (cover_url) {
                    dfd.resolve(cover_url);
                } else {
                    dfd.reject();
                }

                });


            return dfd.promise();
    };


    return getCover;

});
