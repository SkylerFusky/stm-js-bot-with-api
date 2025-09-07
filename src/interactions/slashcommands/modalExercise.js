const {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    Guild,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("modaltest")
        .setDescription("Creates a modal with a textbox"),

    async execute(interaction) {
        let timestamp = Date.now();
        let modal = new ModalBuilder();

        modal.setTitle("test");
        modal.setCustomId(`ModalName-${interaction.user.id}-${timestamp}`);

        let textbox = new TextInputBuilder();
        textbox.setPlaceholder("Check This shit");
        textbox.setCustomId(`TextboxName-${interaction.user.id}-${timestamp}`);
        textbox.setStyle(2);
        textbox.setMinLength(1);
        textbox.setMaxLength(100);
        textbox.setLabel("BRRRRRRRRRR");

        let row = new ActionRowBuilder();
        row.addComponents(textbox);
        modal.addComponents(row);

        interaction.showModal(modal);

        const filter = (interaction) => interaction.customId === `ModalName-${interaction.user.id}-${timestamp}`;
        interaction
            .awaitModalSubmit({ filter, time: 30000 })
            .then(async (interaction) => {
                let massiveText = interaction.fields.getTextInputValue(
                    `TextboxName-${interaction.user.id}-${timestamp}`
                );
                console.log(massiveText, interaction.user.username);
                await interaction.channel.send(
                    `${interaction.user.username} Just said: ${massiveText}`
                );
            }).catch((err) => {
                console.log(err);
            });
    },
};
