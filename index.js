require("dotenv").config()
const mineflayer = require("mineflayer")
const Hypixel = require("hypixel-api-reborn")
const hypixel = new Hypixel.Client(process.env.HYPIXEL_API_KEY)


const bot = mineflayer.createBot({
    host: "hypixel.net",
    version: "1.8.9",
    username: "HangSean",
    auth: "microsoft"
})

const authorized_users = ["ezbedwars", "subtotals", "ohyami"]
const prefix = '.'
const ranks = ["mvp", "vip", "youtube"]



// bot.on('spawn', () => {
//     bot.chat("Hello I am bot")
// })

function isdm(message) {
    return (message.startsWith("From") && message.includes(":"))
}

function findDmSender(message) {
    var s = ""
    message = message.toLowerCase().split(":")[0].replace("from", "").replace("[", "").replace("]", "").replace("++", "").replace("+", "")
    for (var rank = 0; rank < ranks.length; rank++) {
        message = message.replace(ranks[rank], "")
    }
    message = message.trim()
    return message
}

function isLobbyJoinMessage(message) {
    return (message.endsWith(' the lobby!') || message.endsWith(' the lobby! <<<')) && message.includes('[MVP+')
}

function isPartyInvite(message) {
    return (message.includes("has invited you to join their party!\nYou have 60 seconds to accept. Click here to join!\n"))
}

function getNameFromPartyInvite(message) {
    message = message.toLowerCase().split("\n")[1].replace("has invited you to join their party!", "").replace("++", "").replace("+", "").replace("[", "").replace("]", "")
    for (var rank = 0; rank<ranks.length; rank++) {
        message = message.replace(ranks[rank], "")
    }
    return message.trim()
}

function sleepFor(sleepDuration){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ 
        /* Do nothing */ 
    }
}




bot.once('spawn', () => {
    bot.chat("\u00a7")
})

bot.on('message', ((jsonMsg, position) => {
    const message = jsonMsg.toString().trim()
    console.log(`CHATMESSAGE: ${jsonMsg}`)
    if (isdm(message)) {
        const sender = findDmSender(message)
        console.log(sender)
        if (!sender in authorized_users) return
        if (message.includes(prefix)) {
            const name = message.split(".")[1].split(" ")[0]
            hypixel.getPlayer(name).then(player => {
                const bedwarsStats = player.stats.bedwars
                bot.whisper(sender, `[${bedwarsStats.level}★] ${player.nickname} FKDR: ${bedwarsStats.finalKDRatio} WLR: ${bedwarsStats.WLRatio} BBLR: ${bedwarsStats.beds.BLRatio}`)
                return
            }).catch(e => {
                if (e.message === Hypixel.Errors.PLAYER_DOES_NOT_EXIST) {
                    bot.whisper(sender, "This is not a valid minecraft account.")
                    return
                } else if (e.name === "TypeError") {
                    bot.whisper(sender, "Could not find stats for that player.")
                    return
                }
                console.log(e)
                bot.whisper(sender, "An error has occoured")
            })
        } else if (message.includes("sc")) {
            console.log("sda")
            const command = message.split('sc')[1].trim().replace("/", "")
            console.log(command)
            bot.chat(`/${command}`)
        }
    } else if (isPartyInvite(message)) {
        const sender = getNameFromPartyInvite(message)
        if (!sender in authorized_users) return
        bot.chat(`/p accept ${sender}`)
        sleepFor(1000)
        bot.chat("/pc party coming soon need to get list of players ")
        sleepFor(1000)
        bot.chat("/p leave")
    }

}))

// bot.on('whisper', (username, message, translate, jsonMsg, matches) => {
//     console.log("whispewrhappened")
//     if (!username in authorized_users) return
//     if (message.startsWith(prefix)) {
//         message = message.replace(prefix, '')
//         hypixel.getPlayer(message.split(" ")[0]).then(player => {
//             const bedwarsStats = player.stats.bedwars
//             bot.whisper(username, `[${bedwarsStats.level}★] ${player.nickname} FKDR: ${bedwarsStats.finalKDRatio} WLR: ${bedwarsStats.WLRatio} BBLR: ${bedwarsStats.beds.BLRatio}`)
//             return
//         }).catch(e => {
//             if (e.message === Hypixel.Errors.PLAYER_DOES_NOT_EXIST) {
//                 bot.whisper(username, "player not found")
//                 return
//             } else if (e.name === "TypeError") {
//                 bot.whisper(username, "Stats not found for that player.")
//                 return
//             }
//             bot.whisper(username, "there was an error")
//             console.error(e)
//         })

//     }
// })