const {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys");
const Pino = require("pino");
const readline = require("readline");
const { handleMessage } = require("./lib/handler");
const fs = require("fs");
const chalk = require("chalk");
const QRCode = require("qrcode-terminal");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const config = require("./config");
const packageFile = require("./package.json");

const sessionDir = "hikari_sessions";
let conn = null;
let reconnectTimer = null;
let reconnecting = false;

function validatePhoneNumber(input) {
  const cleaned = input.trim();
  if (!cleaned) throw new Error("Phone number cannot be empty.");

  let phoneNumber = parsePhoneNumberFromString(cleaned, "ID");

  if (!phoneNumber || !phoneNumber.isValid()) {
    const digits = cleaned.replace(/[^0-9]/g, "");
    if (digits.startsWith("0")) {
      phoneNumber = parsePhoneNumberFromString("62" + digits.slice(1), "ID");
    } else if (digits.startsWith("62")) {
      phoneNumber = parsePhoneNumberFromString("+" + digits, "ID");
    } else {
      phoneNumber = parsePhoneNumberFromString(cleaned);
    }
  }

  if (!phoneNumber || !phoneNumber.isValid()) {
    throw new Error(
      "Phone number format not recognized. Use international format (example: +6281234567890 or +14155551234).",
    );
  }

  return phoneNumber.number.replace(/[^0-9]/g, "");
}

async function checkForUpdates() {
  try {
    console.log("Checking for any updates..");
    const response = await fetch(
      "https://raw.githubusercontent.com/dev-ryusei-hoshino/Hikari-Base/refs/heads/main/package.json",
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const remotePackage = await response.json();

    const currentVersion = packageFile.version;
    const latestVersion = remotePackage.version;

    if (currentVersion === latestVersion) {
      console.log(
        chalk.green(`You are using the latest version: v${currentVersion}`),
      );
      return;
    }

    console.log(chalk.yellow("A new version of Hikari-Base is available."));
    console.log(
      `  ${chalk.gray("Current version:")} ${chalk.red(`v${currentVersion}`)}`,
    );
    console.log(
      `  ${chalk.gray("Latest version:")}  ${chalk.green(`v${latestVersion}`)}`,
    );
    console.log(
      "Please update Hikari-Base manually to get the latest improvements and fixes.",
    );
    console.log(
      `  ${chalk.gray("Repository:")} ${chalk.underline(
        "https://github.com/dev-ryusei-hoshino/Hikari-Base",
      )}`,
    );
  } catch (error) {
    console.error(chalk.red("Failed to check for updates:"), error.message);
  }
}

async function askPhoneNumber() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const phoneNumberInput = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        rl.close();
        reject(new Error("Time's up. Please try again."));
      }, 120000);

      rl.question(
        `Enter your WhatsApp bot number ${chalk.gray(`(example: +6281234567890)`)}:\n`,
        (answer) => {
          clearTimeout(timeout);
          resolve(answer);
        },
      );
    });

    return validatePhoneNumber(phoneNumberInput);
  } finally {
    rl.close();
  }
}

async function connectToWhatsApp() {
  if (reconnecting) return;
  reconnecting = true;

  try {
    if (conn) {
      try {
        conn.ev.removeAllListeners();
        conn.ws?.close();
      } catch {}
      conn = null;
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    conn = makeWASocket({
      auth: state,
      printQRInTerminal: config.pairingWithQr,
      browser: Browsers.macOS("Safari"),
      logger: Pino({ level: "silent" }),
      markOnlineOnConnect: config.bot.markOnlineOnConnect,
      version,
    });

    let pairingRequested = false;

    conn.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr && !conn.authState.creds.registered) {
        if (!config.pairingWithQr && !pairingRequested) {
          pairingRequested = true;

          try {
            const phoneNumber = await askPhoneNumber();
            const code = await conn.requestPairingCode(phoneNumber);

            console.log(`YOUR PAIRING CODE: ${chalk.yellow(code)}`);
            console.log(
              chalk.gray(
                "Open WhatsApp > Linked Devices > Link with Phone Number > Enter the code above.",
              ),
            );
          } catch (err) {
            console.error("Failed to request pairing code:", err.message);

            try {
              conn.ev.removeAllListeners();
              conn.ws?.close();
            } catch {}

            scheduleReconnect();
          }
        } else if (config.pairingWithQr) {
          QRCode.generate(qr, { small: true });
          console.log(
            "Scan the QR code above with WhatsApp > Linked Devices > Link a Device",
          );
        }
      }

      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== 401;

        console.log("Connection closed, attempting to reconnect..");

        try {
          conn.ev.removeAllListeners();
          conn.ws?.close();
        } catch {}

        conn = null;

        if (!shouldReconnect) {
          console.log(
            `Invalid session. Deleting folder "${chalk.yellow(sessionDir)}" and trying again...`,
          );

          try {
            await fs.promises.rm(sessionDir, {
              recursive: true,
              force: true,
            });
          } catch (err) {
            console.error("Failed to delete session folder:", err.message);
          }
        }

        scheduleReconnect();
      }

      if (connection === "open") {
        console.log(config.bot.name, "successfully connected to WhatsApp!");
      }
    });

    conn.ev.on("creds.update", saveCreds);

    conn.ev.on("messages.upsert", async ({ messages }) => {
      const msg = messages[0];

      handleMessage(conn, msg);
    });
  } catch (err) {
    console.error("Failed to create connection:", err);
    scheduleReconnect();
  } finally {
    reconnecting = false;
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectToWhatsApp();
  }, 3000);
}

checkForUpdates();
connectToWhatsApp();
