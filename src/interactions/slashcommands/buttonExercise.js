const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buttontest')
    .setDescription('Creates a message with a button'),

  async execute(interaction) {
    let timestamp = Date.now()
    let button = new ButtonBuilder()
    button.setCustomId(`ButtonName-${interaction.user.id}-<t:${timestamp}>`)
    button.setStyle(1)
    button.setLabel("Click Me!")
    button.setEmoji("👍")

    let row = new ActionRowBuilder()
    row.addComponents(button)

    interaction.reply({ content: "Click the button!", components: [row] })

  }
}