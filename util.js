const { faker } = require("@faker-js/faker");

const { v4: uuidv4 } = require("uuid");

var calltype = ["missed", "auto-failed", "auto-drop", "dispose"];
var dispose_type = ["callback", "dnc", "etx"];
var dispose_name = ["followup", "do not call", "external transfer"];
var reasons = [
  "busy everywhere",
  "decline",
  "does not exist anywhere",
  "not acceptable",
];
var agentname = [
  "rohit",
  "sahil",
  "anupam",
  "ajay",
  "pradeep",
  "lakshadweep",
  "ayush",
];
var campaign_name = ["transactions", "securities"];
var process_name = [
  "collections",
  "fund transfers",
  "watchable",
  "allocations",
];

var states = ["hold", "mute", "conference"];

var ringingState = "ringing";
var callState = "call";
var transferState = "transfer";

function checkCallTypeSetDispose(calltype) {
  var disposedata = {};

  disposedata["agent_name"] = faker.helpers.arrayElement(agentname);
  disposedata["reference_uuid"] = uuidv4();
  disposedata["customer_uuid"] = uuidv4();

  if (calltype === "dispose") {
    disposedata["dispose_name"] = faker.helpers.arrayElement(dispose_name);
    if (disposedata["dispose_name"] === "followup") {
      disposedata["dispose_type"] = "callback";
      disposedata["agent_name"] = "";
      disposedata["reference_uuid"] = "";
    } else if (disposedata["dispose_name"] === "do not call") {
      disposedata["dispose_type"] = "dnc";
    }
    if (disposedata["dispose_name"] === "external transfer") {
      disposedata["dispose_type"] = "etx";
    }
  }
  if (calltype === "missed") {
    disposedata["dispose_name"] = "agent not found";
    disposedata["agent_name"] = null;
    disposedata["reference_uuid"] = null;
  }
  if (calltype == "auto-failed" || calltype == "auto-drop") {
    disposedata["dispose_name"] = faker.helpers.arrayElement(reasons);
    disposedata["customer_uuid"] = null;
  }
  return disposedata;
}

function getRandomState(calltype) {
  var randomstates = [];
  var disposedata = checkCallTypeSetDispose(calltype);
  if (
    calltype == "missed" ||
    calltype == "auto-failed" ||
    calltype == "auto-drop"
  ) {
    randomstates.push(ringingState, "");
  } else {
    if (disposedata.dispose_type === "etx") {
      randomstates.push(transferState);
    }
    for (i = 1; i <= Math.floor(Math.random() * 2) + 1; i++) {
      randomstates.push(states[Math.floor(Math.random() * states.length)]);
    }
    randomstates.push(callState, ringingState);
  }

  var timedRandomStates = addSecondsToState(randomstates);
  disposedata["states"] = timedRandomStates;
  return disposedata;
}

function addSecondsToState(randomstates) {
  var newTimedStates = {};
  if (!randomstates == "") {
    for (i = 0; i < randomstates.length; i++) {
      if (randomstates[i] == "call") {
        newTimedStates[randomstates[i]] = Math.floor(Math.random() * 300) + 100;
      } else if (randomstates[i] == "conference") {
        newTimedStates[randomstates[i]] = Math.floor(Math.random() * 120) + 1;
      } else if (randomstates[i] == "") {
        newTimedStates[randomstates[i]] = 0;
      } else {
        newTimedStates[randomstates[i]] = Math.floor(Math.random() * 20) + 1;
      }
    }
  }
  return newTimedStates;
}

function addAllStates(calltype) {
  var disposedata = getRandomState(calltype);
  disposedata["calltype"] = calltype;
  var onlystates = Object.values(disposedata.states);
  var totalCallTime = 0;
  var onlykey = Object.keys(disposedata.states);

  for (i = 0; i < onlystates.length; i++) {
    if (onlykey[i] === "ringing") {
      continue;
    }
    totalCallTime += onlystates[i];
  }
  disposedata["totalCallTime"] = totalCallTime;
  console.log(onlystates);
  return disposedata;
}

async function newFunc() {
  var newCall = {};
  var alldata = addAllStates(
    calltype[Math.floor(Math.random() * calltype.length)]
  );
  newCall["callid"] = uuidv4();
  newCall["callstart"] = new Date();
  newCall["calltype"] = alldata.calltype;
  newCall["dispose_type"] = alldata.dispose_type;
  newCall["dispose_name"] = alldata.dispose_name;
  newCall["duration"] = alldata.totalCallTime;
  newCall["agentname"] = alldata.agent_name;
  newCall["campaign_name"] = faker.helpers.arrayElement(campaign_name);
  newCall["process_name"] = faker.helpers.arrayElement(process_name);
  newCall["leadset"] = Math.floor(Math.random() * 10) + 1;
  newCall["reference_uuid"] = alldata.reference_uuid;
  newCall["customer_uuid"] = alldata.customer_uuid;
  newCall["hold"] = alldata.states.hold;
  newCall["mute"] = alldata.states.mute;
  newCall["ringing"] = alldata.states.ringing;
  newCall["conference"] = alldata.states.conference;
  newCall["transfer"] = alldata.states.transfer;
  newCall["call"] = alldata.states.call;
  newCall["dispose_time"] = alldata.states.call
    ? Math.floor(Math.random() * 10) + 1
    : 0;

  return newCall;
}

module.exports = newFunc;
