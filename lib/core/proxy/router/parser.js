
/**
 * parses syntactic sugar. 

 Why the hell are you using a parser for something so simple?  Because I wanted to. Yeah, I could have done it in Regexp, but fuck that >.>... This
 Is much more fun.
 */



//follow the pattern below when adding tokens plz.

var Token = {

 	// A-Z
 	WORD: 2, 

 	// -metadata
 	METADATA: 4,

 	// 0-9
 	NUMBER: 8, 

 	// :param
 	PARAM: 16, 

 	// ->
 	TO: 32,

 	// for routing
 	BACKSLASH: 64,

 	// .
 	DOT: 128, 

 	// * - this is an auto-passthru
 	STAR: 256,

 	// "or"
 	OR: 512,

 	// (
 	LP: 1024,

 	// )
 	RP: 2048,

 	// =
 	EQ: 4096
};


//reserved keywords
var Reversed = {
	or: Token.OR
}


var Tokenizer = function()
{

	//source of the string to tokenize
	var source = '',

	//the position of the parser
	pos = 0,

	//the current token
	currentToken,

	self = this,

	//pool of tokens which were put back
	pool = [];


	/**
	 * getter / setter for the source
	 */

	this.source = function(value)
	{
		if(value)
		{
			source = value+' '; //padding
			pos = 0;
		}

		return source;
	} 

	/**
	 * next token
	 */

	this.next = function(type)
	{
		if(pool.length) return pool.shift();

		return currentToken = nextToken();
	}

	/**
	 */

	this.peek = function(type)
	{
		return this.putBack(this.next());
	}

	/**
	 */

	this.current = function()
	{
		return pool.length ? pool[0] : (currentToken || self.next());
	}

	this.putBack = function(token)
	{
		// if(!token) token = this.current();
		pool.push(token);
		return token;
	}

	/**
	 */

	this.position = function()
	{
		return pos;
	}

	/**
	 */

	var nextToken = function()
	{
		while(skipWhite())
		{
			var c = currentChar(), ccode = c.charCodeAt(0);

			//a-z
			if(isAlpha(ccode))
			{
				var w = nextWord();

				return token(w, Reversed[w.toLowerCase()] || Token.WORD);
			}
			

			//0-9
			if(isNumber(ccode))
			{
				return token(nextNumber(), Token.NUMBER);
			}


			switch(c)
			{

				//for pass-thru routes
				case '-':
					if(nextChar() == '>') return token('->', Token.TO, true);
					if(isAlpha(currentCharCode())) return token(nextWord(), Token.METADATA); 

					error();

				//parameters for routes
				case ':':
					if(isAlpha(nextCharCode())) return token(nextWord(), Token.PARAM);

					error();

				case '/': return token('/', Token.BACKSLASH, true);
				case '.': return token('.', Token.DOT, true);
				case '*': return token('*', Token.STAR, true);
				case '(': return token('(', Token.LP, true);
				case ')': return token(')', Token.RP, true);
				case '=': return token('=', Token.EQ, true);

				default: error();
			}
		}

		//eof
		return null;
	}

	var error = function()
	{
		throw new Error('Unexpected character "'+currentChar()+'" at position '+pos+' in "'+source+'"');
	}

	/**
	 */

	var token = function(value, type, skipOne)
	{
		if(skipOne) nextChar();

		return { value: value, type: type};
	}


	/**
	 */

	var nextChar = this.nextChar = function()
	{
		return source[++pos];
	}

	/**
	 */

	var currentChar = this.currentChar = function()
	{
		return source[pos];
	}

	/**
	 */

	var nextCharCode = function()
	{
		return nextChar().charCodeAt(0);
	}
	/**
	 */

	var currentCharCode = function()
	{
		return currentChar().charCodeAt(0);
	}

	/**
	 */

	var rewind = function(steps)
	{
		pos -= (steps || 1);
	}

	/**
	 */

	var isAlpha = function(c)
	{
		return (c > 96 && c < 123) || (c > 64 && c < 91) || isNumber(c);
	}

	/**
	 */

	var isWhite = function(c)
	{
		return c == 32 || c == 9 || c == 10;
	}

	/**
	 */

	var isNumber = function(c)
	{
		return c > 47 && c < 58;
	}

	/**
	 */

	var skipWhite = function()
	{
		var end = false;

		while(!(end = eof()))
		{
			if(!isWhite(currentCharCode())) break;

			nextChar();
		}
		return !end;
	}


	/**
	 */

	var nextNumber = function()
	{
		var buffer = currentChar();

		while(!eof())
		{
			if(isNumber(nextCharCode()))
			{
				buffer += currentChar();
			}
			else
			{
				break;
			}
		}

		return buffer;
	}

	/**
	 */

	var nextWord = function()
	{
		var buffer = currentChar();

		while(!eof())
		{
			if(!isWhite(nextCharCode()) && currentChar() != '/' && currentChar() != '=')
			// if(isAlpha(nextCharCode()) || isNumber(currentCharCode()))
			{
				buffer += currentChar();
			}
			else
			{
				break;
			}
		}

		return buffer;
	}


	/**
	 * end of file
	 */

	var eof = function()
	{
		return pos > source.length-2;
	}
}


var ChannelParser = function()
{
	var tokenizer = new Tokenizer();
	
	/**
	 * parses a string into a handleable expression
	 */

	this.parse = function(source)
	{
		if(!source) throw new Error('Source is not defined');

		tokenizer.source(source);

		return rootExpr();
	}


	var rootExpr = function()
	{
		var expr = tokenizer.current(),
			type,
			meta = {};

		//type is not defined, but that's okay!
		if(expr.type != Token.WORD)
		{
			tokenizer.putBack(expr);	
		}
		else

		//if the next token is a backslash, *or* if there's only one word, then it's a channel
		if(nextToken(Token.BACKSLASH, true) || !hasNext())
		{
			tokenizer.putBack(expr);
		}
		else
		{
			type = expr.value;
		}

		var token, channel;

		while(token = tokenizer.current())
		{
			switch(token.type)
			{

				//-metadata=test
				case Token.METADATA:
					meta[token.value] = metadataValue();
				break;

				case Token.WORD:
					channel = channelExpr();
				break;
			}

			tokenizer.next();
		}

		return { type: type, meta: meta, channel: channel };
	}

	var metadataValue = function()
	{
		if(tokenizer.currentChar() == '=')
		{
			tokenizer.next();
			return tokenizer.next().value;
		}

		return 1;
	}

	var channelExpr = function()
	{
		var channel,
			to;


		while(hasNext())
		{
			channel = channelPathsExpr();

			if(currentTypeIs(Token.TO))
			{
				tokenizer.next();

				//need to do the switcheroo. makes it easier to handle.
				var oldChannel  = channel;
				channel 		= channelExpr();
				oldChannel.thru = channel.thru;
				channel.thru    = oldChannel;

			}
			else
			if(currentTypeIs(Token.OR))
			{
				tokenizer.next();
				channel.or = channelExpr();
			}
			else
			{
				break;
			}
		}

		return channel;
	}

	var channelPathsExpr = function(type)
	{
		var paths = [],
		token,
		passThru = false,
		cont = true;

		while(cont && (token = tokenizer.current()))
		{

			switch(token.type)
			{
				case Token.WORD:
				case Token.NUMBER:
				case Token.PARAM:
					paths.push({ name: token.value, param: token.type == Token.PARAM });
				break;
				case Token.BACKSLASH:
				break;
				default:
					cont = false; 
				break;
			}

			if(cont) tokenizer.next();
		}

		if(currentTypeIs(Token.STAR))
		{
			passThru = true;
			tokenizer.next();
		}

		return { paths: paths, passThru: passThru };
	}


	var currentToken = function(type, igError)
	{
		return checkToken(tokenizer.current(), type, igError);
	}
	
	var nextToken = function(type, igError)
	{
		return checkToken(tokenizer.next(), type, igError);
	}

	var checkToken = function(token, type, igError)
	{	
		if(!token || !(type & token.type))
		{
			if(!igError) throw new Error('Unexpected token "'+(token || {}).value+'" at position '+tokenizer.position()+' in '+tokenizer.source());
			
			return null;
		}

		return token;
	}

	var currentTypeIs = function(type)
	{
		var current = tokenizer.current();

		return current && !!(type & current.type);
	}

	var hasNext = function()
	{
		return !!tokenizer.current();
	}
}


exports.Channel = ChannelParser;


var p = new ChannelParser();


exports.parse = p.parse;


// console.log(require('sys').inspect(p.parse('pull -rotate delay/1 -> say/hi'), false, null))
