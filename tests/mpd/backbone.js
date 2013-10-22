define([
  'jquery',
  'chai',

  'backbone.mpd',
  'libs/mpd'

], function($,chai,backboneMPD,MPD) {
  'use strict';

  var expect = chai.expect;
  var should = chai.should();
  var assert = chai.assert;

  describe ('mpd extends to Backbone.Collection',function() {


        describe('::fetch()',function() {

                var parsed_data= [
                                {Id:30,file:"link/Zikmu/Les Colocs/Les Colocs - Dehors Novembre/Les Colocs - 03 - Tassez-vous de d'là.flac"},
                                {Id:31,file:"link/Zikmu/Les Cwolocs/Les Colocs - Dehors Novembre/Les Colocs - 03 - Belzébuth.flac"}
                 ];

                 
                
                var mpd = new  MPD();

                mpd.listMock=function(options) {
                    var dfd = options.dfd;
                    dfd.resolve({data:"Id: 30\nfile: link/Zikmu/Les Colocs/Les Colocs - Dehors Novembre/Les Colocs - 03 - Tassez-vous de d'là.flac\nLast-Modified: 2013-06-26T18:35:56Z\nTime: 336\nTitle: Tassez-vous de d'là\nArtist: Les Colocs\nAlbumArtist: Les Colocs\nAlbum: Dehors Novembre\nDate: 2007\nTrack: 03\nGenre: Quebec\nPos: 31\nId: 31\nfile: link/Zikmu/Les Colocs/Les Colocs - Dehors Novembre/Les Colocs - 01 - Belzébuth.flac\nLast-Modified: 2013-06-26T18:36:03Z\nTime: 566\nTitle: Belzébuth\nArtist: Les Colocs\nAlbumArtist: Les Colocs\nAlbum: Dehors Novembre\nDate: 2007\nTrack: 01\nGenre: Quebec\nPos: 32\nId: 32\nOK\n"});

                    return dfd.promise();
                };

                var MockCollec = backboneMPD.Collection.extend({
                    database:{},
                    storeName:"mock",
                    stat:'mocks',
                    initialize:function(options) {
                        this.mpdconnection = mpd;
                    },
                    mpdmethodmapping:{
                        read:'listMock'
                    },
                    parse: function(data) {
                        return parsed_data;
                    }

                });

            it('should fetch from mpd and parse if cache outdated',function(done) {
                var collec = new MockCollec();
                collec.parent.sync=function(method,object,options) {

                    var dfd = $.Deferred();
                    dfd.resolve(parsed_data);
                    return dfd.promise();

                };

                collec.parent.fetch=function(options) {
                    var dfd = $.Deferred();
                    collec.reset(parsed_data);
                    options.success(this);
                    dfd.resolve(collec);
                    return dfd.promise();
                };

                collec.fetch({
                    success:function(data) {

                        expect(collec.size()).to.equal(2);
                        expect(collec.first().get('Id')).equal(30);

                        done();
                    }
                });
            });

            it('should fetch from indexeddb and parse if cache ok',function(done) {
                var collec = new MockCollec();

                collec.parent.sync=function(method,object,options) {

                    var dfd = $.Deferred();
                    dfd.resolve(parsed_data);
                    return dfd.promise();

                };

                collec.parent.fetch=function(options) {

                    var dfd = $.Deferred();
                    collec.reset(parsed_data);
                    options.success(this);
                    dfd.resolve(collec);
                    return dfd.promise();
                };

                collec.reset();
                expect(collec.size()).to.equal(0);

                mpd.cached_stats['mocks']=2;

                collec.fetch_from_mpd=function() {
                    console.log('câlisse toi d’la.');
                    expect(true).to.be(false); //en  attendant la doc de sinon js, faudra bien se contenter de ça…
                };
                
                collec.fetch({
                    success:function(data) {

                        expect(collec.size()).to.equal(2);
                        expect(collec.first().get('Id')).equal(30);
                        done();
                    }
                });
            });
            it('should not fetch from indexeddb when no database or storename',function(done) {
                var MockCollecWithoutIndexedDB = backboneMPD.Collection.extend({
                    database:undefined,
                    storeName:undefined,
                    stat:undefined,
                    initialize:function(options) {
                        this.mpdconnection = mpd;
                    },
                    mpdmethodmapping:{
                        read:'listMock'
                    },
                    parse: function(data) {
                        return parsed_data;
                    }

                });
                var collec = new MockCollecWithoutIndexedDB();

                collec.reset();
                expect(collec.size()).to.equal(0);

                collec.fetch_from_mpd=function() {
                        done();
                };
                
                collec.fetch(
                );
            });



        });
    });
});
