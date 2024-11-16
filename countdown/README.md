## Countdown

Uses `Environment Variables` and `Edge Functions` to create a countdown timer. 

The environment variable is `TARGET_DATE` and must be something 
that `new Date(TARGET_DATE)` can parse.

The edge function will run for every request and will check if it's an 
HTML file (we don't want it running on the **favicon**) and update the
network response with the target date.

This way, by simply updating the `TARGET_DATE` environment variable, 
the countdown will be updated to the new target date. No need to
redeploy the site.