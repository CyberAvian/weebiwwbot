require('dotenv').config();
const tmi = require('tmi.js');
const fs = require('fs');
const owospeak = require('owospeak');
const channelsJson = require('./channels.json');
const greetingsJson = require('./greetings.json');

var channels = channelsJson.channels;
var greetings = greetingsJson.greetings;
const acceptJoin = owospeak.convert('I have joined your channel!!', {stutter: true, tilde: true});
var defaultDelay = 30;
var sendGreeting = false;

// Define configuration options
const opts = {
  identity: {
    username: 'weebiwwbot',
    password: process.env.TWITCH_OAUTH_TOKEN
  },
  channels: channels
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('join', onJoinHandler);

// Connect to Twitch:
client.connect();

var delay = 0;

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot
  var username = context.username;
  const argument = msg.trim().split(' ');
  const commandName = argument[0];
  const commandText = argument.slice(1).join(' ');

  if (context.username === 'buttsbot') {
    var sassMessage = owospeak.convert('Nobody asked you, buttbot!', {stutter: true, tilde: true});
    console.log(`Sent ${sassMessage} to buttsbot`);
    client.say(target, sassMessage);
  }

  switch (commandName) {
    case '!join':
      if (target === '#weebiwwbot') {
        channelName = `#${username}`;
        if(username !== 'weebiwwbot' && !channels.includes(channelName)) {
          client.join(channelName);
          console.log(`Joined ${username}'s channel.`);
          client.say(target, `@${username}, ${acceptJoin}`);
          channels.push(channelName);
          saveChannels(`Added ${username} to channel list`);
        } else {
          console.log(`Unable to join ${username}`);
          const owomessage = owospeak.convert('I am unable to join your channel!', {stutter: true, tilde: true});
          client.say(target, `@${username}, ${owomessage}`);
        }
      }
      break;
    case '!leave':
      if (target === '#weebiwwbot') {
        if(username !== 'weebiwwbot' && !channels.includes(username)) {
          var channelName = `#${username}`;
          client.part(channelName);
          console.log(`Left ${username}'s channel.`);
          channels = channels.filter(channel => channel !== channelName);
          saveChannels(`Removed ${channelName} from channel list`);
          const owomessage = owospeak.convert('I have left your channel. I will miss you!!!!', {stutter: true, tilde: true});
          client.say(target, `@${username}, ${owomessage}`);
        }
      }
      break;
    case '!uwu':
      if (commandText.length > 0) {
        try {
          var uwuMessage = owospeak.convert(commandText, {stutter: true, tilde: true});
          client.say(target, uwuMessage)
          console.log(`Sent ${uwuMessage} to ${target}`); 
        }
        catch (err) {
          console.log(err);
        }
      }
      break;
    default:
      if (delay === 0 && msg !== '') {
        const owomessage = owospeak.convert(msg, {stutter: true, tilde: true});
        client.say(target, owomessage);
        console.log(`Sent ${owomessage} to ${target}`);
        setDelay();
      } else if (msg !== '') {
        delay -= 1;
      } else {
        console.log('No message sent.');
      }
  }
  console.log(`Target: ${target} | Username: ${context.username} | Message: ${msg} | Delay: ${delay}`);
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function onJoinHandler (channel, username, self) {
  if (self) {
    console.log(`Joined ${channel}`);
    current_channel = channel.replace('#', '');
    setDelay();
    if (sendGreeting) {
      var randomNumber = Math.floor(Math.random() * (greetings.length - 1));
      var greeting = owospeak.convert(greetings[randomNumber], {stutter: true, tilde: true});
      client.say(channel, greeting);
      console.log(`Greeted ${channel}`);
    }
  }
}

function saveChannels (message) {
  var json = JSON.stringify(channelsJson, null, 2);
  fs.writeFile('./channels.json', json, (err) => {
    if (err) {
      console.log(err);
    }
    else {
      console.log(message);
    }
  });
}

function setDelay () {
  var randomNumber = Math.random();
  var increaseCount = randomNumber < 0.5;
  var modifyDelay = Math.floor(Math.random() * 10);
  delay = increaseCount ? defaultDelay + modifyDelay : defaultDelay - modifyDelay;
  console.log(`Setting Delay | Random Number: ${randomNumber} | Increase Count? ${increaseCount} | Modification: ${modifyDelay} | Delay: ${delay}`);
}
