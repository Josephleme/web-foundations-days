# Course Journey and Technical Reflection

## Overcoming Complex Structural Paradigms
The hardest concept for me in this course was definitely dealing with database race conditions and concurrency. It was really confusing at first to understand how multiple users could try to update the exact same row at the same millisecond without breaking the system. I overcame this by writing raw SQL code in the playground and testing out different transaction isolation levels myself until the numbers matched up. It made me realize that you cannot just rely on your application code to keep things safe; you really need solid constraints directly inside your database tables.

## Capstone Architecture Enhancements
If I had more time to work on my photo-sharing app based on the feedback I got, I would change how the follower feed updates. Right now, it runs a big SQL JOIN query every time a user loads their page, which is fine for small numbers but will slow down completely when millions of rows are added. I would switch this to a pre-computed caching strategy so the system does not have to rebuild the feed data from scratch on every single click. 

## Forward Technical Horizons
Next, I want to learn about Docker containers and Kubernetes orchestration tools. The course showed me how to design good backend architectures on paper, but I want to understand how to actually deploy these servers in real life so they scale up automatically when traffic hits. Learning how containers manage these networks will help me bridge the gap between design theory and real production environments.
