require("dotenv").config()
const mineflayer = require("mineflayer")
const axios = require('axios')
const { Client, getBedwarsLevelInfo, getSkyWarsLevelInfo } = require("@zikeji/hypixel")
const client = new Client(process.env.HYPIXEL_API_KEY)

//TODO: AWAIT EVERYTHING

const botoptions = {
    host: "hypixel.net",
    version: "1.8.9",
    username: "HangSean",
    auth: "microsoft"
}

//const bot = mineflayer.createBot(botoptions)

const authorized_users = ["ezbedwars", "subtotals", "ohyami", "hangseans"]
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

function isEmpty(obj) {
    return Object.keys(obj).length === 0
}

async function getUuid(playerName) {
    const res = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${playerName}`)
    const data = res.data
    if (res.status === 204){
        throw new Error("Player not found.")
    } else if (!res.status === 200) {
        throw new Error(res.data)
    }else {
        return data.id
    }

    
}

const initbot = () => {

    let bot = mineflayer.createBot(botoptions)

    bot.on('end', () => {
        console.log("Disconnected")

        setTimeout(initbot, 5000)
    })

    bot.on('error', (err) => {
        if (err.code === "ECONNRESET"){
            console.log("Bro wifi went out again")
            return
        } else {
            console.error(`Unhandled error: ${err}`)
            return
        }
    })

    bot.once('spawn', async () => {
        await bot.chat("\u00a7")
    })
    
    bot.on('message', (async (jsonMsg, postion) => {
        const message = jsonMsg.toString().trim()
        console.log(`CHATMESSAGE: ${message}`)
        if (isLobbyJoinMessage(message)) {
            await bot.chat("\u00a7")
            return
        } else if (isdm(message)) { 
            const sender = findDmSender(message)
            console.log(sender)
            if (!sender in authorized_users) return
            if (message.includes(prefix)) {
                const name = message.split(prefix)[1].split(" ")[0]
                const uuid = await getUuid(name)
                .catch(async e => {
                    if (e.message === "Player not found."){
                        await bot.whisper(sender, "Player not found.")
                        return
                    } else {
                        console.error(e)
                        await bot.whisper(sender, "An error has occured")
                        return
                    }
                })
                if (!uuid) return
                const player = await client.player.uuid(uuid)
                if (isEmpty(player)){
                    await bot.whisper(sender, "Player has never logged into hypixel.")
                    return
                }
                const args = message.split(name)[1].toLowerCase().trim().split(" ")
                const available_args = ["bw", "bedwars", "sw", "skywars"]
                if (!available_args.includes(args[0])) {args[0] = ""}
                if (args[0] === "bw" || args[0] === "bedwars" || args[0] === "") {
                    try {
                        const bedwarsLevelInfo = getBedwarsLevelInfo(player)
                        const bedwarsStats = player.stats.Bedwars
                        let fkdr, wlr, bblr
                        if (bedwarsStats.final_deaths_bedwars === 0) {
                            fkdr = bedwarsStats.final_kills_bedwars
                        }else {
                            fkdr = Math.round((bedwarsStats.final_kills_bedwars / bedwarsStats.final_deaths_bedwars) * 100) / 100
                        }
                        if (bedwarsStats.losses_bedwars === 0) {
                            wlr = bedwarsStats.wins_bedwars
                        }else {
                            wlr = Math.round((bedwarsStats.wins_bedwars / bedwarsStats.losses_bedwars) * 100) / 100
                        }
                        if (bedwarsStats.beds_lost_bedwars === 0) {
                            bblr = bedwarsStats.beds_broken_bedwars
                        }else {
                            bblr = Math.round((bedwarsStats.beds_broken_bedwars / bedwarsStats.beds_lost_bedwars) * 100) / 100
                        }
                        await bot.whisper(sender, `\n[${bedwarsLevelInfo.level}★] ${player.displayname} FKDR: ${fkdr} WLR: ${wlr} BBLR: ${bblr}`)
                        return
                    } catch(error) {
                        if(error.name == "TypeError") {
                            await bot.whisper(sender, "Could not find bedwars info for that user.")
                            return
                        } else {
                            await bot.whisper(sender, "An error has occured")
                            console.error(error)
                            return
                        }
                    }
                }else if (args[0] === "sw" || args[0] === "skywars") {
                    try {
                        const skywarsLevelInfo = getSkyWarsLevelInfo(player)
                        const skywarsStats = player.stats.SkyWars
                        let kdr, wlr
                        if (skywarsStats.losses === 0) {
                            wlr = skywarsStats.wins
                        } else {
                            wlr = Math.round((skywarsStats.wins / skywarsStats.losses) * 100) / 100
                        }
                        if (skywarsStats.deaths === 0) {
                            kdr = skywarsStats.kills
                        } else {
                            kdr = Math.round((skywarsStats.kills / skywarsStats.deaths) * 100) / 100
                        }
                        await bot.whisper(sender, `\n[${skywarsLevelInfo.level}★] ${player.displayname} KDR: ${kdr} WLR: ${wlr}`)
    
                    } catch (error) {
                        if(error.name == "TypeError") {
                            await bot.whisper(sender, "Could not find bedwars info for that user.")
                            return
                        } else {
                            await bot.whisper(sender, "An error has occured")
                            console.error(error)
                            return
                        }
                    }
                }
    
                
            }
        } else if (isPartyInvite(message)) {
            const sender = getNameFromPartyInvite(message)
            await bot.chat(`/p accept ${sender}`)
            await bot.waitForTicks(20)
            await bot.chat("/pc COMING SOON")
            await bot.waitForTicks(20)
            await bot.chat("/p leave")
        }
    }))
    
}

initbot()



