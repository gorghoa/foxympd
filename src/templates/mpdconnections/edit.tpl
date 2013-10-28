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

    <h4>HTTP Stream</h4>
    <div>
        <label for="http_stream_active">http stream active ?</label>
        <input type="checkbox"  name="http_stream_active" id="http_stream_active" />
    </div><div>
        <label for="http_stream_url">http stream url</label>
        <input type="text"  name="http_stream_url" id="http_stream_url" value="<%= model.get('http_stream_url') %>" />
    </div>
</form>



