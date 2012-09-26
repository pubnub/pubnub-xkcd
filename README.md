# I just didn't expect it to be so big

A multi-user homage to [xkcd 1110](http://xkcd.com/1110/).

Your browser must support WebSockets.

We recorded a [preview](http://www.youtube.com/watch?v=EvLxOVYeo5w).

All images are licensed under a Creative Commons Attribution-NonCommercial 2.5
License and based on similarly licensed work at
[xkcd.com](http://xkcd.com/license.html).  Everything else is licensed under
the [MPL 2.0](http://www.mozilla.org/MPL/2.0/)

## Running your own server

- Download and unpack node

- Configure and build node

    ```
    ./configure
    make
    ```

- Link node executable to bin dir

    ```ln -sf $(readlink node) ~/bin/node```

- Create npm script in ~/bin

    ```
    #!/bin/sh
    node "$HOME/node-v0.8.9/deps/npm/bin/npm-cli.js" "$@"
    ```

- In the source directory install ws module and dependencies (this will
  download and install ws and dependencies in node_modules/ sub-directory)

    ```
    npm install ws
    ```

- Run a normal web server to server the web files.

- Start the Node server (on port 8080)

    ```
    ./server.js
    ```

- Load the page. It will automatically connect to the same hostname at port
  8080.

- To change the port you must change both `server.js` (server) and `network.js`
  (client).
