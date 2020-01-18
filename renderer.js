// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const Discord = require('discord.js');
const Store = require('electron-store');
var request = require('request');
const store = new Store();
const client = new Discord.Client();

var friendCache = [];
var lastStatus = {};
let note;
/*
notifier.notify(
  {
    appID: 'DiscordTools',
    title: 'My awesome title',
    message: 'Hello from node, Mr. User!',
    //icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
    //sound: true, // Only Notification Center or Windows Toasters
    wait: false, // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait
    timeout: 1, // Takes precedence over wait if both are defined.
  },
  function(err, response) {
    // Response is response from notification
  }
);

notifier.on('timeout', function(notifierObject, options) {
  notifierObject.close();
});
*/
document.addEventListener("DOMContentLoaded", function(){
  //setTimeout(function() { n1.close.bind(n1) }, 1);
  //var n2 = new Notification("Hi there!");

  var client_panel = document.getElementById('client_panel')
  var login_overlay = document.getElementById('login_overlay')
  var in_login = document.getElementById('in_login')
  var frtable = document.getElementById('fr_table')

  var ch_on = document.getElementById('ch_on');
  var ch_dnd = document.getElementById('ch_dnd');
  var ch_idl = document.getElementById('ch_idl');
  var ch_off = document.getElementById('ch_off');

  ch_on.checked = ch_dnd.checked = ch_idl.checked = ch_off.checked = true;

  if (store.get('ch_on'))
    ch_on.checked = store.get('ch_on')
  if (store.get('ch_dnd'))
    ch_dnd.checked = store.get('ch_dnd')
  if (store.get('ch_idl'))
    ch_idl.checked = store.get('ch_idl')
  if (store.get('ch_off'))
    ch_off.checked = store.get('ch_off')

  ch_on.addEventListener('change', doCheck)
  ch_dnd.addEventListener('change', doCheck)
  ch_idl.addEventListener('change', doCheck)
  ch_off.addEventListener('change', doCheck)
  function doCheck(e) {
    console.log(e.target.id);
    store.set(e.target.id, e.target.checked);
  }

  in_login.addEventListener('keypress', (e) => {
    if (e.keyCode == 13) {
      loginClient(in_login.value);
    }
  })

  if (store.get('token'))
  {
    loginClient();
  } else {
    console.log('No token')
    //ipcRenderer.send('open-config', [e] )
    showLogin();
  }
  function loginClient(token) {
    client.login(token ? token : store.get('token')).catch(e => {
      if (token)
        store.set('token', token)
      console.log(e);
      showLogin();
    });
    client.on('ready', () => {
      if (token)
        store.set('token', token)

      document.title = client.user.tag + ' Status Notifier';

      /* XXX */
      showClient();
      console.log(`Logged in as ${client.user.tag}!`);



      getFriends().then(f => {


        friendCache = f.filter(fr => fr.type === 1);
        document.getElementById('fr_head').innerHTML = `${friendCache.length} friends`
        friendCache.forEach(friend => {
          var row = document.createElement('tr')
          row.classList.add('friend_row')
            var tag = document.createElement('td');
            tag.innerHTML = friend.user.username + '#' + friend.user.discriminator;
            //var statusCheck = document.createElement('td');
              //statusCheck.style.textAlign = 'center';
              //var statusCheckBox = document.createElement('input')
              //statusCheckBox.type = 'checkbox';
              //statusCheck.appendChild(statusCheckBox);

          row.appendChild(tag);
          //row.appendChild(statusCheck);
          frtable.appendChild(row)
        })
      })
    });

    client.on('presenceUpdate', (oldM, newM) => {

      if (! friendCache.find(friend => friend.user.id == oldM.user.id)) {
        return;
      }

      if (lastStatus[oldM.user.id])
      {
        if (oldM.presence.equals(lastStatus[oldM.user.id].old) &&
           newM.presence.equals(lastStatus[oldM.user.id].new)
        )
        return;
      }

      if (oldM.presence.status != newM.presence.status){


        console.log(newM.user.tag, oldM.presence.status + '=>' + newM.presence.status);

        if (newM.presence.status == 'online' && !ch_on.checked) return;
        if (newM.presence.status == 'idle' && !ch_idl.checked) return;
        if (newM.presence.status == 'dnd' && !ch_dnd.checked) return;
        if (newM.presence.status == 'offline' && !ch_off.checked) return;

         if (note)
           note.close.bind(note)
         var stat = newM.presence.status;
         if (stat == 'dnd') stat = 'do not disturb'
         note = new Notification(newM.user.tag,
         {
           body: stat,
           silent: true,
           icon: `https://cdn.discordapp.com/avatars/${newM.user.id}/${newM.user.avatar}.png`,
         });
         note.onclick = function(event) {
           if (newM.user.dmChannel)
            window.location = `discord://discordapp.com/channels/@me/${newM.user.dmChannel.id}/`;
          else {
            newM.user.createDM().then(dm => {
              window.location = `discord://discordapp.com/channels/@me/${dm.id}/`;
            }).catch(e => {
              console.log(e);
            })
          }
        }
      }

      lastStatus[oldM.user.id] = {
        old: oldM.presence.status,
        new: newM.presence.status
      }

      //if (newM.presence.status == 'online')
      {

      }
    })
  }
})

function getFriends()
{
  //https://discordapp.com/api/v6/users/@me/relationships
  return new Promise( (resolve, reject) => {
    request({
      url: `https://discordapp.com/api/v6/users/@me/relationships`,
      method: `get`,
      headers: {
        Authorization: store.get('token'),
      },
      json: true,
    }, function (error, response, body) {
      if (error) reject(error);

      resolve(body);
    });
  })
}
function showLogin()
{
  console.log('Showing login.')
  login_overlay.style.display = 'flex';
  client_panel.style.display = 'none';
  in_login.innerText = store.get('token')
}
function showClient()
{
  login_overlay.style.display = 'none';
  client_panel.style.display = 'flex';
}
