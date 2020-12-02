##### Created Date: 02/12/2020
##### Authors: Yang
##### Email: debuggeryang@gmail.com
##### Folder: app/code/BiFang/OrderTracker


#### Change log



## Magento2 Order Tracker Extension
#### Version 0.0.1
--------------------------------

1. What issues this module solves:

    - Once customer purchases any paid product, they are redirected to a Geo-map (order tracking) page showing the geo tracking of the delivery in real-time;
    - Provide delivery ETA and distance and traffic conditions;
    - The map data is from Mapbox SDK/API;
2. How to use it:

    - Login the [admin](http://54.79.153.136/admin_bnboax) and go to **configuration > Sales > Shipment Settings** to enable the extension **OrderTracker**, fill in your Mapbox token.
    - Place an order in the front end, you will see the map with carrier route and EAT on the checkout success page.

3. To do

    - Customers can also find the map when they are viewing orders on the account dashboard page;
    - The order status (awaiting payment/invoiced/packing/dispatched) should be considered when tracking;
    - Get weather condition data and adjust ETA based on the weather; 

4. Packages/Libraries used in this extension
    - [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)
    - [Bootstrap](https://getbootstrap.com/)

\pagebreak
