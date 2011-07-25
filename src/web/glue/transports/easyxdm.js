var Transport = require('../../../core/glue/transports/abstract').Transport;       

                            
/**
 * the transport between two proxies
 */

var EasyXDMTransport = Transport.extend({
	                                                 
	                
	
	/**   
	 * connects to the remote connection
	 */
	
	'connect': function(callback) { },      
	
	/**                                          
	 * sends data over to the remote transport
	 */
	
	'send': function(obj) { }
});


exports.Transport = EasyXDMTransport;
