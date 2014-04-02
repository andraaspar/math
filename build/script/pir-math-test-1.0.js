var pir;
(function (pir) {
    (function (math) {
        var Float = (function () {
            function Float(asString) {
                this.isMarkedNegative = false;
                if (!/-?[0-9]*\.?[0-9]*/.test(asString)) {
                    throw 'Invalid Float input: ' + asString;
                }
                if (asString.charAt(0) === '-') {
                    this.isMarkedNegative = true;
                    asString = asString.substring(1);
                }

                var split = asString.split('.');
                this.integerPart = this.stripLeadingZeros(split[0]);
                this.fractionalPart = this.stripTailingZeros(split[1] || '');
            }
            Float.prototype.stripLeadingZeros = function (src) {
                for (var i = 0, n = src.length; i < n; i++) {
                    if (src.charAt(i) !== '0')
                        break;
                }
                return src.substring(i);
            };

            Float.prototype.stripTailingZeros = function (src) {
                for (var i = src.length - 1; i >= 0; i--) {
                    if (src.charAt(i) !== '0')
                        break;
                }
                return src.substring(0, i + 1);
            };

            Float.prototype.leftPadWithZeros = function (src, length) {
                while (src.length < length)
                    src = '0' + src;
                return src;
            };

            Float.prototype.rightPadWithZeros = function (src, length) {
                while (src.length < length)
                    src = src + '0';
                return src;
            };

            Float.prototype.getIntegerPart = function () {
                return this.integerPart;
            };

            Float.prototype.getFractionalPart = function () {
                return this.fractionalPart;
            };

            Float.prototype.getIntegerPartLength = function () {
                if (this.integerPartLength == null) {
                    this.integerPartLength = this.getIntegerPart().length;
                }
                return this.integerPartLength;
            };

            Float.prototype.getFractionalPartLength = function () {
                if (this.fractionalPartLength == null) {
                    this.fractionalPartLength = this.getFractionalPart().length;
                }
                return this.fractionalPartLength;
            };

            Float.prototype.isLessThan = function (other) {
                return this.compareWith(other) > 0;
            };

            Float.prototype.isGreaterThan = function (other) {
                return this.compareWith(other) < 0;
            };

            Float.prototype.equals = function (other) {
                return this.compareWith(other) == 0;
            };

            Float.prototype.compareWith = function (other) {
                if (typeof other == 'string') {
                    other = new Float(other);
                }

                var result = 0;

                if (!this.getIsNegative() && other.getIsNegative()) {
                    result = -1;
                } else if (this.getIsNegative() && !other.getIsNegative()) {
                    result = 1;
                } else {
                    result = this.compareParts(this.getIntegerPart(), other.getIntegerPart());
                    if (!result) {
                        var length = Math.max(this.getFractionalPartLength(), other.getFractionalPartLength());
                        result = this.compareParts(this.rightPadWithZeros(this.getFractionalPart(), length), this.rightPadWithZeros(other.getFractionalPart(), length));
                    }
                    if (this.getIsNegative())
                        result = -result;
                }

                return result;
            };

            Float.prototype.compareParts = function (a, b) {
                var result = 0;

                if (a.length > b.length) {
                    result = -1;
                } else if (a.length < b.length) {
                    result = 1;
                } else {
                    for (var i = 0, n = a.length; i < n; i++) {
                        result = this.compareDigits(a.charAt(i), b.charAt(i));
                        if (result)
                            break;
                    }
                }

                return result;
            };

            Float.prototype.compareDigits = function (a, b) {
                return parseInt(b) - parseInt(a);
            };

            Float.prototype.getIsPositive = function () {
                if (this.isPositive == null) {
                    this.isPositive = !this.getIsMarkedNegative() && !this.getIsZero();
                }
                return this.isPositive;
            };

            Float.prototype.getIsNegative = function () {
                if (this.isNegative == null) {
                    this.isNegative = this.getIsMarkedNegative() && !this.getIsZero();
                }
                return this.isNegative;
            };

            Float.prototype.getIsZero = function () {
                return this.getFractionalPartLength() == 0 && this.getIntegerPartLength() == 0;
            };

            Float.prototype.getIsMarkedNegative = function () {
                return this.isMarkedNegative;
            };

            Float.prototype.toString = function () {
                var fractionalPart = this.getFractionalPart();
                if (fractionalPart)
                    fractionalPart = '.' + fractionalPart;
                return (this.getIsNegative() ? '-' : '') + (this.getIntegerPart() || '0') + fractionalPart;
            };

            Float.prototype.toNumber = function () {
                return Number(this.toString());
            };

            Float.prototype.valueOf = function () {
                return this.toString();
            };
            return Float;
        })();
        math.Float = Float;
    })(pir.math || (pir.math = {}));
    var math = pir.math;
})(pir || (pir = {}));
/// <reference path='../Float.ts'/>
var pir;
(function (pir) {
    (function (math) {
        (function (test) {
            var Main = (function () {
                function Main() {
                    window.addEventListener('load', this.onDOMLoaded.bind(this));
                }
                Main.prototype.onDOMLoaded = function () {
                    console.log('pir.math test');

                    var a = new pir.math.Float('-000111222333444555666777888');
                    console.log(a);
                    console.assert(a + 'px' === '-111222333444555666777888px');

                    var b = new pir.math.Float('2.300');
                    console.log(b);
                    console.assert(b + 'px' === '2.3px');
                    console.assert(b * 1 === 2.3);
                    console.log(b - 2);

                    var c = new pir.math.Float('9999999999999999999999999999999999999.00000000000000000009');
                    var d = new pir.math.Float('9999999999999999999999999999999999999.0000000000000000009');
                    console.assert(!c.isGreaterThan(d));
                    console.assert(c.isLessThan(d));
                    console.assert(!c.equals(d));

                    console.assert(!(new pir.math.Float('3.4').isLessThan('-5.5')));
                };
                return Main;
            })();
            test.Main = Main;
        })(math.test || (math.test = {}));
        var test = math.test;
    })(pir.math || (pir.math = {}));
    var math = pir.math;
})(pir || (pir = {}));

var mathTestMain = new pir.math.test.Main();
