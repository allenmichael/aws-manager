export class Templates {
    static readonly BaseTemplate = `
    <html>
        <body>
            <%= content %>
        </body>
    </html>`;
    static readonly InvokeTemplate = `
    <h1>
        Invoking <%= FunctionName %>...
    </h1>
    <p>Status Code: <%= StatusCode %></p>
    <p>Response: 
        <pre><%- JSON.stringify(JSON.parse(Payload), null, 4) %></pre>
    </p>
    <p>Logs: 
        <pre><%= LogResult %></pre>
    </p>
    `;
    static readonly GetConfigTemplate = `
    <h1>
        Configuration for <%= FunctionName %>...
    </h1>
    <p>Function Name: <%= FunctionName %></p>
    <p>Function Arn: <%= FunctionArn %>
    <p>Description: <%= Description %>
    <p>Handler: <%= Handler %>
    <p>Last Modified: <%= LastModified %>
    <p>Memory Size: <%= MemorySize %>
    <p>Role: <%= Role %>
    <p>Timeout: <%= Timeout %>
    <p>Version: <%= Version %>
    `;
}