var beanpole = require('../../lib/node');

var router = beanpole.router();



router.on({
    /**
     */
     
    'pull /*': function()
    {
        console.log("THRU");
        
        this.next();
    },
    
     /**
     */
     
    'pull -two /*': function()
    {
        console.log("THRU MOO");
        
        this.next();
    },
    
    /**
     */
     
    'pull /hello/:param/*': function()
    {
        console.log("THRU AGAIN");
        this.next();
    },
    
    
    /**
     */
     
    'pull hello/:param/craig': function()
    {
        console.log("HELLO!");
    }
});


router.pull('hello/digg/craig', function()
{
});