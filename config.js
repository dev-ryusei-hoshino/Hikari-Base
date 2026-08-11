const packageFile = require("./package.json");

module.exports = {
  pairingWithQr: false,
  ignore_self: true, // disable if needed, because this can be fatal
  markOnlineOnConnect: true,
  auto_read: true,

  bot: {
    name: "Hikari Base",
    slog: "Hikari Is Here~",
    ver: packageFile.version,
    thumb: "./lib/assets/thumb.jpeg",
    prefix: ["!", "$", "/"],

    owner: {
      number: "6285198221676",
      name: "Ryusei Hoshino",
    },
  },

  mess: {
    owner: "🚫 Access denied. This feature is exclusive to bot owner.",
    admin: "🚫 Access denied. Only group admins can use this feature.",
    bot_not_admin: "⚠️ Bot must be admin first to use this feature.",
    group: "⚠️ This feature can only be used in groups.",
    private: "⚠️ This feature is only available in private chat.",
    permium: "🚫 Access denied. This feature is exclusive to premium users.",
    wait: "⏳ Processing request...",
    plugin_not_available: "❌ *Error:* Plugin is not available at the moment.",
  },
};

/** us-EN
 * ============================================================================
 * ✨ HIKARI BASE ✨
 * ============================================================================
 *
 * 👨‍💻 Developer : Ryusei Hoshino
 * 💖 Thank you for using Hikari Base!
 *
 * ----------------------------------------------------------------------------
 * [ CREDITS & ATTRIBUTIONS ]
 * This project is made possible thanks to various third-party resources,
 * including libraries, assets, media, icons, and fonts. All rights belong
 * to their respective creators and owners. A huge thank you to every
 * developer, artist, designer, maintainer, and contributor involved!
 *
 * ----------------------------------------------------------------------------
 * [ LINKS & CONTACT ]
 * 🔗 Repository : https://github.com/dev-ryusei-hoshino/Hikari-Base
 * 📢 WA Channel : https://whatsapp.com/channel/0029VbDnVYyK0IBjO8RGfq3N
 * 💬 Contact Me : https://wa.me/6285198221676
 *
 * ----------------------------------------------------------------------------
 * [ ACKNOWLEDGEMENTS ]
 * Special thanks to:
 * - Node.js
 * - Baileys
 * - All Open Source Maintainers
 * - Asset Creators whose work is used in this project
 * - Everyone who has supported Hikari Base
 *
 * ----------------------------------------------------------------------------
 * [ IMPORTANT NOTE ]
 * If you are the creator of any asset used in this project and wish to
 * request proper crediting, updates, or removal, please reach out via
 * GitHub issues or contact me directly.
 * ============================================================================
 */

/** ID-id
 * ============================================================================
 * ✨ HIKARI BASE ✨
 * ============================================================================
 *
 * 👨‍💻 Dev : Ryusei Hoshino
 * 💖 Terima kasih telah menggunakan Hikari Base!
 *
 * ----------------------------------------------------------------------------
 * [ KREDIT & ATRIBUSI ]
 * Proyek ini dapat terwujud berkat dukungan berbagai sumber daya pihak
 * ketiga, termasuk pustaka (libraries), aset, media, ikon, dan font.
 * Hak cipta sepenuhnya milik masing-masing kreator dan pemilik aslinya.
 * Apresiasi sebesar-besarnya untuk setiap pengembang, seniman, desainer,
 * pengelola, dan kontributor!
 *
 * ----------------------------------------------------------------------------
 * [ TAUTAN & KONTAK ]
 * 🔗 Repositori : https://github.com/dev-ryusei-hoshino/Hikari-Base
 * 📢 Saluran WA : https://whatsapp.com/channel/0029VbDnVYyK0IBjO8RGfq3N
 * 💬 Hubungi Saya: https://wa.me/6285198221676
 *
 * ----------------------------------------------------------------------------
 * [ UCAPAN TERIMA KASIH ]
 * Terima kasih khusus kepada:
 * - Node.js
 * - Baileys
 * - Seluruh Pengelola Open Source (Sumber Terbuka)
 * - Para pembuat aset yang karyanya digunakan dalam proyek ini
 * - Semua pihak yang selalu mendukung Hikari Base
 *
 * ----------------------------------------------------------------------------
 * [ CATATAN PENTING ]
 * Jika Anda adalah pembuat aset yang digunakan dalam proyek ini dan
 * ingin meminta pencantuman kredit (credit), pembaruan, atau penghapusan,
 * silakan buka 'Issue' di GitHub atau hubungi saya secara langsung.
 * ============================================================================
 */
