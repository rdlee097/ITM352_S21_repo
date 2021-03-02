age_count = 1; // start the age counter
age = 23;
while(age_count < age) { // 1 < 23 = true       2 < 23 = true
    if( (age_count > age/2) && (age_count < (3/4)*age) ) { // 1 > 23/2 = false & 1 < 2/3(23) = true
        console.log("No age zone!"); // did not enter
    }
    else {
        console.log(`age ${age_count}`); // age 1
    }
    age_count++; // increment +1
    
}
console.log('Dan is ' + age_count + ' years old');