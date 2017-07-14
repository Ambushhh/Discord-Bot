import { Command } from 'yamdbf';
import { Collection, GuildMember, Message, RichEmbed, Role, User } from 'discord.js';
import Database from '../../database/Database';

const credentials = require('../../database.json');

export default class Note extends Command {
	private database: Database;

	public constructor() {
		super({
			name: 'note',
			aliases: ['n'],
			desc: 'Add a note for a user',
			usage: '<prefix>note <Argument>',
			info: 'Argument information below...\u000d\u000d' +
			'add <User> <Note>  : Adds a note for user\u000d' +
			'history <User>     : Displays note history for user\u000d' +
			'delete <User> <ID> : Deletes specific note for user\u000d' +
			'reset <User>       : Deletes all notes for user',
			group: 'profile',
			guildOnly: true,
			roles: ['The Vanguard', 'Discord Chat Mods', 'Mod Assistant']
		});
		this.database = new Database(credentials);
	}

	public async action(message: Message, args: Array<any>): Promise<any> {
		// Set Mod Roles
		let modRoles: Array<Role> = new Array();
		modRoles[0] = message.guild.roles.find('name', 'The Vanguard');
		modRoles[1] = message.guild.roles.find('name', 'Discord Chat Mods');
		modRoles[2] = message.guild.roles.find('name', 'Mod Assistant');

		let author: GuildMember;
		author = message.member;

		// start typing
		message.channel.startTyping();

		// output variable declaration
		const embed: RichEmbed = new RichEmbed();

		let user: User,
			mentions = message.mentions.users.array();

		if (!mentions.length) {
			message.channel.send('You must specify a user.');
			return message.channel.stopTyping();
		} else if (mentions.length > 1) {
			message.channel.send('Please specify only one user.');
			return message.channel.stopTyping();
		} else {
			user = mentions[0];
		}

		switch (args[0]) {
			case 'h':
			case 'history':
				if (author.roles.has(modRoles[0].id) || author.roles.has(modRoles[1].id) || author.roles.has(modRoles[2].id)) {
					this.database.commands.notes.get(message.guild.id, user.id)
						.then(results => {
							if (!results.length) {
								message.channel.send(`There are no notes for <@${user.id}>.`);
								return message.channel.stopTyping();
							} else {
								let notes: string = '';
								results.forEach((value: any, index: number) => {
									notes += `${index + 1}. ${value.note} (<@${value.modid}>) [${value.createdAt}]\u000d`;
								});

								embed.addField(`Notes for ${user.username}:`, notes, true);
								message.channel.send({ embed: embed });
								return message.channel.stopTyping();
							}
						})
						.catch(error => {
							console.error(error);
							message.channel.send(`There was an error while fetching the notes for <@${user.id}>.`);
							return message.channel.stopTyping();
						});
					break;
				} else {
					message.channel.send(`Sorry, but you do not have the role(s) necessary to access this command. Roles required: \`The Vanguard\` or \`Discord Chat Mods\` or \`Mod Assistant\`.`);
					return message.channel.stopTyping();
				}

			case 'a':
			case 'add':
				if (author.roles.has(modRoles[0].id) || author.roles.has(modRoles[1].id) || author.roles.has(modRoles[2].id)) {
					let note: string = '';
					note = this.parseNote(args);
					if (note.length === 0) {
						message.channel.send(`Notes must not be empty. Please specify note text.`);
						return message.channel.stopTyping();
					} else {
						this.database.commands.notes.create(message.guild.id, message.author.id, user.id, note)
							.then(result => {
								message.channel.send(`Successfully stored note for <@${user.id}>.`);
								return message.channel.stopTyping();
							})
							.catch(error => {
								console.error(error);
								message.channel.send(`There was an error while storing the note for <@${user.id}>.`);
								return message.channel.stopTyping();
							});
						break;
					}
				} else {
					message.channel.send(`Sorry, but you do not have the role(s) necessary to access this command. Roles required: \`The Vanguard\` or \`Discord Chat Mods\` or \`Mod Assistant\`.`);
					return message.channel.stopTyping();
				}

			case 'd':
			case 'delete':
				if (author.roles.has(modRoles[0].id) || author.roles.has(modRoles[1].id)) {
					// create confirmation filter
					const setFilter: any = (m: Message) => {
						if (m.author.id === message.author.id && m.content.match(/y|n/i))
							return true;
					};

					// Check if user has any notes
					if (isNaN(args[2])) {
						message.channel.send(`Invalid note specified.`);
						return message.channel.stopTyping();
					}

					this.database.commands.notes.get(message.guild.id, user.id)
						.then(results => {
							if (!results.length) {
								message.channel.send(`There are no notes for <@${user.id}>.`);
								return message.channel.stopTyping();
							} else {
								let noteIndex: number = Number(args[2]);
								if (results.length < noteIndex) {
									message.channel.send(`Please specify a note within range. Run \`<prefix>note history <user>\` to get the NoteID.`);
									return message.channel.stopTyping();
								}

								// send confirmation message
								message.channel.send(`Are you sure you want to delete the note for <@${user.id}> (__y__es | __n__o).`).then(() => {
									// send awaitMessage
									message.channel.awaitMessages(setFilter, {max: 1, time: 20000})
										// user responded
										.then((collected: Collection<string, Message>) => {
											// yes, delete it
											if (collected.first().content.charAt(0).toLowerCase() === 'y') {
												this.database.commands.notes.delete(results[noteIndex - 1].id)
													.then(result => {
														message.channel.send(`Deleted note #${noteIndex} for <@${user.id}>.`);
														return message.channel.stopTyping();
													})
													.catch(error => {
														console.error(error);
														message.channel.send(`There was an error while deleting the note for <@${user.id}>.`);
														return message.channel.stopTyping();
													});
											}

											// no, cancel the action
											if (collected.first().content.charAt(0).toLowerCase() === 'n') {
												message.channel.send('Cancelling action.');
												return message.channel.stopTyping();
											}
										})

										// user did not respond
										.catch(() => {
											// display output
											message.channel.send('There was no collected message that passed the filter within the time limit!');
											return message.channel.stopTyping();
										});
								});
							}
						})
						.catch(error => {
							console.error(error);
							message.channel.send(`There was an error while processing a note deletion request for <@${user.id}>.`);
							return message.channel.stopTyping();
						});
						break;
				} else {
					message.channel.send(`Sorry, but you do not have the role(s) necessary to access this command. Roles required: \`The Vanguard\` or \`Discord Chat Mods\`.`);
					return message.channel.stopTyping();
				}

			case 'r':
			case 'reset':
				if (author.roles.has(modRoles[0].id) || author.roles.has(modRoles[1].id)) {
					// create confirmation filter
					const setFilter: any = (m: Message) => {
						if (m.author.id === message.author.id && m.content.match(/y|n/i))
							return true;
					};

					// Check if user has any notes
					this.database.commands.notes.get(message.guild.id, user.id)
						.then(results => {
							if (!results.length) {
								message.channel.send(`There are no notes for <@${user.id}>.`);
								return message.channel.stopTyping();
							} else {
								// send confirmation message
								message.channel.send(`Are you sure you want to delete all notes for <@${user.id}> (__y__es | __n__o).`).then(() => {
									// send awaitMessage
									message.channel.awaitMessages(setFilter, {max: 1, time: 20000})
										// user responded
										.then((collected: Collection<string, Message>) => {
											// yes, delete it
											if (collected.first().content.charAt(0).toLowerCase() === 'y') {
												this.database.commands.notes.reset(message.guild.id, user.id)
													.then(result => {
														message.channel.send(`Deleted all notes for <@${user.id}>.`);
														return message.channel.stopTyping();
													})
													.catch(error => {
														console.error(error);
														message.channel.send(`There was an error while deleting the notes for <@${user.id}>.`);
														return message.channel.stopTyping();
													});
											}

											// no, cancel the action
											if (collected.first().content.charAt(0).toLowerCase() === 'n') {
												message.channel.send('Cancelling action.');
												return message.channel.stopTyping();
											}
										})

										// user did not respond
										.catch(() => {
											// display output
											message.channel.send('There was no collected message that passed the filter within the time limit!');
											return message.channel.stopTyping();
										});
								});
							}
						})
						.catch(error => {
							console.error(error);
							message.channel.send(`There was an error while processing a note deletion request for <@${user.id}>.`);
							return message.channel.stopTyping();
						});
						break;
				} else {
					message.channel.send(`Sorry, but you do not have the role(s) necessary to access this command. Roles required: \`The Vanguard\` or \`Discord Chat Mods\`.`);
					return message.channel.stopTyping();
				}
			default:
				message.channel.send(`Invalid argument. See \`<prefix>help note\` for this command.`);
				return message.channel.stopTyping();
		}
	}

	private parseNote(args: Array<any>): string {
		let text: string = '';
		for (let index = 2; index < args.length; index++) {
			text += `${args[index].trim()} `;
		}
		return text.slice(0, -1);
	}
}
