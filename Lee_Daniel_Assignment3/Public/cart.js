// TODO: Figure out how to import JS files.
class Cart {

    /* cartStr = {
     *     "total": <total>,
     *     "items": {
     *         <productId>: {
     *             "brand": <brand>,
     *             "name": <name>,
     *             "price": <price>,
     *             "image": <image>,
     *             "quantity": <quantity>,
     *            "subtotal": <subtotal>
     *         }
     *     }   
     * }
     */
    constructor(cartStr="") {

        /* items = {
         *     <productId>: {
         *         "brand": <brand>,
         *         "name": <name>,
         *         "price": <price>,
         *         "image": <image>,
         *         "quantity": <quantity>,
         *         "subtotal": <subtotal>
         *     }
         * }
         */
        this.items = {}
        this.total = 0.00;

        // Load an existing cart if provided.
        if (cartStr !== "") {

            // Decode the cart string.
            cartStr = decodeURIComponent(cartStr);

            // DEBUG: Print statement to study the contents of the cart string.
            console.log("Class Cart: Constructor: cartStr: " + cartStr);

            // Convert the string to a JSON object to assign the values to this cart.
            let cart = JSON.parse(cartStr);
            this.total = cart["total"]
            this.items = cart["items"]
        }
    }

    addItem(productId, brand, name, price, image, quantity) {

        let subtotal = price * quantity;

        // Add the item directly to the cart if it is missing.
        if (this.items[productId] == undefined) {
            this.items[productId] = {
                "brand": brand,
                "name": name,
                "price": price,
                "image": image,
                "quantity": quantity,
                "subtotal": subtotal
            };
            this.total += subtotal;
        }

        // Update the quantity of the item in the cart.
        else {
            this.items[productId]["quantity"] += quantity;
            this.items[productId]["subtotal"] += subtotal;
            this.total += subtotal;
        }
    }

    removeItem(productId) {

        // Nothing to do since the item doesn't exist in the cart.
        if (this.items[productId] == undefined) {
            return
        }

        // Reduce the total based on the subtotal of the removed item.
        this.total -= this.items[productId]['subtotal'];

        // Remove this item from the cart.
        this.items.delete(productId);
    }

    export() {
        
        // Conver this object into a string for storage and transportation.
        let cartStr = JSON.stringify({"total": this.total, "items": this.items});

        // DEBUG: Print statement to study the contents of the cart upon export.
        console.log("Class Cart: export: cartStr: " + cartStr);

        // Encode the cart string for cookie storage.
        return encodeURIComponent(cartStr);
    }
}