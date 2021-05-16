class Page {
    constructor() {

        // Check if the user has a logged in session.
        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests
        var request = new XMLHttpRequest();
        request.open("GET", "/loggedin", false);  // `false` makes the request synchronous
        request.send(null);
        if (request.status === 200 && request.responseText !== "") {
            this.loggedIn = (request.responseText !== "");
            this.user = JSON.parse(request.responseText);
        }
        
        // Load cookies for this page object.
        this.cookies = {}
        this.loadCookies();
    }

    // Base source code for the navigate HTML was from https://www.w3schools.com/
    loadNavBar() {
        
        document.write(`
            <div class="topnav">
                <div class="usersection">
        `);

        // If the user is logged in, then show their cart, name, and logout button.
        if (this.loggedIn) {
            document.write('<a href="/logout" class="usersession">Log Out</a>');
            document.write('<a href class="usersession">View Cart (1)</a>');
            document.write('<div class="usersession ">Hello ' + this.user["name"] + '!</div>');
        }

        // If the user is not logged in, then give them a button to do so.
        else {
            document.write('<a href="/login.html" class="usersession">Log In</a>');
        }

        document.write(`
                </div> 
                <div class="navsection">
                    <a href="/product_page.html" class="active navoption">Home</a>
                    <a href class="navoption">Category 1</a>
                    <a href class="navoption">Category 2</a>
                    <a href class="navoption">Category 3</a>
                </div>
            </div>
        `);
    }

    loadCookies() {

        // Cookies are separated by a semi-colon and a whitespace.
        // I.E: "isInteractive=true; name=Daniel Lee"
        let cookies = document.cookie.split('; ');

        // Store each cookie to our page object.
        // Cookies are stored as <key>=<value> strings. The value is encoded and will need to be decoded before storing.
        // Note: It is possible to have a cookie without a value. https://datatracker.ietf.org/doc/html/rfc6265#section-4.2
        // https://stackoverflow.com/questions/747641/what-is-the-difference-between-decodeuricomponent-and-decodeuri
        for (let i=0; i<cookies.length; i++) {

            // Split each cookie by the delimiter "=" to separate the key and value.
            let cookie = cookies[i].split('=')

            // If this is a cookie with a key and value, then store it for this page.
            if (cookie.length === 2) {
                this.cookies[cookie[0]] = decodeURIComponent(cookie[1]);
                continue;
            }
            
            // If this is a cookie with just a key, then store it without a value.
            this.cookies[cookie[0]]
        }
    }
}