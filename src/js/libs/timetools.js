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
define([],function() {


    var explode_time = function(time) {


        var init=time;
        var secs,mins,hours,days;

        //seconds
        time = parseInt(time,10);
        secs = time % 60;

        //minutes
        time=time-secs;
        time=time/60;
        mins = time%60;


        //hours

        time -= mins;
        time=time/60;
        hours = time%24;


        //days
        time=(time-hours)/24;

        return {seconds:secs,minutes:mins,hours:hours,days:time};

    };


    var display_short=function(exp) {
        var ret='';

        if( exp.days ) {
            ret+=exp.days+"d ";
        }

        if(ret || exp.hours) {
            if(exp.hours<10) ret+="0";
            ret+=exp.hours+":";
        }

        if(ret || exp.minutes) {
            if(exp.minutes<10) ret+="0";
            ret+=exp.minutes+":";
        }

        if(!ret) {
            ret+="00:";
        }
        if(exp.seconds<10) ret+="0";
        ret+=exp.seconds;

        return ret;

    };

    var display_verbose=function(exp) {
        var ret='';

        if( exp.days ) {
            ret+=exp.days+" days ";
        }

        if(ret || exp.hours) {
            ret+=exp.hours+"h ";
        }

        if(ret || exp.minutes) {
            ret+=exp.minutes+"m ";
        }

        ret+=exp.seconds+"s";

        return ret;

    };

    var time_to_duration = function(time,display_type) {

        if(time===undefined) time=0;
        if(isNaN(time)) throw "time is not an number, doing nothing.";
        var exp = explode_time(time);

        switch (display_type) {
            case "short":
                return display_short(exp);
                break;

            case "verbose":
            default:
                return display_verbose(exp);
                break;
                
        }

        return "~";

    };

    var tests = {
        60:{seconds:0,minutes:1,hours:0,days:0}
    };


    return {
        time_to_duration:time_to_duration
    };

});
