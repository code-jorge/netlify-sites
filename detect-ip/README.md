## IP Detection

Detects your IP address and adds it to the body using an edge function.

One of the simplest examples of an edge function. It will run for every request 
and add the IP address to the body of the HTML response. 

The IP address, as well as location information, is available in the `request` object
passed to the edge function.