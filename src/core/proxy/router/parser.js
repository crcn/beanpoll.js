
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

	self = this;


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
		return currentToken = nextToken();
	}

	/**
	 */

	this.current = function()
	{
		return currentToken || self.next();
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

	var nextChar = function()
	{
		return source[++pos];
	}

	/**
	 */

	var currentChar = function()
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
		return (c > 96 && c < 123) || (c > 64 && c < 91);
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
			if(!isWhite(nextCharCode()) && currentChar() != '/')
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
		tokenizer.source(source);

		return rootExpr();
	}


	var rootExpr = function()
	{
		var type = currentToken(Token.WORD).value,
			meta = {},
			channel;

		while(tokenizer.next())
		{
			var token = tokenizer.current();

			switch(token.type)
			{
				case Token.METADATA:
					meta[token.value] = 1;
				break;
				case Token.WORD:
					channel = channelExpr();
				break;
			}
		}

		return { type: type, meta: meta, channel: channel };
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


	var currentToken = function(type)
	{
		var current = tokenizer.current();

		if(!(type & current.type))
		{
			throw new Error('Unexpected token "'+current.value+'" at position '+tokenizer.position()+' in '+tokenizer.source());
		}

		return current;
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