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
*/define([
    
    'jquery',
    'underscore',
    'backbone'

],function($,_,Backbone) {


    "use strict";

    var TCPSocket = navigator.mozTCPSocket;


    var mpd = function() {
       this.eventManager={};
        _.extend(this.eventManager,Backbone.Events);
    };


    mpd.prototype = {


/* ~~~~~~~~~~~ ATTRIBUTES ~~~~~~~~~~~~~~~~*/
        okRegExp : new RegExp("OK\n$"),
        koRegExp : new RegExp("^ACK"),
        socket:undefined,
        idlesocket:"",
        runstatus:"idle",
        cached_stats:{'auie':'auie'},
        statusdata:{repeat:0,random:0,state:undefined,volume:undefined},
        is_open:false,
        eventManager:{},
        actionStack:[],
        connect_infos:{},
        stacked_mpd_commands:[],

/* ~~~~~~~~~~~ TOOLS FUNCTIONS ~~~~~~~~~~~~~~~~*/
        parse_mpd_response:function(data) {


            var ret={};
            var re = new RegExp("\n");
            data = data.split(re);


            re = new RegExp("(^$)|(^OK)");
            data = _.reject(data,function(item) {
                return item.match(re);
            });

            re = new RegExp("^(.*): (.*)$");
            var done;

            _.each(data,function(item) {
                done = item.match(re);
                if(done) {
                    ret[done[1]]=done[2];
                }
            });

            return ret;

        },

        on:function() {
            this.eventManager.on.apply(this.eventManager,arguments);
        },

        once:function() {
            this.eventManager.once.apply(this.eventManager,arguments);
        },

        idledata:"",

        setConnectInfos:function(connect_infos) {
            this.connect_infos=connect_infos;
        },

        resetRunningStatus:function() {
            this.runstatus='idle';
        },
        close:function() {
            var dfd = $.Deferred();
            if(this.socket) {
                this.socket.close();
            }

            if(this.idlesocket) {
                this.idlesocket.close();
            }
            dfd.resolve();

            return dfd.promise();

        },

        getConnectionPromise:function() {

            return this.connectingpromise;
        },
        connect:function(connect_infos) {

            var dfd = $.Deferred();

            this.connectingpromise=dfd.promise();

            if(!TCPSocket) {
                dfd.reject("TCPSocket not available with this browser."); 
                return dfd;
            }

            if(connect_infos) this.setConnectInfos(connect_infos);

            this.resetRunningStatus();
            var def=$.Deferred();

            var host = this.connect_infos.host;
            var port = this.connect_infos.port;
            var password = this.connect_infos.password;

            if(!host || !port) {
                console.error('no mpd connection info given. can’t connect :/');
                dfd.reject("no mpd connection info given. can’t connect :/");
                return dfd;
            }

            console.info('connecting mpd with ' + this.connect_infos.host + ":" + this.connect_infos.port); 

            var self=this;

            this.close();



            self.socket = TCPSocket.open(self.connect_infos.host,self.connect_infos.port); 
            self.idlesocket = TCPSocket.open(host,port); 


            this.idlesocket.onopen = function() {
                if(password) {
                    self.idlepassword(password);
                } else {
                    self.idlesocket.send('ping\n');
                }
            };


            this.socket.onopen=function() {
                if(password) {
                    self.stacked_mpd_commands = _.union([{command:"password "+password+"\n",options:{parse:false,dfd:$.Deferred()}}],self.stacked_mpd_commands);
                }
                dfd.resolve();
                self.eventManager.trigger('open');
            };

            this.socket.onclose=function() {
                console.log('closing :(');
                self.eventManager.trigger('close');
                self.is_open=false;
            };


            this.idlesocket.ondata=function(result) {

                self.idledata+=result.data;

                if(result.data.match(/OK\n$/)) {
                    console.log("idledata",self.idledata);
                    self.manageIdleData(self.idledata);
                    self.status();
                    self.idledata="";
                    self.idle();
                }
            };

            this.socket.ondata=function() {
            };

            return dfd.promise();
        },
        onDataEnd : function() {

            var self=this;
            
            self.stacked_mpd_commands=_.rest(self.stacked_mpd_commands);
              
            if(_.size(self.stacked_mpd_commands)===0) self.eventManager.trigger('stopsendingdata');
            
            self.resetRunningStatus();
            self.run();

        },
        handleMPDError:function(error) {
            var self=this;
            self.eventManager.trigger("mpd_error",error);
        },
        processMPDData:function(response,buffer,dfd,parse) {

                var self=this;
                buffer += self.utf8_decode(response.data);


                /**
                 * If an error is caught  
                 */
                if(buffer.match(self.koRegExp)) {

                    self.handleMPDError(buffer);

                    self.onDataEnd();
                    dfd.fail(buffer);

                /**
                 * Or, everything wend fine and mpd.js was able to catch the OK delimiting caracter  
                 */
                } else if (buffer.match(self.okRegExp)) {


                    buffer= (parse) ? self.parse_mpd_response(buffer): buffer;

                    self.onDataEnd();

                    dfd.resolve({data:buffer});
                }


                return buffer;
            },

        isOpen:function() {
            return (typeof this.socket !== "undefined" && this.socket.readyState==='open');
        },
        run:function() {

            var self=this;

            //if a mpd command is already running, or nothing less to do, we get out of here as quickly as we came in.


            if(self.runstatus !=='idle' || !_.size(self.stacked_mpd_commands)) return;



            if(typeof self.socket === 'undefined' || self.socket.readyState !== 'open' ) {

                return ;
            }

            self.runstatus='running';



            var action = _.first(self.stacked_mpd_commands);

            var actionString=action.command;


            var parse = action.options.parse;

            console.log("mpd execute : ",actionString);

            var dfd = action.options.dfd;



            var stack="";
            var buffer="";

            self.socket.ondata=function(response) {
                try{
                    buffer = self.processMPDData(response,buffer,dfd,parse);
                } catch(e) {
                    console.error('ondata',response,e.message, actionString);
                }
            };

            self.socket.send(actionString);
            self.eventManager.trigger('sendingdata');
        },


        send:function(actionString,options) {

            options = options || {};
            var dfd = (options.dfd && typeof options.dfd !== 'undefined') ? options.dfd : $.Deferred();

            options.dfd = dfd;


            options.parse = (options.parse!==undefined)? options.parse : true;

            var self=this;

            self.stacked_mpd_commands.push({command:self.utf8_encode(actionString),options:options});

            self.run();

            return dfd.promise();

        },
        splitMPDData:function(str) {
            return str.split("\n");

        },
        manageIdleData:function(raw_data) {
            var self=this;
            var data=self.splitMPDData(raw_data);

            var infos=[];

            infos = _.filter(data,function(item,key) {
                return item.match(/:/);
            });

            if(!infos.length) return; //cas du ping par exemple.

            var parsed={},exp;

            _.each(infos,function(item,key,parsed) {
                exp = item.match(/^(.*): (.*)$/);

                parsed[exp[1]]=exp[2];
            });

            self.status().done(function() {
                self.eventManager.trigger(exp[2]+"_changed");
                console.log(exp[2]+"_changed");
            });
            

        },
/* ~~~~~~~~~~~ QUERYING MPD’S STATUS  ~~~~~~~~~~~~~~~~*/
        getStatus:function() {
            console.info(this.socket.readyState);
            console.info(this.idlesocket.readyState);
            return this.socket.readyState;
        },
        pause:function(value) {
            value=(value)?1:0;
            var msg ='pause '+value+'\n';
            var self=this;
            return this.send(msg).then(function(result) {
                return (value===1)?false:true;
            });
        },

        solvePlaying:function(state) {

            var self=this;
            switch(state) {
                case 'play':
                    return true;
                    break;

                case 'pause':
                case 'stop':
                    return false;
                    break;

                default:
                    throw new Error('wtf is going on with that '+state+'…??');
                    break;
            }

            throw new Error('wtf is going on with that '+state+'…??');

        },


        isPlaying:function() {
            
            var self=this;
            var dfd = $.Deferred();


            if(this.statusdata.state===undefined) {
                this.status().done(function(result) {
                    dfd.resolve(self.solvePlaying(self.statusdata.state));
                 });

            } else {
                dfd.resolve(self.solvePlaying(self.statusdata.state));
            }

            return dfd.promise();

        },
        togglePlayPause:function() {
            var self=this;
            var ret;
            var dfd = $.Deferred();

            var stat = self.status();
            
            var isp = stat.then(function() {
                var result = self.solvePlaying(self.statusdata.state);

                if(result===true) {
                    return self.pause(result);
                } else {
                    return self.play();
                }

            }).done(function() {
                dfd.resolve('ok');
            });

            return dfd.promise();

        },
        play:function(options) {
            return this.send('play\n',options);
        },
        next:function(options) {
            return this.send('next\n',options);
        },
        previous:function(options) {
            return this.send('previous\n',options);
        },

        playlistinfo:function(options) {

            options = options || {parse:false};
            return this.send('playlistinfo\n',options);
        },


        loadPlaylist:function(val,options) {
            this.send('load "'+val+'"\n',options);
        },

        rmPlaylist:function(val,options) {
            return this.send('rm "'+val+'"\n',options);
        },

        playlistExists:function(val) {

            var dfd=$.Deferred(), match;
            this.send('listplaylists\n',{parse:false}).then(function(result) {
            var re=new RegExp('^(.*): '+val+"$");

            result=result.data.split("\n");

               match= _.find(result,function(item) {
                
                    return item.match(re);
               });


               if(match) {
                    dfd.resolve(true);
                }
                dfd.resolve(false);

            
            });
            return dfd.promise();


        },

        savePlaylist:function(val) {
            var dfd=$.Deferred();
            var self=this;

        
            var isExists=self.playlistExists(val);
            isExists.then(function(data) {
                
                if(data===true) {
                    
                    self.rmPlaylist(val).done(function() {
                        self.send('save "'+val+'"\n').done(function() {
                            dfd.resolve('ok'); 
                        });
                    });
                }

                else {
                    self.send('save "'+val+'"\n').done(function() {
                        dfd.resolve('ok'); 
                    });

                }
            });


            return dfd.promise();
        },
        password: function(pass) {
            return this.send('password "'+pass+'"\n');
        },

/* ~~~~~~~~~~~ IDLE SOCKET STUFFS ~~~~~~~~~~~~~~~~*/
        noidle:function() {
                 this.idlesocket.send('noidle\n');
        },
        idle:function() {
            this.idlesocket.send('idle\n');
        },
        idlepassword: function(pass) {
            return this.idlesocket.send('password '+pass+'\n');
        },

        update_status:function(data) {
            if(data.volume) data.volume=parseInt(data.volume,10);
            this.statusdata=data;
        },
        status:function() {
            var self=this;
            var dd = this.send('status\n');
            
            dd.then(function(result) {
                self.update_status(result.data); 
            });

            return dd;
        },
        currentsong:function(options) {
            return this.send('currentsong\n',options);
        },
        stats:function(options) {
            var dfd = this.send('stats\n',options);

            var self = this;

            dfd.done(function(result) {

                self.cached_stats = result.data;
            });
            return dfd;
        },


        /* misc */

        ping:function(options) {
            return this.send('ping\n',options);
        },

        clearPlaylist:function(options) {
            return this.send('clear\n',options);
        },

        /**
         * 1. trouve toutes les chansons concernées
         * 2. ajoute toutes les chansons
         */
        addArtists:function(artists) {

            var self=this;

            var re = new RegExp("^(file): (.*)$");


            var dfd = $.Deferred();
            var songs="";

            var allArtists = function(artist) {
                var p = $.Deferred();
                var options = {parse:false,dfd:p};
                self.send('find Artist "'+artist+'"\n',options);
                p.done(function(result) {
                    songs=songs+result.data;
                });
                return p;
            };


            var artistsDef = artists.map(allArtists);

            var result = $.when.apply($,artistsDef);
            
            result.done(function() {
                var cmd_list="command_list_begin\n";
                var data=self.splitMPDData(songs);

                _.each(data,function(item) {
                    done = item.match(re);
                    if(done) {
                        cmd_list+='add "'+done[2]+'"\n';
                    }
                });
                cmd_list+="command_list_end\n";

                self.send(cmd_list).done(dfd.resolve());

            });

            return dfd.promise();
        },

        addAlbums:function(albums) {

            var self=this;

            var re = new RegExp("^(file): (.*)$");

            var dfd = $.Deferred();
            var songs="";

            var allAlbums = function(album) {
                var p = self.send('find Album "'+album+'"\n',{parse:false});
                p.done(function(result) {
                    songs=songs+result.data;
                });
                return p;
            };

            var albumsDef = albums.map(allAlbums);

            $.when.apply($,albumsDef).done(function() {
            
                var cmd_list="command_list_begin\n";
                var data=self.splitMPDData(songs);

                _.each(data,function(item) {
                    done = item.match(re);
                    if(done) {
                        cmd_list+='add "'+done[2]+'"\n';
                    }
                });
                cmd_list+="command_list_end\n";

                self.send(cmd_list,{parse:false}).done(dfd.resolve());
            });

            return dfd.promise();
        },


        addSongs:function(songs) {
                var cmd_list="command_list_begin\n";
                var self=this;
                var data=songs;

                var dfd = $.Deferred();

                _.each(data,function(item) {
                    cmd_list+='add "'+item+'"\n';
                });
                cmd_list+="command_list_end\n";

                self.send(cmd_list,{dfd:dfd});

                return dfd;
        },


        volumeDown:function(options) {

            var self=this;
            if(self.statusdata.volume===undefined) {
                var dfd=$.Deferred();
                dfd.fail();
                return dfd.promise();
            }
                
            var vol =self.statusdata.volume-10;
            if(vol<0) vol=0;

            return this.send("setvol "+ vol +"\n",options);

        },
        volumeUp:function(options) {

            var self=this;

            if(self.statusdata.volume===undefined) {
                var dfd=$.Deferred();
                dfd.fail();
                return dfd.promise();
            }
            var vol =self.statusdata.volume+10;
            if(vol>100) vol=100;
            return this.send("setvol "+ vol +"\n",options);

        },

        /* current playlist */
        isRandom:function() {
            console.info('rand',this.statusdata,(parseInt(this.statusdata.random,10)===1)?true:false);
            return  (parseInt(this.statusdata.random,10)===1)?true:false;
        },
        toggleRandom:function(options) {
            var msg = (this.isRandom())?0:1;
            return this.send('random "'+msg+'"\n',options);
        },
        isRepeat:function() {
            return  (this.statusdata.repeat==="1")?true:false;
        },
        toggleRepeat:function(options) {
            var msg = (this.isRepeat())?0:1;
            options = options || {parse:false};
            return this.send('repeat "'+msg+'"\n',options);
        },


        search:function(value,options) {
            options = options || {parse:false};
            return this.send('search any "'+value.toLowerCase()+'"\n',options);
        },

        searchAlbum:function(value) {
            options = options || {parse:false};
            this.send('search album "'+value.toLowerCase()+'"\n',options);
        },

        searchArtist:function(value,options) {
            options = options || {parse:false};
            this.send('search artist"'+value.toLowerCase()+'"\n',options);
        },

        searchTitle:function(value,options) {
            options = options || {parse:false};
            this.send('search title"'+value.toLowerCase()+'"\n',options);
        },

        listArtists:function(options) {
            var ret = this.send('list Artist\n',options);
            return ret;
        },
        listAlbums:function(options) {
            return this.send('list Album\n',options);
        },

        shuffle:function(options) {
            return this.send('shuffle\n',options);
        },
/* ~~~~~~~~~~~ STORED PLAYLISTS ~~~~~~~~~~~~~~~~*/
        listplaylists:function(options) {
            return this.send('listplaylists\n',options);
        },


/* ~~~~~~~~~~~ ENCODING ~~~~~~~~~~~~~~~~*/

        utf8_decode:function(s) {
            return decodeURIComponent(escape(s));
        },
        utf8_encode:function(s) {
            return unescape(encodeURIComponent(s));
        }



    };

    return mpd;
});
