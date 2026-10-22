/**
 * Shared Discord Webhook Notifier for Imtiboard
 * Sends rich, stylized Discord embeds when any game concludes!
 */

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1562797512811741195/m-LxLfy-IQWvOMUY5ulVTDC89Dm655tlTfgBfN_0JwPEbCMhtjabqZMyWQuPcqdAq0U-";

/**
 * Send Match Results to Discord
 * @param {Object} options
 * @param {string} options.gameName - Name of the game (e.g. "Dancing Criminal", "Coup: Syndicate")
 * @param {string} options.gameIcon - Emoji icon (e.g. "🕵️", "👑", "🚂", "🎲", "💎")
 * @param {number} options.color - Hex color as integer (e.g. 0x38bdf8, 0xf59e0b)
 * @param {string} options.winner - Winner title/name
 * @param {string} options.summary - Brief match summary/reason
 * @param {Array<{name: string, value: string, inline?: boolean}>} options.fields - Detailed stats
 */
function sendDiscordMatchReport({ gameName, gameIcon, color = 0x38bdf8, winner, summary, fields = [] }) {
  if (!DISCORD_WEBHOOK_URL) return;

  const payload = {
    username: "Imtiboard Arena",
    avatar_url: "https://imtiyaz-kazuha.github.io/boardgame-project/home/icon.png",
    embeds: [
      {
        title: `${gameIcon} ${gameName} — Match Concluded!`,
        description: `🏆 **Winner:** **${winner}**\n${summary}`,
        color: color,
        fields: [
          ...fields,
          {
            name: "🎮 Play Online",
            value: `[Launch Imtiboard](https://imtiyaz-kazuha.github.io/boardgame-project/home/)`,
            inline: false
          }
        ],
        footer: {
          text: "Built by Imtiyaz for pure fun • Serverless WebRTC",
          icon_url: "https://imtiyaz-kazuha.github.io/boardgame-project/home/icon.png"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(res => {
    if (res.ok) {
      console.log(`[Discord Webhook] Sent match results for ${gameName}`);
    } else {
      console.warn(`[Discord Webhook] Status: ${res.status}`);
    }
  }).catch(err => {
    console.warn("[Discord Webhook] Error:", err);
  });
}
