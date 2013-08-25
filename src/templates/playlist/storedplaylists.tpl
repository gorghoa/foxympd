<% datum.each(function(item) { %>
    <li class="list" data-playlistid="<%= item.get('playlist') %>"><%= item.get('playlist') %></li>
<% }); %>
