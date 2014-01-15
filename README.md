Crunch
======
Crunch is an arbitrary-precision integer arithmetic library written in JavaScript.

Usage
-----
Crunch can be loaded as a classic script `<script src="crunch.js"></script>` or in a web worker `new Worker("crunch.js")`.

An arbitrary-precision integer is stored as an array of 8 or 28-bit integers. Internally, calculations are computed using 28-bit elements. 


**Example 1**
```c = Crunch();
x = [10, 123, 21, 127];
y = [4, 211, 176, 200];
a = c.add(x, y);```

The value of `a` is `[15, 78, 198, 71]`


Crunch accepts both 8 and 28-bit inputs and converts the values. Output can be an array of either 8 or 28-bit integer elements, depending on user preference.


**Example 2**
`b = c.add(x, y, c.RAWOUT);`

The value of `b` is `[256820807]`.


The results of examples 1 and 2 are equivalent. 

Array radix conversion can be performed via the `transform` function.  


**Example 3**
`c.transform([256820807], c.RAWIN);` evaluates to `[15, 78, 198, 71]`, 
the same value as `a`.

The reverse transform takes no second parameter `c.transform([15, 78, 198, 71]);`
and evaluates back to `[256820807]`.


Every arithmetic function provided by Crunch accepts a conversion parameter as its last argument.

Conversion Param | Input Conversion | Output Conversion
-|-|-
*undefined*|8=>28|28=>8
RAWIN|none|28=>8
RAWOUT|8=>28|none
RAWIN \| RAWOUT |none|none

`RAWIN` and `RAWOUT` are constants provided by Crunch, and can be accessed as properties of the crunch object`c.RAWIN`.

Arithmetic Functions
----

Function|Input Parameters|Output
-|-|-
add|x, y, raw|x + y
sub|x, y, raw|x - y
mul|x, y, raw|x * y
div|x, y, raw|x / y
sqr|x, raw|x * x
mod|x, y, raw| x % y
exp|x, e, n, raw| x^e % n
gar|x, p, q, d, u, dp1, dq1, raw| x^d % pq
inv|x, y, raw|1/x % y
dec|x, raw|x - 1
xor|x, y, raw|x XOR y
nextPrime|x, raw|Next prime number after x
testPrime|x, raw|Test if x is prime
transform|x, raw|Array radix conversion

Crunch also implements left shift `lsh`, right shift `rsh`, Barret modular reduction `bmr`, Miller-Rabin primality testing `mrb`, simple mod `mds`, greatest common divisor `gcd` and signed number arithmetic functions `ssb`, `sad` and `srs`. These are not exposed via the initialized Crunch object. The `raw` parameter is the conversion mode, and can be left blank if 8-bit input and output arrays are desired.

Web Workers
----

Crunch can be loaded to a Web Worker. Instructions to the worker take the following format `{func: "", args: []}`.

**Example 4**
```w = new Worker("crunch.js");
w.onmessage = function(m) { /* do something with result */ }};
m = {func: "add", args: [[10, 123, 21, 127], [4, 211, 176, 200]]};
w.postMessage(m);```
