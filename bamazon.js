var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    loadMarket();
});

function loadMarket() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        console.log("Welcome to Bamazon! \nProducts Available");
        for (var i=0; i < res.length; i++) {
            console.log("Item ID: " + res[i].item_id + " | Product: " + res[i].product_name);
            console.log("Department: " + res[i].department_name + " | Price: $" + res[i].price);
            console.log("In Stock:" + res[i].stock_quantity);
            console.log("--------------------");
        };
    makePurchase();
    });
};

function makePurchase() {
    inquirer
    .prompt({
        name: "item",
        type: "input",
        message: "What is the item ID for the product you would like to purchase?",
    })
    .then(function(answer) {
        var query = "SELECT product_name, department_name, price, stock_quantity FROM products WHERE ?";
        var itemNumber = parseInt(answer.item);
        connection.query(query, {item_id: itemNumber}, function(err, res) {
            for (var i = 0; i < res.length; i++) {
                var item = res[i];
                console.log("Product: " + item.product_name + " | Department: " + item.department_name);
                console.log("Price: $" + item.price + " | In Stock: " + item.stock_quantity);
                console.log("--------------------");
                inquirer
                .prompt({
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to purchase?"
                })
                .then(function(answer) {
                    var quantity = parseInt(answer.quantity);
                    var stock = parseInt(item.stock_quantity);
                    if (quantity <= stock) {
                        console.log("Your Total Will Be: $" + quantity*item.price);
                        var newQuantity = stock- quantity;
                        connection.query("UPDATE products SET stock_quantity = ? WHERE ?", [{newQuantity: newQuantity}, 
                            {item_id: itemNumber}], function(err, res) {
                            console.log("Updated Stock Quantity: " + newQuantity);
                            inquirer
                            .prompt({
                                name: "neworder",
                                type: "input",
                                message: "Would you like to make another purchase?"
                            })
                            .then(function(answer) {
                                if (answer.neworder == "Yes") {
                                    loadMarket();
                                } else {
                                    console.log("We hope you enjoy your new " + item.product_name);
                                }
                            })
                        });
                    } else {
                        console.log("Sorry, we do not have enough of that product available.")

                    };
                });
            };
        });
    });
};
