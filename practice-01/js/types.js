"use strict";

// 1. "8" + 2
console.log('1. "8" + 2');
console.log("Значение:", "8" + 2);
console.log("Тип:", typeof ("8" + 2));

// 2. "8" - 2
console.log('\n2. "8" - 2');
console.log("Значение:", "8" - 2);
console.log("Тип:", typeof ("8" - 2));

// 3. Number("8") + 2
console.log('\n3. Number("8") + 2');
console.log("Значение:", Number("8") + 2);
console.log("Тип:", typeof (Number("8") + 2));

// 4. "12" > "3"
console.log('\n4. "12" > "3"');
console.log("Значение:", "12" > "3");
console.log("Тип:", typeof ("12" > "3"));

// 5. 12 === "12"
console.log('\n5. 12 === "12"');
console.log("Значение:", 12 === "12");
console.log("Тип:", typeof (12 === "12"));

// 6. Number("")
console.log('\n6. Number("")');
console.log("Значение:", Number(""));
console.log("Тип:", typeof Number(""));

// 7. Number("text")
console.log('\n7. Number("text")');
console.log("Значение:", Number("text"));
console.log("Тип:", typeof Number("text"));

// 8. Boolean("false")
console.log('\n8. Boolean("false")');
console.log("Значение:", Boolean("false"));
console.log("Тип:", typeof Boolean("false"));

// 9. typeof null
console.log("\n9. typeof null");
console.log("Значение выражения:", typeof null);
console.log("Тип результата:", typeof (typeof null));

// 10. typeof NaN
console.log("\n10. typeof NaN");
console.log("Значение выражения:", typeof NaN);
console.log("Тип результата:", typeof (typeof NaN));