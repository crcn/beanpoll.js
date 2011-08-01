var Cookie = 
{
	getString: function (name, value, expire, path, domain, secure, httponly)
	{
		var buff = name + '=' + value + ';';
		
		path = path || '/';

		if(expire)   buff += 'expire=' + expire + ';';
		if(path)     buff += 'path=' + path + ';';
		if(domain)   buff += 'domain=' + domain + ';';
		if(secure)   buff += 'secure=' + secure + ';';
		if(httponly) buff += 'httponly=' + httponly + ';';
		
		return buff;
	}
}


exports.Cookie = Cookie;