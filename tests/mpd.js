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

        describe('commands', function() {

            it('should be stacked');

        });

        describe('on data', function() {
    

            it('should wait to have receive all data before run another command');


        });

        describe('control',function() {


            describe('play/pause action',function() {

                var mpd = new MPD(),result;
                var currentStatus=undefined; //the real mocked status of mpd server
                mpd.statusdata.state; //the cached version of mpc

                /**
                 * override mpd status 
                 */
                mpd.status = function() {
                    var dfd=$.Deferred();
                    mpd.statusdata.state=currentStatus;
                    return dfd.resolve({data:mpd.statusdata});
                };

                /**
                 * override mpd pause 
                 */
                mpd.pause = function(result) {

                    if(result===true) {
                        currentStatus = 'pause';
                    }  else {
                        currentStatus = (currentStatus==='play') ? 'pause' : 'play';
                    }

                    return $.Deferred().resolve();

                };

                mpd.play= function() {
                    currentStatus = 'play';
                    return $.Deferred().resolve();
                };

              it('should trigger **play** when not playing',function(done) {
                    mpd.statusdata.state='pause';
                    currentStatus='pause';
                    result = mpd.togglePlayPause().done(function() {
                        currentStatus.should.equal('play');
                        done();
                    });
              });
                
              it('should trigger **pause** when playing',function(done) {

                    mpd.statusdata.state='play';
                    currentStatus='play';

                    result = mpd.togglePlayPause().done(function() {
                        currentStatus.should.equal('pause');
                        done();
                    });
              });


              it('should not be disturbed when cache state is out of sync with real mpd status',function(done) {
                    mpd.statusdata.state='play';
                    currentStatus='pause'; //should be the winner
                    result = mpd.togglePlayPause().done(function() {
                        currentStatus.should.equal('play');
                        done();
                    });

              });
          }); //fin describe play/pause


        }); //fin describe controls
      


  });
});
