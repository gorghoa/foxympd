<% if (datum !== undefined  && datum.size() ) { %>

<p class="info"><%= datum.size() %> songs in playlist</p>

<ul>
<% datum.each(function(item) { %>

    <li role="song"  class="list" data-id="<%= item.get('Id') %>">
    <a name="<%= item.get('Id') %>"></a>
    <div class="title">
    <%= item.get('Title') %></div>
        <div class="artist"><%= item.get('Artist') %>
     ~            <% if(item.get('Time')) { %><%= timetools.time_to_duration(item.get('Time')) %> <% } %></td>
        
        </div>
        <div class="artist"><%= item.get('Album') %></div>
 </li>

<% }); %>
</ul>
<% } else { %>

<p>Hi there! There is currently no selected playlist to play…<br/><a href="#playlists/build">Start building one right now.</a><p>

<h1>Stored Playlists:</h1>

<ul id="stored-playlists"></ul>

<% } %>
