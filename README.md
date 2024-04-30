# Music-Platform
 Music hosting platform implementing spotify api
___

![Chinese Food](./images/israel-albornoz--SsC5Fpp-9o-unsplash.jpg "Yummy")
> Part of the secret of success in life is to eat what you like and let the food fight it out inside.
-Mark Twain

## Project Description 

This project was inspired by the many table service appplications that were placed in high demand throughout the COVID pandemic. 
The goal was to create a minimalistic application That would enable users to order items from their table. 

#### The Technologies Used: 
- Node.js and the Express.js framework
- Bcrypt and Json Web Token for encryption/authorisation
- Helmet, Express-session and CORS for added security
- Swagger: API Documentation

## How to Use the Project

*Use node/nodemon server.js in the terminal to start the server*

1. http://localhost:3000/api/signup - post route for creating a profile.
    1. Requires a name, address, and payments method as well as a unique mobile, email and password.
    2. The password must be at least 8 characters long including lowercase, uppercase, and numeric values.
2. http://localhost:3000/api/signin - post route to sign-in to a specific profile.
    1. Upon successful sign-in the user will be authenticated obtaining a JWT token.
3. http://localhost:3000/api/menu - get route to view the restaurant menu.
    1. The user can view all of the items on the menu.
4. http://localhost:3000/api/order - post route that allows a user to order items on the menu.
    1. The menu item, quantity, and price need to be specified for the order to be added to the database.
5. http://localhost:3000/api/order/payment/:id - put route for confirming an order with payment.
    1. The user can specify a payment method or use the default one tied to their account.
    2. The order number needs to be specified in the url params so that payment can go through.
6. http://localhost:3000/api/order/receipt/:id - get route allows a user to view their receipt after payment.
    1. The order number is specified in the url params which notifies the server to display the total price and order number to the user.
7. http://localhost:3000/api/order/history - get route allows the user to view their order history.
    1. The user indicated by their JWT token can view the all of their previous orders.
8. http://localhost:3000/api/order/delete/:id - delete route allows the user to cancel an order.
    1. The user can only interact with their own orders through the JWT token.
    2. The order specified in the url params will be deleted.


### Copyright

**Copyright 2024, Jonathan Cuddy, All rights reserved.**
:smiley: