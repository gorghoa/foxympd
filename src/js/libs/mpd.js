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



    var TCPSocket = navigator.mozTCPSocket;


    var mpd = function() {
       this.eventManager={};
        _.extend(this.eventManager,Backbone.Events);
    };


    mpd.prototype = {


/* ~~~~~~~~~~~ ATTRIBUTES ~~~~~~~~~~~~~~~~*/
        socket:undefined,
        idlesocket:"",
        runstatus:"idle",
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
        connect:function(connect_infos) {
            var dfd = $.Deferred();


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

            this.socket = TCPSocket.open(this.connect_infos.host,this.connect_infos.port); 
            this.idlesocket = TCPSocket.open(host,port); 

            this.idlesocket.onopen = function() {
                if(password) {
                    self.idlepassword(password);
                } else {
                    self.idlesocket.send('ping\n');
                }
            };


            this.socket.onopen=function() {
                if(password) {
                    self.stacked_mpd_commands = _.union([{command:"password "+password+"\n",parse:false,dfd:$.Deferred()}],self.stacked_mpd_commands);
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


            var parse = (action.parse!==undefined)?action.parse:true;

            console.log("mpd execute : ",actionString);

            var dfd = action.dfd;


            var stack="";
            var data="";
            var endstring=new RegExp("OK\n");



            var error_regexp = new RegExp('ACK');
            self.socket.ondata=function(response) {

                data += self.utf8_decode(response.data);

                if(data.match(error_regexp)) {

                    dfd.fail(data);
                    console.error(data);
                    self.eventManager.trigger("mpd_error",data);
                    self.stacked_mpd_commands=_.rest(self.stacked_mpd_commands);
                    self.resetRunningStatus();
                    self.run();
                    return;

                } else if (data.match(endstring)) {

                    data = (parse) ? self.parse_mpd_response(data): data;
                    dfd.resolve({data:data});
                    self.stacked_mpd_commands=_.rest(self.stacked_mpd_commands);
                    self.resetRunningStatus();
                    self.run();
                    return;
                }
            };

            self.socket.send(actionString);
        },


        send:function(actionString,parse) {

            var dfd = $.Deferred();

            this.stacked_mpd_commands.push({command:this.utf8_encode(actionString),parse:parse,dfd:dfd});

            this.run();

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
            msg ='pause '+value+'\n';
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
        play:function() {
            return this.send('play\n');
        },
        next:function() {
            return this.send('next\n');
        },
        previous:function() {
            return this.send('previous\n');
        },

        playlistinfo:function() {
            return this.send('playlistinfo\n',false);
        },


        loadPlaylist:function(val) {
            this.send('load "'+val+'"\n');
        },

        rmPlaylist:function(val) {
            return this.send('rm "'+val+'"\n');
        },

        playlistExists:function(val) {

            var dfd=$.Deferred();
            this.send('listplaylists\n',false).then(function(result) {
            var re=new RegExp('^(.*): '+val+"$");

            result=result.data.split("\n");

               match= _.find(result,function(item) {
                
                    return item.match(re);
               });


               if(match) {
                   console.log('auinesrt',match,typeof(match));
                    dfd.resolve(true);

                }


                   console.log('FALSE',match,typeof(match));
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
            return this.send('status\n').then(function(result) {
                self.update_status(result.data); 
            });
        },
        currentsong:function() {
            return this.send('currentsong\n');
        },
        stats:function() {
            return this.send('stats\n');
        },


        /* misc */

        ping:function(cb) {
            return this.send('ping\n');
        },

        clearPlaylist:function() {
            return this.send('clear\n');
        },

        /**
         * 1. trouve toutes les chansons concernées
         * 2. ajoute toutes les chansons
         */
        addArtists:function(artists) {

            var self=this;

            re = new RegExp("^(file): (.*)$");


            var dfd = $.Deferred();
            var songs="";

            var allArtists = function(artist) {
                var p = self.send('find Artist "'+artist+'"\n',false);
                p.done(function(result) {
                    songs=songs+result.data;
                });
                return p;
            };

            var artistsDef = artists.map(allArtists);

            $.when.apply($,artistsDef).done(function() {
            
                var cmd_list="command_list_begin\n";
                data=self.splitMPDData(songs);

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

            re = new RegExp("^(file): (.*)$");


            var dfd = $.Deferred();
            var songs="";

            var allAlbums = function(album) {
                var p = self.send('find Album "'+album+'"\n',false);
                p.done(function(result) {
                    songs=songs+result.data;
                });
                return p;
            };

            var albumsDef = albums.map(allAlbums);

            $.when.apply($,albumsDef).done(function() {
            
                var cmd_list="command_list_begin\n";
                data=self.splitMPDData(songs);

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


        addSongs:function(songs) {
                var cmd_list="command_list_begin\n";
                var self=this;
                data=songs;

                _.each(data,function(item) {
                    cmd_list+='add "'+item+'"\n';
                });
                cmd_list+="command_list_end\n";

                self.send(cmd_list).done(dfd.resolve());
        },


        volumeDown:function() {

            var self=this;
            if(self.statusdata.volume===undefined) {
                var dfd=$.Deferred();
                dfd.fail();
                return dfd.promise();
            }
                
            var vol =self.statusdata.volume-10;
            if(vol<0) vol=0;

            return this.send("setvol "+ vol +"\n");

        },
        volumeUp:function() {

            var self=this;

            if(self.statusdata.volume===undefined) {
                var dfd=$.Deferred();
                dfd.fail();
                return dfd.promise();
            }
            var vol =self.statusdata.volume+10;
            if(vol>100) vol=100;
            return this.send("setvol "+ vol +"\n");

        },

        /* current playlist */
        isRandom:function() {
            return  (this.statusdata.random==="1")?true:false;
        },
        toggleRandom:function() {
            var msg = (this.isRandom())?0:1;
            return this.send('random "'+msg+'"\n');
        },
        isRepeat:function() {
            return  (this.statusdata.repeat==="1")?true:false;
        },
        toggleRepeat:function() {
            var msg = (this.isRepeat())?0:1;
            return this.send('repeat "'+msg+'"\n',false);
        },


        search:function(value) {
            
            return this.send('search any "'+value.toLowerCase()+'"\n',false);
        },

        searchAlbum:function(value) {
            this.send('search album "'+value.toLowerCase()+'"\n',false);
        },


        searchTitle:function(value) {
            this.send('search title"'+value.toLowerCase()+'"\n',false);
        },

        listArtists:function() {
            return this.send('list Artist\n',false);
        },
        listAlbums:function() {
            return this.send('list Album\n',false);
        },

        shuffle:function() {
            return this.send('shuffle\n');
        },
/* ~~~~~~~~~~~ STORED PLAYLISTS ~~~~~~~~~~~~~~~~*/
        listplaylists:function() {
            return this.send('listplaylists\n',false);
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
