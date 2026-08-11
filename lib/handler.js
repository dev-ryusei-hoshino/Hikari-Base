const config = require("../config.js");
const chalk = require("chalk");

function getDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => []);
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
}

function findClosest(input, list) {
  let closest = null;
  let minDistance = Infinity;
  for (const item of list) {
    const dist = getDistance(input, item);
    if (dist < minDistance) {
      minDistance = dist;
      closest = item;
    }
  }
  return minDistance <= 2 ? closest : null;
}

async function handleMessage(conn, msg) {
  try {
    const isMe = msg.key.fromMe;

    if (!msg.message) return;
    if (config.ignore_self && isMe) return;

    const mess =
      msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    if (!mess) return;

    const remoteJid = msg.key.remoteJid || "";
    const isGroup = remoteJid.endsWith("@g.us");
    const isChannel = remoteJid.endsWith("@newsletter");
    const isBroadcast =
      remoteJid === "status@broadcast" || msg.broadcast === true;
    const isPrivate = !isGroup && !isChannel && !isBroadcast;

    let isAdmin = false;
    let isBotAdmin = false;
    let isOwner = false;
    let isCmd = false;
    let usedPrefix = "";
    let command = "";
    let args = [];

    const m = {
      key: msg.key,
      message: msg.message,
      react: async (emoji) => {
        await conn.sendMessage(remoteJid, {
          react: { text: emoji, key: msg.key },
        });
      },
      reply: async (teks) => {
        await conn.sendMessage(remoteJid, { text: teks }, { quoted: msg });
      },
    };

    const ids = [
      m.key.participant,
      m.key.participantAlt,
      m.key.remoteJid,
      m.key.remoteJidAlt,
    ];

    let senderLid = ids.find((id) => id && id.includes("@lid"));
    let senderJid = ids.find((id) => id && id.includes("@s.whatsapp.net"));
    let jid =
      isGroup || isChannel || isBroadcast ? remoteJid : senderJid || remoteJid;

    const rawBotJid = conn.user.id;
    const botPfp = await conn.profilePictureUrl(rawBotJid);
    const botLid = conn.user.lid;
    const botJid = rawBotJid ? rawBotJid.split(":")[0] + "@s.whatsapp.net" : "";
    let formattedLid = senderLid;
    const botNumber = rawBotJid ? rawBotJid.split(":")[0] : "";

    if (isMe) {
      senderLid = botLid || senderLid;
      senderJid = botJid || senderJid;
    }

    if (isGroup) {
      const groupMetadata = await conn.groupMetadata(remoteJid);
      const participants = groupMetadata.participants;

      if (!senderJid && senderLid) {
        const pData = participants.find((p) => p.id === senderLid);
        if (pData && pData.phoneNumber) {
          senderJid = pData.phoneNumber + "@s.whatsapp.net";
        }
      }

      const checkAdmin =
        participants.find((p) => p.id === senderLid) ||
        participants.find((n) => n.id === senderJid);

      isAdmin =
        checkAdmin?.admin === "admin" || checkAdmin?.admin === "superadmin";

      const checkBotAdmin =
        participants.find((p) => p.id === botLid) ||
        participants.find((n) => n.id === botJid);

      isBotAdmin =
        checkBotAdmin?.admin === "admin" ||
        checkBotAdmin?.admin === "superadmin";
    }

    const senderNumber = senderJid
      ? senderJid.replace("@s.whatsapp.net", "")
      : "";
    const senderName = msg.verifiedBizName || msg.pushName || "Unknown";
    if (senderNumber === config.bot.owner.number) isOwner = true;
    const prefixes = config.bot.prefix;

    let type;
    if (isGroup) {
      type = chalk.green("[GROUP]");
    } else if (isPrivate) {
      type = chalk.red("[PRIVATE]");
    } else if (isBroadcast) {
      type = chalk.yellow("[BROADCAST]");
    } else {
      type = chalk.magenta("[UNKNOWN]");
    }

    if (config.auto_read) await conn.readMessages([m.key]);

    const text = `[🔔] ${chalk.cyan(`New Message!`)}
  type: ${type}
  from: ${chalk.gray(senderNumber)}
  name: ${chalk.yellow(senderName)}
  ${chalk.yellow(">")} ${mess}\n`;

    if (!isChannel) console.log(text);

    for (const p of prefixes) {
      if (mess.startsWith(p)) {
        isCmd = true;
        usedPrefix = p;
        break;
      }
    }

    if (isCmd) {
      const splitMsg = mess.slice(usedPrefix.length).trim().split(/ +/);
      command = splitMsg.shift().toLowerCase();
      args = splitMsg;
    }

    if (isCmd) {
      const ctx = {
        conn,
        msg,
        m,
        botPfp,
        args,
        jid,
        isOwner,
        isAdmin,
        isBotAdmin,
        senderName,
        remoteJid,
        usedPrefix,
        command,
      };

      const { runCommand } = require("./commands");
      await runCommand(command, ctx);
    }
  } catch (error) {
    console.error("Error handling message:", error);
  }
}

module.exports = { handleMessage };
