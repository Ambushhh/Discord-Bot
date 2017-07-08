export type BotConstants = {
	// id
	id: string,

	// RegExp
	allowRegExp: RegExp,
	cslRegExp: RegExp,
	destroyRegExp: RegExp,
	disallowRegExp: RegExp,
	getRegExp: RegExp,
	platformRegExp: RegExp,
	psRegExp: RegExp,
	scrubRegExp: RegExp,
	xbRegExp: RegExp,

	// embed color
	embedColor: string,

	// misc emoji
	spacerEmoji: string,
	blizzEmjoi: string,
	psEmoji: string,
	xbEmoji: string,
	removeEmoji: string
};

// tslint:disable-next-line:variable-name
const Constants: BotConstants = <any> {};

// id
Constants.id = '282146039824121858';

// RegExp
Constants.allowRegExp = new RegExp('\.allow\\s|\.a\\s', 'i');
Constants.cslRegExp = new RegExp('[^\,\\s][^\,]*[^\,\\s]*', 'ig');
Constants.destroyRegExp = new RegExp('\.dr\\s', 'i');
Constants.disallowRegExp = new RegExp('\.disallow\\s|\.d\\s', 'i');
Constants.getRegExp = new RegExp('\.gr\\s', 'i');
Constants.platformRegExp = new RegExp('(\\bpc\\b)|(\\bpsn\\b)|(\\bps\\b)|(\\bxbl\\b)|(\\bxbox\\b)', 'i');
Constants.psRegExp = new RegExp('([A-Za-z0-9\-\_]{3,16})', 'i');
Constants.scrubRegExp = new RegExp('(?:-s)', 'ig');
Constants.xbRegExp = new RegExp('(?:.me set xbl|.me set xbox)\\s([A-Za-z0-9\-\_\\s]{1,15})', 'i');

// embed color
Constants.embedColor = '0xff8c00';

// misc emoji
Constants.spacerEmoji = ':spacer:328352361569583105';
Constants.blizzEmjoi = ':blizz:328322843227979778';
Constants.psEmoji = ':ps:328322843198881792';
Constants.xbEmoji = ':xb:328322843798405133';

export default Constants;
