var monthly_income = [10000, 20000, 30000];
var state_tax = 0.05;

function calculate_tax_owed(monthly_sales,tax_rate) {
    var tax_owed = [];
    for (var i=0; i<monthly_income.length; i++) {
        tax_owed.push(monthly_sales[i] * tax_rate);
    }
    return tax_owed;
}
console.log(calculate_tax_owed(monthly_income,state_tax));