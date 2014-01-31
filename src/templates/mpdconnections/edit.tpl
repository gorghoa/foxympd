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
        <p class="help">
        Http stream will allow you to output mpd http stream directly to the device speakers/headphones.
        
        In order to use correctly this functionnality, make sure to have activate the http stream within your mpd server.

        Otherwise, you’ll just be frustrated ;).
        </p>
    <div>
        <label for="http_stream_active">http stream active ?</label>
        <input type="checkbox" <%= (model.get('http_stream_active',false)===true)?'checked':'' %>  name="http_stream_active" id="http_stream_active" />
    </div><div>
        <label for="http_stream_url">http stream url</label>
        <input type="text"  name="http_stream_url" id="http_stream_url" value="<%= model.get('http_stream_url') %>" />
    </div>
</form>



