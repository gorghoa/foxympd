<h2><%= model.get('host') %>:<%= model.get('port') %></h2>

<ul>
    <li>
        <button role="connect">connect</button>
    </li>
</ul>


    <table>
    <thead>
    <tr>
        <th colspan="2" >
            Info
        </th>
    </tr>
    </thead>
    <tbody>
        <tr>
            <th>Last connection was </th>
            <td><% if(model.get('last_connection')) { %><%= timetools.time_to_duration(lasttimewas/1000) %> ago<% } else { %>never<%  } %></td>
        </tr>
        <tr>
        <th>Host</th>
            <td><%= model.get('host') %></td>
            </tr>
        <tr>
            <th>Port</th>
            <td><%= model.get('port') %></td>
        </tr>
    </tbody>
    <thead>
    <tr>
        <th colspan="2" >
            Stats
        </th>
    </tr>
    </thead>
    <tbody>
    <% _.each(model.get('stats'),function(value,key) {
        
        switch(key) {

            case 'db_update':
                value=timetools.time_to_duration(value/1000000);
                break;

            case 'db_playtime':
            case 'uptime':
            case 'playtime':
                value=timetools.time_to_duration(value);
                break;

            default:
                value=value;
                break;
        }
    %>
        <tr>
            <th><%= key %></th>
            <td><%= value %></td>
        </tr>
    <% });  %>
    </tbody>
    </table>

<ul>
    <li>
        <a role="button" class="danger delete"  ><span class="lsf">eraser</span>&nbsp;delete</a>
    </li>
</ul>
