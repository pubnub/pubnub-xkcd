var ws, allAvatars={}, connected,
    serverURI,// = "ws://" + window.location.hostname + ":8080",
    netDebug = 0;

// PUBNUB:
serverURI = "ws://pubsub.pubnub.com/demo/demo/xkcd";

window.addEventListener('load', function () {
  console.log("Connecting to server:" + serverURI);
  ws = new WebSocket(serverURI);
  //ws = new WebSocket("ws://localhost:8080");
  ws.onopen = function () {
    console.log("WebSocket connection established");
    connected = true;
  };
  ws.onmessage = function (e) {
    if (netDebug > 0) {
      console.log("WebSocket message received: ", e.data);
      netDebug--;
    }

    connected = true;
    var now = (new Date()).getTime();
    console.log('!!!!!!!!!!!!!!!!!!!');
    e&&e.data&&console.log(JSON.stringify(e.data));
    console.log('!!!!!!!!!!!!!!!!!!!');

    var msg = e.data;
    if(msg.id) {
      allAvatars[msg.id] = msg;
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
    console.log("WebSocket connection closed:", e, e);
    if (e.code === 1008 || e.code === 1009) {
      msg.innerHTML = "Disconnected from server"
      if (e.reason) {
        msg.innerHTML += ": " + e.reason;
      }
    } else {
      msg.innerHTML = "No connection to server";
    }
  };
});
