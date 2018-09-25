// Type definitions for number-crunch
// Project: https://github.com/vukicevic/crunch
// Definitions by: Maximilian Münchow <https://github.com/maxmuen>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export = crunch;
export as namespace crunch;

declare namespace crunch {
    /**
     * Return zero array length n
     *
     * @param {Number} n
     * @return {Array} 0 length n
     */
    function zero(n: number): number[];

    /**
     * Signed Addition - Safe for signed MPI
     *
     * @param {Array} x
     * @param {Array} y
     * @return {Array} x + y
     */
    function add(x: number[], y: number[]): number[];

    /**
     * Signed Subtraction - Safe for signed MPI
     *
     * @method sub
     * @param {Array} x
     * @param {Array} y
     * @return {Array} x - y
     */
    function sub(x: number[], y: number[]): number[];

    /**
     * Multiplication
     *
     * @method mul
     * @param {Array} x
     * @param {Array} y
     * @return {Array} x * y
     */
    function mul(x: number[], y: number[]): number[];

    /**
     * Multiplication, with karatsuba method
     *
     * @method mulk
     * @param {Array} x
     * @param {Array} y
     * @return {Array} x * y
     */
    function mulk(x: number[], y: number[]): number[];

    /**
     * Squaring
     *
     * @method sqr
     * @param {Array} x
     * @return {Array} x * x
     */
    function sqr(x: number[]): number[];

    /**
     * Modular Exponentiation
     *
     * @method exp
     * @param {Array} x
     * @param {Array} e
     * @param {Array} n
     * @return {Array} x^e % n
     */
    function exp(x: number[], e: number[], n: number[]): number[];


    /**
     * Division
     *
     * @method div
     * @param {Array} x
     * @param {Array} y
     * @return {Array} x / y || undefined
     */
    function div(x: number[], y: number[]): number[] | undefined;


    /**
     * Modulus
     *
     * @method mod
     * @param {Array} x
     * @param {Array} y
     * @return {Array} x % y
     */
    function mod(x: number[], y: number[]): number[];

    /**
     * Barret Modular Reduction
     *
     * @method bmr
     * @param {Array} x
     * @param {Array} y
     * @param {Array} [mu]
     * @return {Array} x % y
     */
    function bmr(x: number[], y: number[], mu?: number[]): number[];

    /**
     * Garner's Algorithm
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
    function gar(x: number[], p: number[], q: number[], d: number[], u: number[], dp1?: number[], dq1?: number[]): number[];

    /**
     * Mod Inverse
     *
     * @method inv
     * @param {Array} x
     * @param {Array} y
     * @return {Array} 1/x % y || undefined
     */
    function inv(x: number[], y: number[]): number[];

    /**
     * Remove leading zeroes
     *
     * @method cut
     * @param {Array} x
     * @return {Array} x without leading zeroes
     */
    function cut(x: number[]): number[];

    /**
     * Factorial - for n < 268435456
     *
     * @method factorial
     * @param {Number} n
     * @return {Array} n!
     */
    function factorial(n: number): number[];

    /**
     * Bitwise AND
     * Undefined if x and y different lengths
     *
     * @method OP
     * @param {Array} x
     * @param {Array} y
     * @return {Array} x AND y
     */
    function and(x: number[], y: number[]): number[];

    /**
     * Bitwise OR
     * Undefined if x and y different lengths
     *
     * @method OP
     * @param {Array} x
     * @param {Array} y
     * @return {Array} x OR y
     */
    function or(x: number[], y: number[]): number[];

    /**
     * Bitwise XOR
     * Undefined if x and y different lengths
     *
     * @method OP
     * @param {Array} x
     * @param {Array} y
     * @return {Array} x XOR y
     */
    function xor(x: number[], y: number[]): number[];

    /**
     * Bitwise NOT
     *
     * @method not
     * @param {Array} x
     * @return {Array} NOT x
     */
    function not(x: number[]): number[];

    /**
     * Left Shift
     *
     * @method leftShift
     * @param {Array} x
     * @param {Integer} s
     * @return {Array} x << s
     */
    function leftShift(x: number[], s: number): number[];

    /**
     * Zero-fill Right Shift
     *
     * @method rightShift
     * @param {Array} x
     * @param {Integer} s
     * @return {Array} x >>> s
     */
    function rightShift(x: number[], s: number): number[];

    /**
     * Decrement
     *
     * @method decrement
     * @param {Array} x
     * @return {Array} x - 1
     */
    function decrement(x: number[]): number[];

    /**
     * Increment
     *
     * @method increment
     * @param {Array} x
     * @return {Array} x + 1
     */
    function increment(x: number[]): number[];

    /**
     * Compare values of two MPIs - Not safe for signed or leading zero MPI
     *
     * @method compare
     * @param {Array} x
     * @param {Array} y
     * @return {Number} 1: x > y
     *                  0: x = y
     *                 -1: x < y
     */
    function compare(x: number[], y: number[]): -1 | 0 | 1;

    /**
     * Find Next Prime
     *
     * @method nextPrime
     * @param {Array} x
     * @return {Array} 1st prime > x
     */
    function nextPrime(x: number[]): number[];

    /**
     * Primality Test
     * Sieve then Miller-Rabin
     *
     * @method testPrime
     * @param {Array} x
     * @return {boolean} is prime
     */
    function testPrime(x: number[]): boolean;

    /**
     * Array base conversion
     *
     * @method transform
     * @param {Array} x
     * @param {boolean} toRaw
     * @return {Array}  toRaw: 8 => 28-bit array
     *                 !toRaw: 28 => 8-bit array
     */
    function transform(x: number[] | Uint8Array, toRaw: boolean): number[];

    /**
     * Integer to String conversion
     *
     * @param {Array} x
     * @return {String} base 10 number as string
     */
    function stringify(x: number[]): String;

    /**
     * String to Integer conversion
     *
     * @method parse
     * @param {String} s
     * @return {Array} x
     */
    function parse(x: String): number[];

    /**
     * Change configuration of crunch
     *
     * @method config
     * @param {Boolean} rIn
     * @param {Boolean} rOut
     */
    function config(rIn: Boolean, rOut: Boolean): void;

}