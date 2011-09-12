var abstract = require('../hook.http/abstract'),
beanpole = require('../../index'),
Connection = abstract.Connection,
Transport = abstract.Transport,
net = require('../hook.http/net'),
vine = require('vine');


var transport;


var MeshConnection = Connection.extend({
    
    /**
     */
     
    'override __construct': function(ops, transport)
    {
        this._super(ops, transport);
        
        this.isMaster = ops.port == transport.masterPort;
    },
    
    /**
     */
     
    'override isDown': function()
    {
        this._super();
        
        if(this.isMaster)
        {
            console.ok('Master is down, negotiating between siblings.');	
            this._transport.negotiateMaster(true);
        }
    },

    /**
     */

    'negotiate': function()
    {
        this._get({ path: '/negotiate' }, function()
        {
            
        });
    }
    
});


var MeshTransport = Transport.extend({
    
    /**
     */
     
    'override __construct': function()
    {
        this._super.apply(this, arguments);
        
        this.masterPort = 60300;
    },
    
    /**
     */
     
    'override plugin': function(router)
    {
        this._super(router);
        
        var self = this;
        
        router.on({
            
            /**
             */
             
            'pull -http hooks/next/port': function()
            {
                return vine.result(++self.nextPort).end();
            },
            
            /**
             * draws straws between siblings for master
             */
             
            'pull -public negotiate': function()
            {

                self.negotiateMaster();
                
                return vine.result(true).end();
            }
        });
        
        //here's where we have the master connect siblings to each other
        this.addListener('connection', function(newCon)
        {
            if(newCon.isMaster) self._negotiating = false;

            //not the master? skip. no remote pid? skip ~ it's not a mesh connection. It's bussed.
            if(!self.isMaster || !newCon.remotePid) return;
                
            //otherwise, loop through all the connnections, find the siblings, and connect them
            self.hooks.all(function(err, connections)
            {
                connections.forEach(function(con)
                {
                    if(con._id == newCon._id) return;
                    
                    con.hook(newCon.toJSON());
                });
            });
        });
        
        
        //listen for insert so we can get the next port
        this.hooks.addListener('insert', function(hooks)
        {
            hooks.forEach(function(hook)
            {
                self.nextPort = Math.max(Number(hook.port), Number(self.nextPort));
            });
        });
        
        this.reconnect();
    },
    
    /**
     */
     
    'currentStraw': function()
    {
        return process.pid;
    },
    
    /**
     * negotiates with siblings as to who becomes the next master if the reg master goes down
     */
     
    'negotiateMaster': function(bypassDirty)
    {
        if(!bypassDirty && (this.isMaster || this._negotiating)) return;
        console.ok('Negotiating...');
        
       this.hooks.findOne({ port: this.masterPort }, function(err, con)
       {
            if(con) con.disconnect();
       });
        
        this._negotiating = true;
        
        //this._currentStraw = null;
        
        var highestStraw = this.currentStraw(),
        thisStraw = highestStraw,
        self = this;

        
        this.hooks.find({ hostname: this.host.hostname }, function(err, connections)
        {
            var numRunning = connections.length + 1;

            function onStraw(straw)
            {
                highestStraw = Math.max(straw, highestStraw);

                if(!(--numRunning))
                {
                    if(highestStraw == thisStraw)
                    {
                        console.ok('Running as master hook');
                        self._startServer(self.masterPort, 5);
                    }
                    else
                    {
                        console.ok('Running as sibling hook');
                        self._tryConnecting();
                    }
                }
            }
        
            
            connections.forEach(function(con)
            {
                onStraw(con.remotePid);

                //tell the other siblings to negotiate. ALL siblings need to reconnect
                //with the master since we don't want servers being mixed with routes that 
                //don't belong to them
                con.negotiate();
            });
            
            onStraw(0);
        });
    },
    
    /**
     */
     
    'reconnect': function()
    {
        this._startServer(this.masterPort);
    },

    /**
     */

    '_tryConnecting': function()
    {
        var self = this;
        net.request({ method: 'GET', path: '/hooks/up', hostname: 'localhost', port: this.masterPort }, function(err, result)
        {

            if(err) return setTimeout(function()
            {
                self._tryConnecting();        
            }, 1000);


            //need to re-hook into the master, even if there wasn't a disconect - the master may be a completely different instance. It'll
            //screw up the hooks
            self._hookToMaster();

            self._negotiating = false;
        });
    },
    
    /**
     * starts the server
     */
     
    '_startServer': function(port, assertTries)
    {
        var self = this;
        
        this.nextPort = port;
        
        this._router.pull('http/start', { port: port }, function(result)
        {
        
            //already taken?
            if(result.errors)
            {
            
                //assertive? then we gotta use the port. it *could* be still open which would
                //explain why the an error might return. Otherwise, a new master might come in and take the spot. Either or, we need to be assertive
                //about grabbing the master port.
                if(assertTries)
                {
                    console.notice('Unable to start as master, still open?');
                    
                    return setTimeout(function()
                    {
                        self._startServer(port, assertTries-1);
                    }, 1000);
                }
            
                //get the next port from the hook
                return self._nextPort();
            }
                
            self.isMaster = self.nextPort == self.masterPort;
                
            self._hookToMaster();
        });
    },

    /**
     */

    '_hookToMaster': function()
    {
        if(!this.isMaster) this._router.pull('hooks/add', { hostname: 'localhost', port: this.masterPort }, function(){}); 
    },
    
    /**
     */
     
    '_nextPort': function()
    {
        var self = this;
        
        net.get({ path: '/hooks/next/port', hostname: 'localhost', port: self.masterPort }, function(err, response)
        {
            //problem? move to the next port
            if(err || !response.result)
            {
                console.notice('Unable to connect to localhost on port %d, trying again', self.masterPort);
                
                return setTimeout(function()
                {
                    self._nextPort();
                }, 1000);
            }
            
            //the available port to use
            self._startServer(response.result);
        });
    },
    
    /**
     */
     
    'newConnection': function(ops)
    {
        return new MeshConnection(ops, this);
    }
});


exports.connect = function(onConnect)
{
    if(!transport)
    {
        var router = beanpole.router();
        router.require(['http.gateway','http.server']);
        
        router.push('init');
        
        transport = new MeshTransport();
        transport.plugin(router);
    }
    
    
    transport.addListener('connection', onConnect);
}

