define([
  'jquery',
  'chai',

  'foxy/libs/mpd'

], function($,chai,MPD) {
  'use strict';

  var expect = chai.expect;
  var should = chai.should();
  var assert = chai.assert;

    describe('mpd', function() {

        describe('controls',function() {


            describe('toggle play/pause',function() {

                var mpd = new MPD(),result;
                var currentStatus=undefined;

                mpd.status = function() {
                    var dfd=$.Deferred();
                    mpd.statusdata.state=currentStatus;
                    return dfd.resolve({data:mpd.statusdata});
                };

                mpd.pause = function() {
                    currentStatus = (currentStatus==='play') ? 'pause' : 'play';
                    return $.Deferred().resolve();
                };
                
              it('when playing, play/pause button should pause',function(done) {
                    mpd.statusdata.state='play';
                    currentStatus='play';
                    result = mpd.togglePlayPause().done(function() {
                        currentStatus.should.equal('pause');
                        done();
                    });
              });

              it('when not playing, play/pause button should play',function(done) {
                    mpd.statusdata.state='pause';
                    currentStatus='pause';
                    result = mpd.togglePlayPause().done(function() {
                        currentStatus.should.equal('play');
                        done();
                    });
              });

              it('when playing and cache state is out of sync, play/pause button should pause',function(done) {
                    mpd.statusdata.state='pause';
                    currentStatus='play';
                    result = mpd.togglePlayPause().done(function() {
                        currentStatus.should.equal('pause');
                        done();
                    });

              });
          }); //fin describe play/pause


        }); //fin describe controls
      

        it('When no connection, action button should redirect to add a connection');

  });
});
