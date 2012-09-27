#!/usr/bin/env node

"use strict";

var maxClients = 20,
    maxMsgLength = 500,
    pushInterval = 75,
    port = process.argv[2] ? parseInt(process.argv[2],10) : 8080,
    WebSocket = require('ws'), WebSocketServer = WebSocket.Server,
    wss = new WebSocketServer( {host: '0.0.0.0', port: port}),
    clients = {}, clientData = {}, nextId = 1,
    changes = {};

function log(msg) { console.log(Date() + ": " + msg); }
function warn(msg) { console.warn(Date() + ": " + msg); }
function error(msg) { console.error(Date() + ": " + msg); }

function removeClient(clientId) {
    if (clients[clientId]) {
        warn("Removing Client ID " + clientId);
        delete clients[clientId];
        delete clientData[clientId];
        delete changes[clientId];
        log("Current number of clients: " + Object.keys(clients).length);
        sendAll(JSON.stringify({"delete": clientId}));
    }
};

function sendOne (clientId, json) {
    var client = clients[clientId];
    if (client) {
        try {
            if (client.readyState === WebSocket.OPEN) {
                client.send(json);
            }
        } catch (e) {
            log("Failed to send to client ID " + clientId);
            removeClient(clientId);
        }
    }
}

function sendAll (json) {
    var clientIds = Object.keys(clients), clientId;
    for (var i = 0; i < clientIds.length; i++) {
        clientId = clientIds[i];
        sendOne(clientId, json);
    }
}

function tooManyClients(client, clientId) {
    warn("Too many clients, disconnecting client " +
         (clientId ? clientId : ""));
    client.close(1008, "Too many clients, try again later");
}

setInterval(function () {
  if (Object.keys(changes).length > 0) {
      sendAll(JSON.stringify({"change": changes}));
  }
  changes = {};
}, pushInterval);

wss.on('connection', function(client) {
    var numClients = Object.keys(clients).length+1;

    if (numClients > maxClients) {
        tooManyClients(client);
        return;
    }

    var clientId = nextId;
    nextId++;
  
    clients[clientId] = client;
    clientData[clientId] = {};
    log("New client ID: " + clientId);
    log("Current number of clients: " + numClients);

    sendOne(clientId, JSON.stringify({"id": clientId}));
    sendAll(JSON.stringify({"all": clientData}));

    client.on('close', function() {
        warn("Client ID " + clientId + " disconnected");
        removeClient(clientId);
    });

    client.on('message', function(message) {
        var data;
        //log("Received message from client ID " + clientId + ": " + message);
        if (message.length > maxMsgLength) {
            error("client " + clientId + " sent oversize " + message.length + " byte message ");
            client.close(1009, "Message length too long");
            return;
        }
        else if(message == "testTooManyClients") { // for testing
            log("received testTooManyClients from client " + clientId);
            tooManyClients(client, clientId);
            return;
	} 
        try {
            data = JSON.parse(message);
        } catch (e) {
            error("failed to parse client " + clientId + " message: " + message);
            return;
        }
        if (!changes[clientId]) {
            changes[clientId] = {};
        }
        for(var key in data) {
            clientData[clientId][key] = data[key];
            changes[clientId][key] = data[key];
        }
    });
});

