var ws, clientId = PUBNUB.uuid().split('-')[0], allAvatars={}, connected, netDebug = 5;

// hackernews mitigation by PUBNUB:
serverURI = "ws://pubsub.pubnub.com/09e02e4d-5508-44fb-a615-8da69289b73c/a71204b3-ca89-11df-ba32-cfcef4a2b967/xkcd"

window.addEventListener('load', function () {
  console.log("Connecting to server:" + serverURI);
  ws = new WebSocket(serverURI);
  ws.onopen = function () {
    console.log("WebSocket connection established");
    connected = true;
  };
  ws.onmessage = function (e) {
    mps++;
    if (netDebug > 0) {
      console.log("WebSocket message received: ", JSON.stringify(e.data));
      netDebug--;
    }
    connected = true;
    var now = (new Date()).getTime();
    var msg = e.data;
    if(msg.id) {
      if (!(msg.id in allAvatars)) allAvatars[msg.id] = {
        "id":msg.id,"skin":"sticky","x":-595,"y":-1503.7,"dx":0,"dy":-0.008,"msg":""
      };
      $.extend(allAvatars[msg.id], msg);
        allAvatars[msg.id]._last_update = now;
      //allAvatars[msg.id] = msg;
    } else if (msg.all) {
      allAvatars = msg.all;
      for (var id in msg.all) {
      }
    } else if (msg["delete"]) {
      delete allAvatars[msg["delete"]];
    } else if (msg.change) {
        for (var id in msg.change) {
            $.extend(allAvatars[id], msg.change[id]);
            allAvatars[id]._last_update = now;
            if(msg.change[id].skin) {
              allAvatars[id]._skinUpdate = now;
            }
        }
    } else {
        console.error("Unrecognized message type: ", msg);
    }
  };
  ws.onerror = function (e) {
    console.log("WebSocket error:", e);
  };
  ws.onclose = function (e) {
    var msg = $('#message')[0];
    msg.style.background = "#fe8";
    connected = false;
    //console.log("WebSocket connection closed:", e, e);
    if (e.code === 1008 || e.code === 1009) {
      msg.innerHTML = "Disconnected from server"
      if (e.reason) {
        msg.innerHTML += ": " + e.reason;
      }
      msg.innerHTML += "<br>You can also run your own server. " +
          "Get the code <a href='https://github.com/n01se/1110'>on github</a>.<br>" +
          "Or <a href='http://www.youtube.com/watch?v=EvLxOVYeo5w'>watch a preview</a>";
    } else {
      msg.innerHTML = "No connection to server";
    }
  };
});
