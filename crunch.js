/* Crunch - multi-precision integer arithmetic library | Copyright (C) 2014 Nenad Vukicevic | crunch.secureroom.net/license */

 /**
 * @module Crunch
 * Radix: 28 bits
 * Endianness: Big 
 */
function Crunch() {

  /**
   * Generate first n primes array
   *
   * @method nprimes
   * @param {integer} n
   * @return {array} array of primes
   */
  function nprimes(n) {
    for (var j, b, p = [2], l = 1, i = 3; l < n; i += 2) {
      for (j = 0; j < l; j++)
        if (!(b = (i % p[j] !== 0)))
          break;

      if (b)
        l = p.push(i);
    }

    return p;
  }


  /**
   * Generate n-length zero filled array
   *
   * @method nzeroes
   * @param {integer} n
   * @return {array} array of zeroes
   */
  function nzeroes(n) {
    for (var z = [], i = 0; i < n; i++)
      z.push(0);

    return z;
  }

  /** 
   * Predefined constants for performance: zeroes for zero-filled arrays, 
   * primes for sieve, ptests for Miller-Rabin primality
   */
  const zeroes = nzeroes(500);
  const primes = nprimes(1899);
  const ptests = primes.slice(0, 10).map(function(v){return [v]});

  /**
   * Count number of leading zeroes in MPI
   *
   * @method nlz
   * @param {array} x
   * @return {integer} number of leading zeroes
   */
  function nlz(x) {
    for (var l = x.length, i = 0; i < l; i++)
      if (x[i] !== 0)
        break;

    return i;
  }

  /**
   * Remove leading zeroes from MPI
   *
   * @method cut
   * @param {Array} x
   * @return {Array} new array without leading zeroes
   */
  function cut(x) {
    return x.slice(nlz(x));
  }

  /**
   * Compare values of two MPIs. 
   * Not safe for signed or leading zero MPI
   *
   * @method cmp
   * @param {array} x
   * @param {array} y
   * @return {integer} 1: x > y
   *                   0: x = y 
   *                  -1: x < y
   */
  function cmp(x, y) {
    var xl = x.length,
        yl = y.length; //zero front pad problem

    //check negative flag here

    if (xl < yl) {
      return -1;
    } else if (xl > yl) {
      return 1;
    }

    for (var i = 0; i < xl; i++) {
      if (x[i] < y[i]) return -1;
      if (x[i] > y[i]) return 1;
    }

    return 0;
  }

  /**
   * Most significant bit, base 28
   *
   * @method msb
   * @param {integer} x
   * @return {integer} position of msb, from left
   */
  function msb(x) {
    if (x === 0) return;

    for (var i = 134217728, l = 0; i > x; l++)
      i /= 2;

    return l;
  }

  /**
   * Least significant bit, base 28
   *
   * @method lsb
   * @param {integer} x
   * @return {integer} position of lsb, from right
   */
  function lsb(x) {
    if (x === 0) return;

    for (var l = 0; !(x & 1); l++)
      x /= 2;

    return l;
  }

  /**
   * MPI Addition
   * Handbook of Applied Cryptography (HAC) 14.7
   * Not safe for signed MPI, use 'sad' instead
   *
   * @method add
   * @param {array} x
   * @param {array} y
   * @return {array} x + y
   */
  function add(x, y) {
    var n = x.length,
        t = y.length,
        i = Math.max(n, t),
        c = 0,
        w = zeroes.slice(0, i);

    if (n < t) {
      x = zeroes.slice(0, t-n).concat(x);
    } else if (n > t) {
      y = zeroes.slice(0, n-t).concat(y);
    }

    for (i -= 1; i >= 0; i--) {
      w[i] = x[i] + y[i] + c;

      if (w[i] > 268435455) {
        c = 1;
        w[i] -= 268435456;
      } else {
        c = 0;
      }
    }

    if (c === 1)
      w.unshift(c);

    return w;
  }

  /**
   * MPI Subtraction
   * HAC 14.9
   * Not safe for signed MPI, use 'ssb' instead
   *
   * @method sub
   * @param {array} x
   * @param {array} y
   * @return {array} x - y
   */
  function sub(x, y, internal) {
    var n = x.length,
        t = y.length,
        i = Math.max(n, t),
        c = 0,
        w = zeroes.slice(0, i);

    if (n < t) {
      x = zeroes.slice(0, t-n).concat(x);
    } else if (n > t) {
      y = zeroes.slice(0, n-t).concat(y);
    }

    for (i -= 1; i >= 0; i--) {
      w[i] = x[i] - y[i] - c;

      if ( w[i] < 0 ) {
        c = 1;
        w[i] += 268435456;
      } else {
        c = 0;
      }
    }

    if (c === 1 && typeof internal == "undefined") {
      w = sub([], w, true);
      w[nlz(w)] *= -1;
      w.negative = true;
    }

    return w;
  }

  /**
   * MPI Multiplication
   * HAC 14.12
   *
   * @method mul
   * @param {array} x
   * @param {array} y
   * @return {array} x * y
   */
  function mul(x, y) {
    var yl, yh, xl, xh, t1, t2, c, j,
        n = x.length,
        i = y.length,
        w = zeroes.slice(0, n+i);

    while (i--) {
      c = 0;

      yl = y[i] & 16383;
      yh = y[i] >> 14;

      for (j = n-1; j>=0; j--) {
        xl = x[j] & 16383;
        xh = x[j] >> 14;

        t1 = yh*xl + xh*yl;
        t2 = yl*xl + ((t1 & 16383) << 14) + w[j+i+1] + c;

        w[j+i+1] = t2 & 268435455;
        c = yh*xh + (t1 >> 14) + (t2 >> 28);
      }

      w[i] = c;
    }

    if (w[0] === 0)
      w.shift();

    return w;
  }

  /**
   * MPI Squaring
   * HAC 14.16
   *
   * @method sqr
   * @param {array} x
   * @return {array} x * x
   */
  function sqr(x) {
    var l1, l2, h1, h2, t1, t2, j, c,
        i = x.length,
        w = zeroes.slice(0, 2*i);

    while (i--) {
      l1 = x[i] & 16383;
      h1 = x[i] >> 14;

      t1 = 2*h1*l1;
      t2 = l1*l1 + ((t1 & 16383) << 14) + w[2*i+1];

      w[2*i+1] = t2 & 268435455;
      c = h1*h1 + (t1 >> 14) + (t2 >> 28);

      for (j = i-1; j>=0; j--) {
        l2 = (2 * x[j]) & 16383;
        h2 = x[j] >> 13;

        t1 = h2*l1 + h1*l2;
        t2 = l2*l1 + ((t1 & 16383) << 14) + w[j+i+1] + c;
        w[j+i+1] = t2 & 268435455;
        c = h2*h1 + (t1 >> 14) + (t2 >> 28);
      }

      w[i] = c;
    }

    if (w[0] === 0)
      w.shift();
    
    return w;
  }

  /**
   * MPI Right Shift
   * Not safe for signed MPI, use 'srs' instead
   *
   * @method rsh
   * @param {array} x
   * @param {integer} s
   * @return {array} x >> s
   */
  function rsh(x, s) {
    var ss = s % 28,
        ls = Math.floor(s/28),
        l  = x.length - ls,
        w  = x.slice(0,l);

    if (ss) {
      while (--l) 
        w[l] = ((w[l] >> ss) | (w[l-1] << (28-ss))) & 268435455;

      w[l] = (w[l] >> ss);

      if (w[0] === 0)
        w.shift();
    }

    return w;
  }

  /**
   * MPI Left Shift
   *
   * @method lsh
   * @param {array} x
   * @param {integer} s
   * @return {array} x << s
   */
  function lsh(x, s) {
    var ss = s % 28,
        ls = Math.floor(s/28),
        l  = x.length,
        w  = [],
        t  = 0;

    if (ss) {
      while (l--) {
        w[l] = ((x[l] << ss) + t) & 268435455;
        t    = x[l] >>> (28-ss);
      }

      if (t !== 0)
        w.unshift(t);
    }

    return (ls) ? w.concat(zeroes.slice(0, ls)) : w;
  }

  /**
   * MPI Division
   * HAC 14.20
   *
   * @method div
   * @param {array} x
   * @param {array} y
   * @param {boolean} mod
   * @return {array} !mod: x / y
   *                  mod: x % y
   */
  function div(x, y, mod) {
    var u, v, xt, yt, d, q, k, i,
        s = msb(y[0]) - 1;

    if (s > 0) {
      u = lsh(x, s);
      v = lsh(y, s);
    } else {
      u = x.slice();
      v = y.slice();
    }

    d  = u.length - v.length;
    q  = [0];
    k  = v.concat(zeroes.slice(0, d));
    yt = v[0]*268435456 + v[1];

    // only mmcp as last resort. if x0 > k0 then do, 
    // if x0 < k0 then dont, check only if x0 = k0
    while (u[0] > k[0] || (u[0] === k[0] && cmp(u, k) > -1)) {
      q[0]++;
      u = sub(u, k);
    }

    for (i = 1; i <= d; i++) {
      q[i] = (u[i-1] === v[0]) ? 268435455 
                               : ~~((u[i-1]*268435456 + u[i])/v[0]);

      xt = u[i-1]*72057594037927936 + u[i]*268435456 + u[i+1];

      while (q[i]*yt > xt) //condition check occasionally fails due to precision problem
        q[i]--;

      k = mul(v, [q[i]]).concat(zeroes.slice(0, d-i)); //concat after multiply
      u = sub(u, k);

      if (u.negative) {
        u[nlz(u)] *= -1;
        u = sub(v.concat(zeroes.slice(0, d-i)), u);
        q[i]--;
      }
    }

    return (mod) ? (s > 0) ? rsh(cut(u), s) : cut(u) : cut(q);
  }

  /**
   * MPI Modulus
   *
   * @method mod
   * @param {array} x
   * @param {array} y
   * @return {array} x % y
   */
  function mod(x, y) {
    switch(cmp(x, y)) {
    case -1:
      return x;
    case 0:
      return 0;
    default:
      return div(x, y, true);
    }
  }

  /**
   * MPI Signed Addition
   * Safe for signed MPI
   *
   * @method sad
   * @param {array} x
   * @param {array} y
   * @return {array} x + y
   */
  function sad(x, y) {
    var a, b;
    if (x[0] >= 0) {
      if (y[0] >= 0) {
        return add(x, y);
      } else {
        b = y.slice();
        b[0] *= -1;
        return cut(sub(x, b));
      }
    } else {
      if (y[0] >= 0) {
        a = x.slice();
        a[0] *= -1;
        return cut(sub(y, a));
      } else {
        a = x.slice();
        b = y.slice();
        a[0] *= -1;
        b[0] *= -1;
        a = add(a, b);
        a[0] *= -1;
        return a;
      }
    }
  }

  /**
   * MPI Signed Subtraction
   * Safe for signed MPI
   *
   * @method ssb
   * @param {array} x
   * @param {array} y
   * @return {array} x - y
   */
  function ssb(x, y) {
    var a, b;
    if (x[0] >= 0) {
      if (y[0] >= 0) {
        return cut(sub(x, y));
      } else {
        b = y.slice();
        b[0] *= -1;
        return add(x, b);
      }
    } else {
      if (y[0] >= 0) {
        a = x.slice();
        a[0] *= -1;
        b = add(a, y);
        b[0] *= -1;
        return b;
      } else {
        a = x.slice();
        b = y.slice();
        a[0] *= -1;
        b[0] *= -1;
        return cut(sub(b, a));
      }
    }
  }

  /**
   * MPI Signed Right Shift
   * Safe for signed MPI
   *
   * @method srs
   * @param {array} x
   * @param {integer} s
   * @return {array} x >>> s
   */
  function srs(x, s) {
    if (x[0] < 0) {
      x[0] *= -1;
      x = rsh(x, s);
      x[0] *= -1;

      return x;
    }

    return rsh(x, s);
  }

  /**
   * MPI Greatest Common Divisor
   * HAC 14.61 - Binary Extended GCD
   *
   * @method gcd
   * @param {array} x
   * @param {array} y
   * @return {array} gcd x,y
   */
  function gcd(x, y) {
    var s,
        g = Math.min(lsb(x[x.length-1]), lsb(y[y.length-1])),
        u = rsh(x, g),
        v = rsh(y, g),
        a = [1], b = [0], c = [0], d = [1];

    while (u.length !== 1 || u[0] !== 0) {
      s = lsb(u[u.length-1]);
      u = rsh(u, s);
      while (s--) {
        if ((a[a.length-1]&1) === 0 && (b[b.length-1]&1) === 0) {
          a = srs(a, 1);
          b = srs(b, 1);
        } else {
          a = srs(sad(a, y), 1);
          b = srs(ssb(b, x), 1);
        }
      }

      s = lsb(v[v.length-1]);
      v = rsh(v, s);
      while (s--) {
        if ((c[c.length-1]&1) === 0 && (d[d.length-1]&1) === 0) {
          c = srs(c, 1);
          d = srs(d, 1);
        } else {
          c = srs(sad(c, y), 1);
          d = srs(ssb(d, x), 1);
        }
      }

      if ( cmp(u, v) >= 0 ) {
        u = sub(u, v);
        a = ssb(a, c);
        b = ssb(b, d);
      } else {
        v = sub(v, u);
        c = ssb(c, a);
        d = ssb(d, b);
      }
    }

    return (v.length === 1 && v[0] === 1) ? d : [];
  }

  /**
   * MPI Mod Inverse
   *
   * @method inv
   * @param {array} x
   * @param {array} y
   * @return {array} 1/x % y
   */
  function inv(x, y) {
    var u = gcd(y, x);

    while (u[0] < 0) {
      u[0] *= -1;
      u = sub(y, u);
    }

    return u;
  }

  /**
   * MPI Barret Modular Reduction
   * HAC 14.42
   *
   * @method bmr
   * @param {array} x
   * @param {array} y
   * @param {array} [mu]
   * @return {array} x % y
   */
  function bmr(x, m, mu) {
    if (cmp(x, m) < 0) return x; 
    //if equal, return 0;

    var q1, q2, q3, r1, r2, r, s,
        k = m.length;

    if (typeof mu == "undefined")
      mu = div([1].concat(zeroes.slice(0, 2*k)), m);

    q1 = x.slice(0, x.length-(k-1));
    q2 = mul(q1, mu);
    q3 = q2.slice(0, q2.length-(k+1));

    s  = x.length-(k+1);
    r1 = (s > 0) ? x.slice(s) : x.slice();

    r2 = mul(q3, m);
    s  = r2.length-(k+1);
    if (s > 0) r2 = r2.slice(s);

    r = cut(sub(r1, r2));
    if (r[0] < 0) {
      r[0] *= -1;
      r = cut(sub([1].concat(zeroes.slice(0, k+1)), r));
    }

    while (cmp(r, m) >= 0)
      r = cut(sub(r, m));

    return r;
  }

  /**
   * MPI Modular Exponentiation
   * HAC 14.76 Right-to-left binary exp
   *
   * @method exp
   * @param {array} x
   * @param {array} e
   * @param {array} n
   * @return {array} x^e % n
   */
  function exp(x, e, n) {
    var c, i, j,
        r = [1],
        u = div(r.concat(zeroes.slice(0, 2*n.length)), n);

    for (c = 268435456, i = e.length-1; i >= 0; i--) {
      if (i === 0)
        c = 1 << (27 - msb(e[0]));

      for (j = 1; j < c; j *= 2) {
        if (e[i] & j)
          r = bmr(mul(r, x), n, u);
        x = bmr(sqr(x), n, u);
      }
    }

    return bmr(mul(r, x), n, u);
  }

  /**
   * MPI Garner's Algorithm
   * HAC 14.71
   *
   * @method gar
   * @param {array} x
   * @param {array} p
   * @param {array} q
   * @param {array} d
   * @param {array} u
   * @param {array} [dp1]
   * @param {array} [dq1]
   * @return {array} x^d % pq
   */
  function gar(x, p, q, d, u, dp1, dq1) {
    var vp, vq, t;

    if (typeof dp1 == "undefined") {
      dp1 = mod(d, dec(p));
      dq1 = mod(d, dec(q));
    }

    vp = exp(mod(x, p), dp1, p);
    vq = exp(mod(x, q), dq1, q);

    if (cmp(vq, vp) < 0) {
      t = cut(sub(vp, vq));
      t = cut(bmr(mul(t, u), q));
      t = cut(sub(q, t));
    } else {
      t = cut(sub(vq, vp));
      t = cut(bmr(mul(t, u), q)); //bmr instead of mod, div fails too frequently because precision issue
    }

    return cut(add(vp, mul(t, p)));
  }

  /**
   * MPI Simple Mod
   * When n < 2^14
   *
   * @method mds
   * @param {array} x
   * @param {array} n
   * @return {array} x % n
   */
  function mds(x, n) {
    for(var i = 0, c = 0, l = x.length; i < l; i++) {
      c = ((x[i] >> 14) + (c << 14)) % n;
      c = ((x[i] & 16383) + (c << 14)) % n;
    }

    return c;
  }

  /**
   * MPI Exclusive-Or
   *
   * @method xor
   * @param {array} x
   * @param {array} y
   * @return {array} x xor y
   */
  function xor(x, y) {
    if (x.length != y.length) return;

    for(var r = [], l = x.length, i = 0; i < l; i++)
      r[i] = x[i] ^ y[i];

    return r;
  }

  /**
   * MPI Decrement
   *
   * @method dec
   * @param {array} x
   * @return {array} x - 1
   */
  function dec(x) {
    if (x[x.length-1] > 0) {
      var o = x.slice();
      o[x.length-1]--;
      return o;
    }

    return sub(x, [1]);
  }

  /**
   * Miller-Rabin Primality Test
   *
   * @method mrb
   * @param {array} n
   * @param {integer} iterations
   * @return {boolean} is prime
   */
  function mrb(n, iterations) {
    var m = sub(n, [1]),
        s = lsb(m[n.length-1]),
        r = rsh(n, s),
        y, t, j, i;

    for (i = 0; i < iterations; i++) {
      y = exp(ptests[i], r, n);
      if ( (y.length > 1 || y[0] !== 1) && cmp(y,m) !== 0 ) {
        j = 1; t = true;
        while (t && s > j++) {
          y = mod(sqr(y), n);
          if (y.length === 1 && y[0] === 1) 
            return false;

          t = (cmp(y,m) !== 0);
        }
        if (t) return false;
      }
    }

    return true;
  }

  /**
   * Primality Test
   * Sieve then Miller-Rabin
   *
   * @method testPrime
   * @param {array} n
   * @return {boolean} is prime
   */
  function tpr(n) {
    for (var i = 1, k = primes.length; i < k; i++)
      if (mds(n, primes[i]) === 0)
        return false;

    return mrb(n, 3);
  }

  /**
   * Find Next Prime
   *
   * @method nextPrime
   * @param {array} n
   * @return {array} 1st prime > n
   */
  function npr(n) {
    var l = n.length - 1;

    n[l] |= 1;

    while (!tpr(n))
      n[l] = (n[l]+2) % 268435456;

    return n;
  }

  /**
   * Convert byte array to 28 bit array
   *
   * @method ci
   * @param {array} a
   * @return {array} 28-bit array
   */
  function ci(a) {
    var i = [0,0,0,0,0,0].slice((a.length-1)%7).concat(a),
        o = [], 
        p;

    for (p = 0; p < i.length; p += 7)
      o.push((i[p]*1048576 + i[p+1]*4096 + i[p+2]*16 + (i[p+3]>>4)), ((i[p+3]&15)*16777216 + i[p+4]*65536 + i[p+5]*256 + i[p+6]));

    if (o[0] === 0)
      o.shift();

    return o;
  }

  /**
   * Convert 28 bit array to byte array
   *
   * @method co
   * @param {array} a
   * @return {array} byte array
   */
  function co(a) {
    var b = [0].slice((a.length-1)%2).concat(a),
        o = [],
        c, d, i;

    for (i = 0; i < b.length;) {
      c = b[i++]; 
      d = b[i++];

      o.push((c >> 20), (c >> 12 & 255), (c >> 4 & 255), ((c << 4 | d >> 24) & 255), (d >> 16 & 255), (d >> 8 & 255), (d & 255));
    }

    return cut(o);
  }

  return {
    
    /**
     * Constants for input/output conversion (8 <=> 28 bit array)
     *
     * RAWIN: No input conversion, expect 28 bit array
     * RAWOUT: No output conversion, return 28 bit array
     *
     * @default - Input and output conversion performed. 8-bit in, 8-bir out.
     * crunc.add(x, y)
     *
     * @example - no input, no output conversion. 28-bir in, 28-bit out.
     * crunch.add(x, y, crunch.RAWIN | crunch.RAWOUT)
     *
     * @example - only input conversion. 8-bit in, 28-bit out.
     * crunch.add(x, y, crunch.RAWOUT)
     */
    RAWIN:  2,
    RAWOUT: 1,

    /* Return zero array length n */
    zero: function(n) {
      return zeroes.slice(0, n);
    },

    /* Addition - Safe for signed numbers */
    add: function(x, y, raw) {
      if (!(raw & this.RAWIN)) {
        x = ci(x);
        y = ci(y);
      }

      return (raw & this.RAWOUT) ? sad(x, y) : co(sad(x, y));
    },

    /* Subtraction - Safe for signed numbers */
    sub: function(x, y, raw) {
      if (!(raw & this.RAWIN)) {
        x = ci(x);
        y = ci(y);
      }

      return (raw & this.RAWOUT) ? ssb(x, y) : co(ssb(x, y));
    },

    /* Multiplication */
    mul: function(x, y, raw) {
      if (!(raw & this.RAWIN)) {
        x = ci(x);
        y = ci(y);
      }

      return (raw & this.RAWOUT) ? mul(x, y) : co(mul(x, y));
    },

    /* Squaring */
    sqr: function(x, raw) {
      if (!(raw & this.RAWIN)) {
        x = ci(x);
      }

      return (raw & this.RAWOUT) ? sqr(x) : co(sqr(x));
    },

    /* Modular Exponentiation */
    exp: function(x, e, n, raw) {
      if (!(raw & this.RAWIN)) {
        x = ci(x);
        e = ci(e);
        n = ci(n);
      }

      return (raw & this.RAWOUT) ? exp(x, e, n) : co(exp(x, e, n));
    },

    /* Division */
    div: function(x, y, raw) {
      if (!(raw & this.RAWIN)) {
        x = ci(x);
        y = ci(y);
      }

      return (raw & this.RAWOUT) ? div(x, y) : co(div(x, y));
    },

    /* Remainder/Modulus */
    mod: function(x, y, raw) {
      if (!(raw & this.RAWIN)) {
        x = ci(x);
        y = ci(y);
      }

      return (raw & this.RAWOUT) ? mod(x, y) : co(mod(x, y));
    },

    /* Garner's Algorithm for Modular Exponentiation */
    gar: function(x, p, q, d, u, dp1, dq1, raw) {
      if (!(raw & this.RAWIN)) {
        x = ci(x);
        p = ci(p);
        q = ci(q);
        d = ci(d);
        u = ci(u);
        if (dp1) {
          dp1 = ci(dp1);
          dq1 = ci(dq1);
        }
      }

      return (raw & this.RAWOUT) ? gar(x, p, q, d, u, dp1, dq1) : co(gar(x, p, q, d, u, dp1, dq1));
    },

    /* Modular Inverse */
    inv: function(x, y, raw) {
      if (!(raw & this.RAWIN)) {
        x = ci(x);
        y = ci(y);
      }

      return (raw & this.RAWOUT) ? inv(x, y) : co(inv(x, y));
    },

    /* Cut leading zeroes */
    cut: function(x, raw) {
      if (!(raw & this.RAWIN)) {
        x = ci(x);
      }

      return (raw & this.RAWOUT) ? cut(x) : co(cut(x));
    },

    /* XOR */
    xor: function(x, y, raw) {
      return xor(x, y);
    },

    /* Decrement by 1 */
    decrement: function(x, raw) {
      if (!(raw & this.RAWIN)) {
        x = ci(x);
      }

      return (raw & this.RAWOUT) ? dec(x) : co(dec(x));
    },

    /* Compare two arrays */
    compare: function(x, y, raw) {
      return cmp(x, y);
    },

    /* Find next prime starting at x */
    nextPrime: function(x, raw) {
      if (!(raw & this.RAWIN)) {
        x = ci(x);
      }

      return (raw & this.RAWOUT) ? npr(x) : co(npr(x));
    },

    /* Test if x is prime */
    testPrime: function(x, raw) {
      if (!(raw & this.RAWIN)) {
        x = ci(x);
      }

      return (raw & this.RAWOUT) ? tpr(x) : co(tpr(x));
    },

    /**
     * Array base conversion
     *
     * @example - 8 => 28-bit
     * crunch.transform(x)
     *
     * @example - 28 => 8-bit
     * crunch.transform(x, crunch.RAWIN)
     */
    transform: function(x, raw) {
      return (raw & this.RAWIN) ? co(x) : ci(x);
    }
  }
}

/**
 * Crunch is runnable within a web worker.
 * Invoked by messaging.
 *
 * @example
 * 
 * Request: { "func": "add",
 *            "args": [[123], [456]] }
 *
 * Respnse: [579]
 */
if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
  var crunch = Crunch();

  self.onmessage = function(e) {
    self.postMessage(crunch[e.data.func].apply(crunch, e.data.args));
  }
}