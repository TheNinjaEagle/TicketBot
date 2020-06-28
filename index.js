const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const keepAlive = require('./server');
const config = require('./botconfig');
const notTicket = ['711344897415708823','711335994825244723','711372178339266691','711344548709924864','711369128253980702','715044535725457468','719274078925619260'];

mysql = require("mysql");
var con = mysql.createPool({
    host: "remotemysql.com",
    user: "qfhvpazE4P",
    password: "aCnyhf1yHw",
    database: "qfhvpazE4P"
});

con.getConnection(function(err) {
    if (err) throw err;
    console.log("Connected to pool database!");
});

function deleteTicket(uid) {
    con.query(`DELETE FROM tickets WHERE channel = ${mysql.escape(uid)}`, (err, result) => {
        if (err) {
            throw err
        }
        console.log("Row Deleted");
    })
}

bot.on('message', message => {
    let args = message.content.substring(config.prefix.length).split(" ")

    switch (args[0]) {
        case 'website':
            message.channel.send('http://worldoffactions.tk/')
            break;

        case 'info':
            if (args[1] === 'version' || args[1] === 'v') {
                message.channel.send(config.version);
            } else {
                message.channel.send('Unknown Command :(')
            }
            break;

        case 'clear':
            if (!message.member.roles.cache.has('711335979255857152')) return message.reply("You aren't powerful enough to do that!")
            if (!args[1]) return message.reply('Error please define second arguement!')
            message.channel.bulkDelete(args[1]);
            break;

        case 'help':
            message.channel.send('`-new : creates a new ticket`')
    }
})

bot.on('ready', () => {
    console.log("Andrea has restarted and is ready to conquer the world.");
    bot.user.setActivity("-new", { type: "WATCHING"})
});

bot.on('message', message => {

  const withoutPrefix = message.content.slice(config.prefix.length);
	const split = withoutPrefix.split(/ +/);
	const command = split[0];
	const args2 = split.slice(1);

    function getUserFromMention(mention) {
      if (!mention) return;

      if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
          mention = mention.slice(1);
        }

        return bot.users.cache.get(mention);
      }
    }

    function addTicket(uid, name) {
        con.query('SELECT * FROM tickets WHERE uid=' + uid, function(err, row) {
            if (err) {
                logger.error('Error in DB');
                logger.debug(err);
            } else {
                if (row && row.length) {
                    message.author.send("You already have an open ticket!")
                } else {
                    let embed = new Discord.MessageEmbed();
                    embed.setTitle("Your ticket has been created!");
                    embed.setDescription("We would love to hear about your issue, please add all the context (images, video, plain old text) needed to explain the issue you are facing to the new text channel created in the support server.");
                    embed.setColor("#a83232");
                    embed.setTimestamp();
                    embed.setFooter('Ticket Bot System v-a1.0.0 June 2020');

                    message.author.send(embed)
                    let guild = message.guild;

                    guild.channels.create(`${message.author.username}/‘s Ticket`, {
                        type: 'text',
                        permissionOverwrites: [{
                                allow: 'VIEW_CHANNEL',
                                id: message.author.id
                            },
                            {
                                allow: 'VIEW_CHANNEL',
                                id: '711335979255857152'
                            },
                            {
                                deny: 'VIEW_CHANNEL',
                                id: guild.id
                            }
                        ]
                    }).then(ch => {
                        console.log("Created " + ch.name + " channel.");
                        con.query(`INSERT INTO tickets (uid,name,staff,channel) VALUES (${mysql.escape(uid)},${mysql.escape(name)},${mysql.escape("none")},${mysql.escape(ch.id)})`, (err) => {
                            if (err) {
                                throw err
                            }
                        });
                        bot.channels.cache.get(ch.id).send('<@&711335979255857152> a new ticket has been created')
                        return bot.channels.cache.get(ch.id).send(`<@${uid}> here is your ticket`)
                    }).catch(err => console.log(err));
                }
            }
        })
    }

    if (message.author.bot) return;

    if (message.content.toLowerCase() === '-new' && message.channel.id === '711344548709924864') {
      addTicket(message.author.id, message.author.username);
      return message.delete();
    }
    if (message.content.toLowerCase() === '-close') {
        let channelName = message.channel.name;
        let channelSlice = channelName.slice(-6);
        let ticketName = channelName.slice(0,-7);
        if (channelSlice === "ticket") {
            channelId = message.channel.id;
            message.channel.delete();
            setTimeout(function() {
              let closerName = message.author.username;
              bot.channels.cache.get('719274078925619260').send(`${closerName} closed ${ticketName} ticket`, { files: [`./transcripts/${channelId}.txt`] });
            }, 3000)
            deleteTicket(message.channel.id)
            
        }
    }

    if (message.content.toLowerCase() === '-claim' && message.member.roles.cache.has('711335979255857152')) {
        con.query('SELECT * FROM tickets WHERE channel=' + message.channel.id, function(err, row) {
            if (err) {
                logger.error('Error in DB');
                message.author.send("Sorry, there was an error in the database, please message a staff member if this occurs multiple times.")
                logger.debug(err);
            } else {
                if (row && row.length) {
                    if (row[0].staff == "none") {
                        con.query(`UPDATE tickets SET staff = ${mysql.escape(message.author.id)} WHERE channel = ${mysql.escape(message.channel.id)}`, (err) => {
                            if (err) {
                                throw err
                            }
                        });
                    }
                    var channel = message.channel.id;
                    message.channel.updateOverwrite('711335979255857152', {
                        VIEW_CHANNEL: false
                    });
                    message.channel.updateOverwrite(message.author.id, {
                        VIEW_CHANNEL: true
                    });
                    message.channel.updateOverwrite(row[0].uid, {
                        VIEW_CHANNEL: true
                    });
                    message.channel.updateOverwrite('711335975883767848', {
                        VIEW_CHANNEL: true
                    });
                } else {

                }
            }
        })
    }

    if (message.content.startsWith('-add') && message.member.roles.cache.has('711335979255857152')) {
      if (args2[0]) {
      const user = getUserFromMention(args2[0]);
      if (!user) {
        return message.reply('Please use a proper mention');
      }
      message.channel.updateOverwrite(user, {
        VIEW_CHANNEL: true
      });
      return message.channel.send(`I got you boss, I added ${user} to the ticket!`);
    }

    return message.reply('Please use a proper mention');
    }

    if (message.channel.id === '711344548709924864') message.delete();



if (message.content.startsWith('-remove') && message.member.roles.cache.has('711335979255857152')) {
      if (args2[0]) {
      const user = getUserFromMention(args2[0]);
      message.channel.updateOverwrite(user, {
        VIEW_CHANNEL: false
      });
       message.channel.send(`On it boss, I removed ${user} from the ticket!`);
    }
    }

    if (message.channel.id === '711344548709924864') return message.delete();

    if (!notTicket.includes(message.channel.id)) {
      let messageVar = `${message.author.username}:\n${message.content}\n\n`;
      fs.appendFile(`transcripts/${message.channel.id}.txt`, messageVar, function(err){
        if(err) throw err;
      });
    }

})

keepAlive();

bot.login(config.token);