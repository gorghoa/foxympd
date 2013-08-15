define([
    'timetools'
],function(timetools){

    /**
     * module game. test des interactions, de l’initialisation etc. 
     */
    (function() {

        module("timetools",{

        });

        test('time_to_duration',function(assert) {

            assert.strictEqual(timetools.time_to_duration(undefined) , "0s",'undefined case');
            assert.strictEqual(timetools.time_to_duration(1) , "1s");
            assert.strictEqual(timetools.time_to_duration(17) , "17s");
            assert.strictEqual(timetools.time_to_duration(60) , "1m 0s");
            assert.strictEqual(timetools.time_to_duration(80) , "1m 20s");
            assert.strictEqual(timetools.time_to_duration(93) , "1m 33s");
            assert.strictEqual(timetools.time_to_duration(3600) , "1h 0m 0s");
            assert.strictEqual(timetools.time_to_duration(86400) , "1 days 0h 0m 0s");
            assert.strictEqual(timetools.time_to_duration(93,"verbose") , "1m 33s");
            assert.strictEqual(timetools.time_to_duration(3600,"verbose") , "1h 0m 0s");
            assert.strictEqual(timetools.time_to_duration(86400,"verbose") , "1 days 0h 0m 0s");

       });

       test('time_to_duration',function(assert) {

            assert.strictEqual(timetools.time_to_duration(0,"short") , "00:00");
            assert.strictEqual(timetools.time_to_duration(undefined,"short") , "00:00",'undefined case');
            assert.strictEqual(timetools.time_to_duration(1,"short") , "00:01");
            assert.strictEqual(timetools.time_to_duration(17,"short") , "00:17");
            assert.strictEqual(timetools.time_to_duration(60,"short") , "01:00");
            assert.strictEqual(timetools.time_to_duration(80,"short") , "01:20");
            assert.strictEqual(timetools.time_to_duration(93,"short") , "01:33");
            assert.strictEqual(timetools.time_to_duration(3600,"short") , "01:00:00");
            assert.strictEqual(timetools.time_to_duration(86400,"short") , "1d 00:00:00");

       });

    })();



});


