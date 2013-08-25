<h3><%= datum.size() %></h3>
<% if (datum !== undefined ) { %>

<form>
<ul>

<% datum.each(function(item) { %>
    <li role="song" data-id="<%= item.cid %>">
    <div class="title">
        <input type="checkbox" />
        <%= item.get('Artist') %>
    </div>
    <div class="artist"><%= item.get('Artist') %>
 ~            <% if(item.get('Time')) { %><%= timetools.time_to_duration(item.get('Time')) %> <% } %></td>
    
    </div>
        <div class="artist"><%= item.get('Album') %></div>
 </li>

<% }); %>
</ul>
</form>
<% } else { %>
<p>no data</p>

<% } %>

