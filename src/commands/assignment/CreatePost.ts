import { Command, GuildStorage } from 'yamdbf';
import { GuildMember, Message, RichEmbed, TextChannel, User } from 'discord.js';
import Constants from '../../util/Constants';

export default class CreatePost extends Command {
	public constructor() {
		super({
			name: 'create',
			desc: 'Create Role Reaction Post',
			usage: '<prefix>create',
			info: 'Create the message that users will react to in order to assign platform roles.',
			group: 'assignment',
			guildOnly: true,
			roles: ['Moderators']
		});
	}

	public async action(message: Message, args: string[]): Promise<any> {
		if (!(<TextChannel> message.channel).permissionsFor(message.author).has('SEND_MESSAGES'))
			return message.author.send(`I can't create messages in that channel.`);

		const embed: RichEmbed = new RichEmbed()
			.setColor(Constants.embedColor)
			.setTitle(`Role Assignment`)
			.setDescription(`Please react with each of the platforms you will be playing Destiny on.`);

		const reactionMessage: Message = <Message> await message.channel.send({ embed });

		await reactionMessage.react(Constants.blizzEmjoi.replace('<', '').replace('>', ''));
		await reactionMessage.react(Constants.psEmoji.replace('<', '').replace('>', ''));
		await reactionMessage.react(Constants.xbEmoji.replace('<', '').replace('>', ''));

		let guildStorage: GuildStorage = this.client.storage.guilds.get(message.guild.id);
		guildStorage.set('Role Reaction Message', reactionMessage.id.toString());
	}
}
