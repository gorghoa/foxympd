<div role="artist"></div>
<div role="album"></div>

<div class="buttons">
    <button data-action="volumedown" class="fifty"  ><span class="lsf">volumedown</span></button>
    <button data-action="volumeup" class="fifty"><span class="lsf">volumeup</span></button>
</div>
<img role="cover" src="/imgs/backcover.png" />
    <% if (http_stream_url) { %>
        <audio src="<%= http_stream_url %>" id="http_stream_player"></audio>
        <button class="control lsf" role="mpd-control" data-action="stream" >music</button>
    <% } %> 
