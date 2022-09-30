const mineflayer = require("mineflayer")
const Hypixel = require("hypixel-api-reborn")
const hypixel = new Hypixel.Client("ddccdbd4-4375-4204-b42b-59bab8c0d8e0")


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