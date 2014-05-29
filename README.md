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
```

or in a web worker

```javascript
new Worker("crunch.js")
```

An arbitrary-precision integer is stored as an array of 8 or 28-bit integers. Internally, calculations are computed using 28-bit elements. 


**Example 1**
```javascript
c = Crunch();
x = [10, 123, 21, 127];
y = [4, 211, 176, 200];
a = c.add(x, y); //[15, 78, 198, 71]
```

Crunch accepts both 8 and 28-bit inputs and converts the values. Output can be an array of either 8 or 28-bit integer elements, depending on user preference.


**Example 2**

```javascript
c = Crunch(false, true);
b = c.add(x, y); //[256820807]
```

The results of examples 1 and 2 are equivalent. 

Array radix conversion can be performed via the `transform` function.


**Example 3**
```javascript
c.transform([256820807]); //[15, 78, 198, 71]
```

The reverse transform takes a second boolean parameter 

```javascript
c.transform([15, 78, 198, 71], true); //[256820807]
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

**Example 4**

```javascript
w = new Worker("crunch.js");
w.onmessage = function(m) { /* do something with result */ };
m = {func: "add", args: [[10, 123, 21, 127], [4, 211, 176, 200]]};
w.postMessage(m);
```
