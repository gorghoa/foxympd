<p class="info">
<% if (model) { %>
    Edit mpd connection.
<% } else {%>
    Add a new mpd connection.
<% } %>
</p>
<form >
    <div>
        <label for="host">host</label>
        <input type="text"  name="host" id="host" value="<%= model.get('host') || '192.168.' %>" />
    </div>
    <div>
        <label for="port">port </label>
        <input type="port"  name="port" id="port" value="<%= model.get('port') || 6600 %>"  />
    </div>
    <div>
        <label for="password">password</label>
        <input type="password"  name="password" id="password" value="<%= model.get('password') || "" %>"  />
    </div>
    <div>
        <label for="name">name</label>
        <input type="text"  name="name" id="name" value="<%= model.get('name') || 'coin' %>" />
    </div>
</form>



