Crunch
======
Crunch is an arbitrary-precision integer arithmetic library written in JavaScript.

* [Examples](http://crunch.secureroom.net/examples/)
* [Tests](http://crunch.secureroom.net/tests/)

Usage
-----
Crunch can be loaded as a classic script

```javascript
<script src="crunch.js"></script>
<script>
var crunch = Crunch();
</script>
```

or in a web worker

```javascript
var crunch = new Worker("crunch.js");
```

or it can be used as a node module

```javascript
npm install number-crunch
```

```javascript
var crunch = require("number-crunch");
```

**Example 1**
```javascript
x = [10, 123, 21, 127];
y = [4, 211, 176, 200];
a = crunch.add(x, y); //[15, 78, 198, 71]
```

Crunch accepts and returns 8-bit integer arrays which represent artbitrary-precision (big) integers, but internally it uses 28-bit arrays and performs the conversions automatically. Array radix conversion can also be performed via the `transform` function.


**Example 2**
```javascript
crunch.transform([256820807]); //[15, 78, 198, 71]
```

The reverse transform takes a second boolean parameter 

```javascript
crunch.transform([15, 78, 198, 71], true); //[256820807]
```


Arithmetic Functions
----

Function | Input Parameters | Output
--- | --- | ---
add | x, y | x + y
sub | x, y | x - y
mul | x, y | x * y
div | x, y | x / y
sqr | x | x * x
mod | x, y | x % y
exp | x, e, n | x^e % n
gar | x, p, q, d, u, dp1, dq1 | x^d % pq
inv | x, y | 1/x % y
xor | x, y | x XOR y
cut | x | Remove lead zeroes of x
zero | x | Return zero array of length x
compare | x, y | Compare x, y. Return -1: x < y, 0: x = y, 1: x > y
decrement | x | x - 1
nextPrime | x | Next prime number after x
testPrime | x | Test if x is prime
transform | x | Array radix conversion

Crunch also implements left shift `lsh`, right shift `rsh`, Barret modular reduction `bmr`, Miller-Rabin primality testing `mrb`, simple mod `mds`, greatest common divisor `gcd` and signed number arithmetic functions `ssb`, `sad` and `srs`. These are not exposed via the initialized Crunch object.

Web Workers
----

Crunch can be loaded to a Web Worker. Instructions to the worker take the following format 

```javascript
{func: "", args: []}
```

**Example 3**

```javascript
var crunch = new Worker("crunch.js");
var message = {func: "add", args: [[10, 123, 21, 127], [4, 211, 176, 200]]};

crunch.onmessage = function(m) { 
	console.log(m); 
};

crunch.postMessage(message);
```
