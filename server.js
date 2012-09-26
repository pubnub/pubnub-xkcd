#!/usr/bin/env node

"use strict";

var maxClients = 20,
    maxMsgLength = 500,
    WebSocketServer = require('ws').Server,
    wss = new WebSocketServer( {host: '0.0.0.0', port: 8080}),
    clients = {}, clientData = {}, nextId = 1;

function log(msg) { console.log(Date() + ": " + msg); }
function warn(msg) { console.warn(Date() + ": " + msg); }
function error(msg) { console.error(Date() + ": " + msg); }

function sendOne (clientId, data) {
    var json = JSON.stringify(data);
    try {
        clients[clientId].send(json);
    } catch (e) {
        log("Failed to send to client ID " + clientId);
    }
}

function sendAll (data) {
    var json = JSON.stringify(data);
    for (var i in clients) {
        try {
            clients[i].send(json);
        } catch (e) {
            log("Failed to send to client ID " + i);
        }
    }
}

function tooManyClients(client, clientId) {
    warn("Too many clients, disconnecting client " +
            clientId ? clientId : "");
    client.close(1008, "Too many clients, try again later");
}

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

    sendOne(clientId, {"id": clientId});
    sendAll({"all": clientData});

    client.on('close', function() {
        warn("Client ID " + clientId + " disconnected");
        delete clients[clientId];
        delete clientData[clientId];
        log("Current number of clients: " + Object.keys(clients).length);
        sendAll({"delete": clientId});
    });

    client.on('message', function(message) {
        var data;
        //log("Received message from client ID " + clientId + ": " + message);
        if (message.length > maxMsgLength) {
            error(
                "client " + clientId + " sent oversize "
                + message.length + " byte message ");
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
        clientData[clientId] = data;
        var obj = {};
        obj[clientId] = data;
        sendAll({"change": obj});
    });
});

