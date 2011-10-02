### Beans

Beans are a fancy name for **plugin**.
            
### Organization
            
This is still very much a work in progress, but personally, I try to stick to a few conventions which help organize my "beans". Here are some general rules I follow:
                  
- All beans are placed in a single directory. The directory name depends on what the application does. 
	- If the app serves one platform, then place the beans in `app/beans`;
	- If the app serves multiple platforms, then place the beans in:
		- `app/node/beans` for node.js specific beans.
		- `app/web/beans` for web-specific beans.
		- `app/shared/beans` for beans usable across all platforms.
                    

### Naming Conventions   
               
                                                                        
Start off with the category of the bean first, and then the subject. A few examples:
             
- database.mongo
- database.redis
- database.mysql
        
Using `database` as the category tells that all beans share the same API. I can easily add / remove any `database` bean I want without breaking the application.    

                                
If you have a plugin that uses many plugins, then try this naming convention:

- `category`.core

And for beans that make up `category.core`:

- `category`.part.`subject`

For example:


- stream.core
- stream.part.facebook
- stream.part.twitter
- stream.part.google


Where all the **parts** make up `stream.core`. Remember that parts shouldn't do **anything**. They make-up core plugins. If you have a plugin that serves several plugins, split it up like so:

- posting.part.facebook
- friends.part.facebook        


Try and follow a RESTful naming convention. There will be instances where you have a plugin that serves as a collection, and then another plugin that serves as a collection to the previous collection. Ughhh, kinda like:

                  
- stream.core
- stream.part.subscription.core `listening for streamed content, and sending off to registered subscribers`
- stream.part.subscription.email `subscription listening to stream, and sending a newsletter`      
- stream.part.subscription.facebook `subscription listening to a stream, and posting out to facebook`  

Note that `part` was dropped after `subscription`. I find it reduntant to use it after the first instance. We already know that `stream.part.subscription.core` is nothing without `stream.core`, so anything *after* that is also useless without the root core plugin.




         
