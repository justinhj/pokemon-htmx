# Playing with htmx via the Pokemon API

## htmx

htmx is a JavaScript library that allows you to access AJAX, WebSockets and Server Sent Events directly in HTML, using attributes like hx-get and hx-post.

[htmx](https://htmx.org/)

## Pokemon API
The Pokemon API is a RESTful API that provides information about Pokemon, including their names, types, abilities, and more.

[pokemon api](https://pokeapi.co/)

## This project
Implements a simple server with express. It wraps the pokemon api which returns json with a htmx friendly version that returns fragments of html loaded in place without page reloads.