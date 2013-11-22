<!--
<ul role="filter" >
    <li><button  role="filter" data-action="artists" >Artists</button></li>
    <li><button  role="filter" data-action="albums" >Albums</button></li>
</ul>
-->
<ul role="ctl">


    <% if (http_stream_url) { %>
        <audio src="<%= http_stream_url %>" id="http_stream_player"></audio>
        <li><button class="control lsf" role="mpd-control" data-action="stream" disabled="disabled">music</button></li>
    <% } else { %>
        <li><button data-action="randomize" role="mpd-control" class="lsf control <% if (isRandom) {%>active<%}%>">shuffle</button>
    <% } %>
    <!--
    <li><button class="control" role="mpd-control" data-action="clear" >ẞ</button></li>
    <li><button class="control" role="mpd-control" data-action="status" >♥</button></li>
    -->
    <li><button class="control lsf" role="mpd-control" data-action="previous" >back</button></li>
    <li><button class="control lsf" role="mpd-control" data-action="playpause" >pause</button></li>
    <li><button class="control lsf" role="mpd-control" data-action="next" >next</button></li>
    <li><button class="control lsf" role="mpd-control" data-action="goto" >pin</button></li>
</ul>

