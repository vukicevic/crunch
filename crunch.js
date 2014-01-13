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
   * @param {Integer} n
   * @return {Array} array of primes
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
   * @param {Integer} n
   * @return {Array} array of zeroes
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

  return {

    /**
     * Count number of leading zeroes in MPI
     *
     * @method nlz
     * @param {Array} x
     * @return {Integer} number of leading zeroes
     */
    nlz: function(x) {
      for (var l = x.length, i = 0; i < l; i++)
        if (x[i] !== 0)
          break;

      return i;
    },

    /**
     * Remove leading zeroes from MPI
     *
     * @method cut
     * @param {Array} x
     * @return {Array} new array without leading zeroes
     */
    cut: function(x) {
      return x.slice(this.nlz(x));
    },

    /**
     * Compare values of two MPIs. 
     * Not safe for signed or leading zero MPI
     *
     * @method cmp
     * @param {Array} x
     * @param {Array} y
     * @return {Integer} 1: x > y
     *                   0: x = y 
     *                  -1: x < y
     */
    cmp: function(x, y) {
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
    },

    /**
     * Most significant bit, base 28
     *
     * @method msb
     * @param {Integer} x
     * @return {Integer} position of msb, from left
     */
    msb: function(x) {
      if (x === 0) return;

      for (var i = 134217728, l = 0; i > x; l++)
        i /= 2;

      return l;
    },

    /**
     * Least significant bit, base 28
     *
     * @method lsb
     * @param {Integer} x
     * @return {Integer} position of lsb, from right
     */
    lsb: function(x) {
      if (x === 0) return;

      for (var l = 0; !(x & 1); l++)
        x /= 2;

      return l;
    },

    /**
     * MPI Addition
     * Handbook of Applied Cryptography (HAC) 14.7
     * Not safe for signed MPI, use 'sad' instead
     *
     * @method add
     * @param {Array} x
     * @param {Array} y
     * @return {Array} x + y
     */
    add: function(x, y) {
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
    },

    /**
     * MPI Subtraction
     * HAC 14.9
     * Not safe for signed MPI, use 'ssb' instead
     *
     * @method sub
     * @param {Array} x
     * @param {Array} y
     * @return {Array} x - y
     */
    sub: function(x, y, internal) {
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
        w = this.sub([], w, true);
        w[this.nlz(w)] *= -1;
        w.negative = true;
      }

      return w;
    },

    /**
     * MPI Multiplication
     * HAC 14.12
     *
     * @method mul
     * @param {Array} x
     * @param {Array} y
     * @return {Array} x * y
     */
    mul: function(x, y) {
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
    },

    /**
     * MPI Squaring
     * HAC 14.16
     *
     * @method sqr
     * @param {Array} x
     * @return {Array} x * x
     */
    sqr: function(x) {
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
    },

    /**
     * MPI Right Shift
     * Not safe for signed MPI, use 'srs' instead
     *
     * @method rsh
     * @param {Array} x
     * @param {Integer} s
     * @return {Array} x >> s
     */
    rsh: function(x, s) {
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
    },

    /**
     * MPI Left Shift
     *
     * @method lsh
     * @param {Array} x
     * @param {Integer} s
     * @return {Array} x << s
     */
    lsh: function(x, s) {
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
    },

    /**
     * MPI Division
     * HAC 14.20
     *
     * @method div
     * @param {Array} x
     * @param {Array} y
     * @param {Boolean} mod
     * @return {Array} !mod: x / y
     *                  mod: x % y
     */
    div: function(x, y, mod) {
      var u, v, xt, yt, d, q, k, i,
          s = this.msb(y[0]) - 1;

      if (s > 0) {
        u = this.lsh(x, s);
        v = this.lsh(y, s);
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
      while (u[0] > k[0] || (u[0] === k[0] && this.cmp(u, k) > -1)) {
        q[0]++;
        u = this.sub(u, k);
      }

      for (i = 1; i <= d; i++) {
        q[i] = (u[i-1] === v[0]) ? 268435455 : Math.floor((u[i-1]*268435456 + u[i])/v[0]);
        xt = u[i-1]*72057594037927936 + u[i]*268435456 + u[i+1];

        while (q[i]*yt > xt) //condition check fails due to precision problem with bits = 28
          q[i]--;

        k = this.mul(v, [q[i]]).concat(zeroes.slice(0, d-i)); //concat after multiply
        u = this.sub(u, k);

        if (u.negative) {
          u[this.nlz(u)] *= -1;
          u = this.sub(v.concat(zeroes.slice(0, d-i)), u);
          q[i]--;
        }
      }

      return (mod) ? (s > 0) ? this.rsh(this.cut(u), s) : this.cut(u) : this.cut(q);
    },

    /**
     * MPI Modulus
     *
     * @method mod
     * @param {Array} x
     * @param {Array} y
     * @return {Array} x % y
     */
    mod: function(x, y) {
      switch(this.cmp(x, y)) {
      case -1:
        return x;
      case 0:
        return 0;
      default:
        return this.div(x, y, true);
      }
    },

    /**
     * MPI Signed Addition
     * Safe for signed MPI
     *
     * @method sad
     * @param {Array} x
     * @param {Array} y
     * @return {Array} x + y
     */
    sad: function(x, y) {
      var a, b;
      if (x[0] >= 0) {
        if (y[0] >= 0) {
          return this.add(x, y);
        } else {
          b = y.slice();
          b[0] *= -1;
          return this.cut(this.sub(x, b));
        }
      } else {
        if (y[0] >= 0) {
          a = x.slice();
          a[0] *= -1;
          return this.cut(this.sub(y, a));
        } else {
          a = x.slice();
          b = y.slice();
          a[0] *= -1;
          b[0] *= -1;
          a = this.add(a, b);
          a[0] *= -1;
          return a;
        }
      }
    },

    /**
     * MPI Signed Subtraction
     * Safe for signed MPI
     *
     * @method ssb
     * @param {Array} x
     * @param {Array} y
     * @return {Array} x - y
     */
    ssb: function(x, y) {
      var a, b;
      if (x[0] >= 0) {
        if (y[0] >= 0) {
          return this.cut(this.sub(x, y));
        } else {
          b = y.slice();
          b[0] *= -1;
          return this.add(x, b);
        }
      } else {
        if (y[0] >= 0) {
          a = x.slice();
          a[0] *= -1;
          b = this.add(a, y);
          b[0] *= -1;
          return b;
        } else {
          a = x.slice();
          b = y.slice();
          a[0] *= -1;
          b[0] *= -1;
          return this.cut(this.sub(b, a));
        }
      }
    },

    /**
     * MPI Signed Right Shift
     * Safe for signed MPI
     *
     * @method srs
     * @param {Array} x
     * @param {Integer} s
     * @return {Array} x >>> s
     */
    srs: function(x, s) {
      if (x[0] < 0) {
        x[0] *= -1;
        x = this.rsh(x, s);
        x[0] *= -1;

        return x;
      }

      return this.rsh(x, s);
    },

    /**
     * MPI Greatest Common Divisor
     * HAC 14.61 - Binary Extended GCD
     *
     * @method gcd
     * @param {Array} x
     * @param {Array} y
     * @return {Array} gcd x,y
     */
    gcd: function(x, y) {
      var s,
          g = Math.min(this.lsb(x[x.length-1]), this.lsb(y[y.length-1])),
          u = this.rsh(x, g),
          v = this.rsh(y, g),
          a = [1], b = [0], c = [0], d = [1];

      while (u.length !== 1 || u[0] !== 0) {
        s = this.lsb(u[u.length-1]);
        u = this.rsh(u, s);
        while (s--) {
          if ((a[a.length-1]&1) === 0 && (b[b.length-1]&1) === 0) {
            a = this.srs(a, 1);
            b = this.srs(b, 1);
          } else {
            a = this.srs(this.sad(a, y), 1);
            b = this.srs(this.ssb(b, x), 1);
          }
        }

        s = this.lsb(v[v.length-1]);
        v = this.rsh(v, s);
        while (s--) {
          if ((c[c.length-1]&1) === 0 && (d[d.length-1]&1) === 0) {
            c = this.srs(c, 1);
            d = this.srs(d, 1);
          } else {
            c = this.srs(this.sad(c, y), 1);
            d = this.srs(this.ssb(d, x), 1);
          }
        }

        if ( this.cmp(u, v) >= 0 ) {
          u = this.sub(u, v);
          a = this.ssb(a, c);
          b = this.ssb(b, d);
        } else {
          v = this.sub(v, u);
          c = this.ssb(c, a);
          d = this.ssb(d, b);
        }
      }

      return (v.length === 1 && v[0] === 1) ? d : [];
    },

    /**
     * MPI Mod Inverse
     *
     * @method inv
     * @param {Array} x
     * @param {Array} y
     * @return {Array} 1/x % y
     */
    inv: function(x, y) {
      var u = this.gcd(y, x);

      while (u[0] < 0) {
        u[0] *= -1;
        u = this.sub(y, u);
      }

      return u;
    },

    /**
     * MPI Barret Modular Reduction
     * HAC 14.42
     *
     * @method bmr
     * @param {Array} x
     * @param {Array} y
     * @param {Array} [mu]
     * @return {Array} x % y
     */
    bmr: function(x, m, mu) {
      if (this.cmp(x, m) < 0) return x; 
      //if equal, return 0;

      var q1, q2, q3, r1, r2, r, s,
          k = m.length;

      if (typeof mu == "undefined")
        mu = this.div([1].concat(zeroes.slice(0, 2*k)), m);

      q1 = x.slice(0, x.length-(k-1));
      q2 = this.mul(q1, mu);
      q3 = q2.slice(0, q2.length-(k+1));

      s  = x.length-(k+1);
      r1 = (s > 0) ? x.slice(s) : x.slice();

      r2 = this.mul(q3, m);
      s  = r2.length-(k+1);
      if (s > 0) r2 = r2.slice(s);

      r = this.cut(this.sub(r1, r2));
      if (r[0] < 0) {
        r[0] *= -1;
        r = this.cut(this.sub([1].concat(zeroes.slice(0, k+1)), r));
      }

      while (this.cmp(r, m) >= 0)
        r = this.cut(this.sub(r, m));

      return r;
    },

    /**
     * MPI Modular Exponentiation
     * HAC 14.76 Right-to-left binary exp
     *
     * @method exp
     * @param {Array} x
     * @param {Array} e
     * @param {Array} n
     * @return {Array} x^e % n
     */
    exp: function(x, e, n) {
      var c, i, j,
          r = [1],
          u = this.div(r.concat(zeroes.slice(0, 2*n.length)), n);

      for (c = 268435456, i = e.length-1; i >= 0; i--) {
        if (i === 0)
          c = 1 << (27 - this.msb(e[0]));

        for (j = 1; j < c; j *= 2) {
          if (e[i] & j)
            r = this.bmr(this.mul(r, x), n, u);
          x = this.bmr(this.sqr(x), n, u);
        }
      }

      return this.bmr(this.mul(r, x), n, u);
    },

    /**
     * MPI Garner's Algorithm
     * HAC 14.71
     *
     * @method gar
     * @param {Array} x
     * @param {Array} p
     * @param {Array} q
     * @param {Array} d
     * @param {Array} u
     * @param {Array} [dp1]
     * @param {Array} [dq1]
     * @return {Array} x^d % pq
     */
    gar: function(x, p, q, d, u, dp1, dq1) {
      var vp, vq, t;

      if (typeof dp1 == "undefined") {
        dp1 = this.mod(d, this.dec(p));
        dq1 = this.mod(d, this.dec(q));
      }

      vp = this.exp(this.mod(x, p), dp1, p);
      vq = this.exp(this.mod(x, q), dq1, q);

      if (this.cmp(vq, vp) < 0) {
        t = this.cut(this.sub(vp, vq));
        t = this.cut(this.bmr(this.mul(t, u), q));
        t = this.cut(this.sub(q, t));
      } else {
        t = this.cut(this.sub(vq, vp));
        t = this.cut(this.bmr(this.mul(t, u), q)); //bmr instead of mod, div fails too frequently because precision issue
      }

      return this.cut(this.add(vp, this.mul(t, p)));
    },

    /**
     * MPI Simple Mod
     * When n < 2^14
     *
     * @method mds
     * @param {Array} x
     * @param {Array} n
     * @return {Array} x % n
     */
    mds: function(x, n) {
      for(var i = 0, c = 0, l = x.length; i < l; i++) {
        c = ((x[i] >> 14) + (c << 14)) % n;
        c = ((x[i] & 16383) + (c << 14)) % n;
      }

      return c;
    },

    /**
     * MPI Exclusive-Or
     *
     * @method xor
     * @param {Array} x
     * @param {Array} y
     * @return {Array} x xor y
     */
    xor: function(x, y) {
      if (x.length != y.length) return;

      for(var r = [], l = x.length, i = 0; i < l; i++)
        r[i] = x[i] ^ y[i];

      return r;
    },

    /**
     * MPI Decrement
     *
     * @method dec
     * @param {Array} x
     * @return {Array} x - 1
     */
    dec: function(x) {
      if (x[x.length-1] > 0) {
        var o = x.slice();
        o[x.length-1]--;
        return o;
      }

      return this.sub(x, [1]);
    },

    /**
     * Miller-Rabin Primality Test
     *
     * @method mrb
     * @param {Array} n
     * @param {Integer} iterations
     * @return {Boolean} is prime
     */
    mrb: function(n, iterations) {
      var m = this.sub(n, [1]),
          s = this.lsb(m[n.length-1]),
          r = this.rsh(n, s),
          y, t, j, i;

      for (i = 0; i < iterations; i++) {
        y = this.exp(ptests[i], r, n);
        if ( (y.length > 1 || y[0] !== 1) && this.cmp(y,m) !== 0 ) {
          j = 1; t = true;
          while (t && s > j++) {
            y = this.mod(this.sqr(y), n);
            if (y.length === 1 && y[0] === 1) 
              return false;

            t = (this.cmp(y,m) !== 0);
          }
          if (t) return false;
        }
      }

      return true;
    },

    /**
     * Primality Test
     * Sieve then Miller-Rabin
     *
     * @method testPrime
     * @param {Array} n
     * @return {Boolean} is prime
     */
    testPrime: function(n) {
      for (var i = 1, k = primes.length; i < k; i++)
        if (this.mds(n, primes[i]) === 0)
          return false;

      return this.mrb(n, 3);
    },

    /**
     * Find Next Prime
     *
     * @method nextPrime
     * @param {Array} n
     * @return {Array} 1st prime > n
     */
    nextPrime: function(n) {
      var l = n.length - 1;

      n[l] |= 1;

      while (!this.testPrime(n))
        n[l] = (n[l]+2) % 268435456;

      return n;
    },

    /**
     * Convert byte array to 28 bit array
     *
     * @method c8to28
     * @param {Array} a
     * @return {Array} 28-bit array
     */
    c8to28: function(a) {
      var i = [0,0,0,0,0,0].slice((a.length-1)%7).concat(a),
          o = [], 
          p;

      for (p = 0; p < i.length; p += 7)
        o.push((i[p]*1048576 + i[p+1]*4096 + i[p+2]*16 + (i[p+3]>>4)), ((i[p+3]&15)*16777216 + i[p+4]*65536 + i[p+5]*256 + i[p+6]));

      if (o[0] === 0)
        o.shift();

      return o;
    },

    /**
     * Convert 28 bit array to byte array
     *
     * @method c28to8
     * @param {Array} a
     * @return {Array} byte array
     */
    c28to8: function(a) {
      var b = [0].slice((a.length-1)%2).concat(a),
          o = [],
          c, d, i;

      for (i = 0; i < b.length;) {
        c = b[i++]; 
        d = b[i++];

        o.push((c >> 20), (c >> 12 & 255), (c >> 4 & 255), ((c << 4 | d >> 24) & 255), (d >> 16 & 255), (d >> 8 & 255), (d & 255));
      }

      return this.cut(o);
    },
  }
}

/**
 * Crunch is runnable within a web worker.
 * Invoked by messaging. Sample request:
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