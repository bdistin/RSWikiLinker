const { Monitor } = require('klasa');
const fetch = require('node-fetch');

class WikiLinker extends Monitor {

	constructor(...args) {
		super(...args, { ignoreOthers: false });
		this.ignoreEdits = !this.client.options.commandEditing;
		this.typing = this.client.options.typing;
	}

	get defaultWikiCommand() {
		return this.client.commands.get('swiki');
	}

	async run(message) {
		if (!message.guild.settings.wiki) {
			return message.send([
				'This server has not set a default wiki yet.',
				`Users with the "Administrator" permission can do this using ${this.defaultWikiCommand.usage.fullUsage(message)}.`
			]);
		}

		if (this.typing) message.channel.startTyping();
		const response = await this.parseWiki(message);
		if (this.typing) message.channel.stopTyping();

		return response ? message.send(response) : undefined;
	}

	async parseWiki(message) {
		const wiki = new Map(message.guild.settings.channelOverwrites).get(message.channel.id) || message.guild.settings.wiki;
		const mps = ['**Wiki links detected:**'];
		const cleaned = message.cleanContent.replace(this.constructor.codeBlock, '').replace(this.constructor.inlineCode, '').replace(this.constructor.cleanContent, '');

		if (this.constructor.article.test(cleaned)) this.articles(wiki, cleaned, mps);
		if (this.constructor.template.test(cleaned)) this.templates(wiki, cleaned, mps);
		if (this.constructor.rawArticle.test(cleaned)) this.rawArticles(wiki, cleaned, mps);

		if (mps.length === 1) return undefined;

		const preparedSend = (await Promise.all(mps)).filter(item => item);
		return preparedSend.length > 1 ? preparedSend : undefined;
	}

	articles(wiki, cleaned, mps) {
		const name = cleaned.replace(this.constructor.articleReplacer, '$1\u200B');
		const allLinks = name.split('\u200B').slice(0, -1);
		const unique = new Set(allLinks);

		for (const item of unique) mps.push(this.reqAPI(wiki, item.trim()).catch(console.error));
	}

	templates(wiki, cleaned, mps) {
		const name = cleaned.replace(this.constructor.templateReplacer, '$1\u200B');
		const allLinks = name.split('\u200B').slice(0, -1);
		const unique = new Set(allLinks);

		for (const item of unique) mps.push(this.reqAPI(wiki, `Template:${item.trim()}`).catch(console.error));
	}

	rawArticles(wiki, cleaned, mps) {
		const name = cleaned.replace(this.constructor.rawArticleReplacer, '$1\u200B').replace(this.constructor.newLineReplacer, '');
		const allLinks = name.split('\u200B').slice(0, -1);
		const unique = new Set(allLinks);

		for (const item of unique) mps.push(`<http://${wiki}.wikia.com/wiki/${item.trim().replace(this.constructor.space, '_')}>`);
	}

	shouldRun(message) {
		return  message.channel.type === 'text' &&
			super.shouldRun(message) && (
				this.constructor.article.test(message.cleanContent) ||
				this.constructor.template.test(message.cleanContent) ||
				this.constructor.rawArticle.test(message.cleanContent)
			);
	}

	async reqAPI(wiki, requestName) {
		const response = await fetch(`http://${wiki}.wikia.com/api/v1/Search/List/?query=${requestName}&limit=1`);

		if (response.status !== 200) throw new Error(`Response code: ${response.status}`);

		const body = await response.json();
		return `<${body.items[0].url}>`;
	}

}

WikiLinker.article = /\[\[([^\]|]+)(?:|[^\]]+)?\]\]/;
WikiLinker.template = /\{\{([^}|]+)(?:|[^}]+)?\}\}/;
WikiLinker.rawArticle = /--([^|]+?)--/;

WikiLinker.articleReplacer = /.*?\[\[([^\]|]+)(?:|[^\]]+)?\]\]/g;
WikiLinker.templateReplacer = /.*?\{\{([^}|]+)(?:|[^}]+)?\}\}/g;
WikiLinker.rawArticleReplacer = /.*?--([^|]+?)--/g;

WikiLinker.space = /\s/g;
WikiLinker.newLineReplacer = /.*(?:\n|\r)/g;

WikiLinker.codeBlock = /`{3}[\S\s]*?`{3}/gm;
WikiLinker.inlineCode = /`[\S\s]*?`/gm
WikiLinker.cleanContent = /\u200B/g

module.exports = WikiLinker;