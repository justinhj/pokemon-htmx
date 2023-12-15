# Playing with htmx via the Pokemon API

A simple browser for Pokedex information.

<img width="1175" alt="Screenshot 2023-12-14 at 8 53 04 PM" src="https://github.com/justinhj/pokemon-htmx/assets/753059/de438006-971b-4ef0-9caa-80d940d70ccc">

## htmx

htmx is a JavaScript library that allows you to access AJAX, WebSockets and Server Sent Events directly in HTML, using attributes like hx-get and hx-post.

[htmx](https://htmx.org/)

## Pokemon API

The Pokemon API is a RESTful API that provides information about Pokemon, including their names, types, abilities, and more.

[pokemon api](https://pokeapi.co/)

## This project

Implements a simple server with express. It wraps the pokemon api which returns json with a htmx friendly version that returns fragments of html loaded in place without page reloads.

If you see some weird stuff in the code it's because I'm also learning how to use the Typescript function programming library [effect](https://www.effect.website/)