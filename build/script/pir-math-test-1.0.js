var pir;
(function (pir) {
    (function (math) {
        var BigNumber = (function () {
            function BigNumber(asString) {
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
            BigNumber.prototype.stripLeadingZeros = function (src) {
                for (var i = 0, n = src.length; i < n; i++) {
                    if (src.charAt(i) !== '0')
                        break;
                }
                return src.substring(i);
            };

            BigNumber.prototype.stripTailingZeros = function (src) {
                for (var i = src.length - 1; i >= 0; i--) {
                    if (src.charAt(i) !== '0')
                        break;
                }
                return src.substring(0, i + 1);
            };

            BigNumber.prototype.leftPadWithZeros = function (src, length) {
                while (src.length < length)
                    src = '0' + src;
                return src;
            };

            BigNumber.prototype.rightPadWithZeros = function (src, length) {
                while (src.length < length)
                    src = src + '0';
                return src;
            };

            BigNumber.prototype.getIntegerPart = function () {
                return this.integerPart;
            };

            BigNumber.prototype.getFractionalPart = function () {
                return this.fractionalPart;
            };

            BigNumber.prototype.getIntegerPartLength = function () {
                if (this.integerPartLength == null) {
                    this.integerPartLength = this.getIntegerPart().length;
                }
                return this.integerPartLength;
            };

            BigNumber.prototype.getFractionalPartLength = function () {
                if (this.fractionalPartLength == null) {
                    this.fractionalPartLength = this.getFractionalPart().length;
                }
                return this.fractionalPartLength;
            };

            BigNumber.prototype.isLessThan = function (other) {
                return this.compareWith(other) < 0;
            };

            BigNumber.prototype.isMoreThan = function (other) {
                return this.compareWith(other) > 0;
            };

            BigNumber.prototype.equals = function (other) {
                return this.compareWith(other) == 0;
            };

            BigNumber.prototype.compareWith = function (other) {
                if (typeof other == 'string') {
                    var otherFloat = new BigNumber(other);
                } else {
                    var otherFloat = other;
                }

                if (!this.getIsNegative() && otherFloat.getIsNegative()) {
                    var result = 1;
                } else if (this.getIsNegative() && !otherFloat.getIsNegative()) {
                    var result = -1;
                } else {
                    var result = this.toAbsoluteString().localeCompare(otherFloat.toAbsoluteString());
                    if (this.getIsNegative())
                        result = -result;
                }

                return result;
            };

            BigNumber.prototype.getAbsolute = function () {
                return new BigNumber(this.toAbsoluteString());
            };

            BigNumber.prototype.getInverted = function () {
                return new BigNumber(this.toInvertedString());
            };

            BigNumber.prototype.add = function (other) {
                if (typeof other === 'string') {
                    var otherFloat = new BigNumber(other);
                } else {
                    var otherFloat = other;
                }

                var fractionalPartLength = Math.max(this.getFractionalPartLength(), otherFloat.getFractionalPartLength());
                var thisFractionalPart = this.rightPadWithZeros(this.getFractionalPart(), fractionalPartLength);
                var otherFractionalPart = this.rightPadWithZeros(otherFloat.getFractionalPart(), fractionalPartLength);

                var integerPartLength = Math.max(this.getIntegerPartLength(), otherFloat.getIntegerPartLength());
                var thisIntegerPart = this.leftPadWithZeros(this.getIntegerPart(), integerPartLength);
                var otherIntegerPart = this.leftPadWithZeros(otherFloat.getIntegerPart(), integerPartLength);

                var result = this.addPart(thisIntegerPart + thisFractionalPart, otherIntegerPart + otherFractionalPart);

                if (fractionalPartLength) {
                    result = result.slice(0, -fractionalPartLength) + '.' + result.slice(-fractionalPartLength);
                }
                return new BigNumber((this.getIsNegative() ? '-' : '') + result);
            };

            BigNumber.prototype.addPart = function (a, b) {
                var result = '';
                var carryOver = '';
                for (var i = Math.max(a.length, b.length) - 1; i >= 0; i--) {
                    var addResult = this.addDigits(a.charAt(i), b.charAt(i), carryOver);
                    result = addResult.result + result;
                    carryOver = addResult.carryOver;
                }
                if (carryOver) {
                    result = carryOver + result;
                }
                return result;
            };

            BigNumber.prototype.addDigits = function (a, b, carryOver) {
                var result = parseInt(a) + parseInt(b) + parseInt(carryOver || '0');
                var resultStr = result + '';
                return {
                    result: resultStr.charAt(resultStr.length - 1),
                    carryOver: resultStr.slice(0, -1)
                };
            };

            BigNumber.prototype.getIsPositive = function () {
                if (this.isPositive == null) {
                    this.isPositive = !this.getIsMarkedNegative() && !this.getIsZero();
                }
                return this.isPositive;
            };

            BigNumber.prototype.getIsNegative = function () {
                if (this.isNegative == null) {
                    this.isNegative = this.getIsMarkedNegative() && !this.getIsZero();
                }
                return this.isNegative;
            };

            BigNumber.prototype.getIsZero = function () {
                return this.getFractionalPartLength() == 0 && this.getIntegerPartLength() == 0;
            };

            BigNumber.prototype.getIsMarkedNegative = function () {
                return this.isMarkedNegative;
            };

            BigNumber.prototype.toAbsoluteString = function () {
                var fractionalPart = this.getFractionalPart();
                if (fractionalPart)
                    fractionalPart = '.' + fractionalPart;
                return (this.getIntegerPart() || '0') + fractionalPart;
            };

            BigNumber.prototype.toInvertedString = function () {
                return (this.getIsNegative() || this.getIsZero() ? '' : '-') + this.toAbsoluteString();
            };

            BigNumber.prototype.toString = function () {
                return (this.getIsNegative() ? '-' : '') + this.toAbsoluteString();
            };

            BigNumber.prototype.toNumber = function () {
                return Number(this.toString());
            };

            BigNumber.prototype.valueOf = function () {
                return this.toString();
            };
            return BigNumber;
        })();
        math.BigNumber = BigNumber;
    })(pir.math || (pir.math = {}));
    var math = pir.math;
})(pir || (pir = {}));
/// <reference path='../BigNumber.ts'/>
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

                    var a = new pir.math.BigNumber('-000111222333444555666777888');
                    console.log(a);
                    console.assert(a + 'px' === '-111222333444555666777888px');

                    var b = new pir.math.BigNumber('2.300');
                    console.log(b);
                    console.assert(b + 'px' === '2.3px');
                    console.assert(b * 1 === 2.3);
                    console.log(b - 2);

                    var c = new pir.math.BigNumber('9999999999999999999999999999999999999.00000000000000000009');
                    var d = new pir.math.BigNumber('9999999999999999999999999999999999999.0000000000000000009');
                    console.assert(c.isMoreThan(d) === false);
                    console.assert(c.isLessThan(d) === true);
                    console.assert(c.equals(d) === false);

                    console.assert(new pir.math.BigNumber('0').isMoreThan('-.1') === true);
                    console.assert(new pir.math.BigNumber('0').equals('') === true);
                    console.assert(new pir.math.BigNumber('0').equals('-') === true);
                    console.assert(new pir.math.BigNumber('.1').isMoreThan('.01') === true);
                    console.assert(new pir.math.BigNumber('.1').isLessThan('') === false);

                    console.assert(new pir.math.BigNumber('5.5').isLessThan('-3.4') === false);
                    console.assert(new pir.math.BigNumber('-5.5').isLessThan('-3.4') === true);
                    console.assert(new pir.math.BigNumber('5.5').isLessThan('3.4') === false);

                    console.assert(new pir.math.BigNumber('-3.4').isMoreThan('-5.5') === true);
                    console.assert(new pir.math.BigNumber('3.4').isMoreThan('-5.5') === true);
                    console.assert(new pir.math.BigNumber('3.4').isMoreThan('5.5') === false);

                    console.assert(new pir.math.BigNumber('3.4').equals('5.5') === false);
                    console.assert(new pir.math.BigNumber('5.5').equals('-5.5') === false);
                    console.assert(new pir.math.BigNumber('5.5').equals('5.5') === true);

                    console.assert(new pir.math.BigNumber('55.55').add('16.5').toString() === '72.05');
                    console.assert(new pir.math.BigNumber('-99.98').add('-0.03').toString() === '-100.01');
                    console.assert(new pir.math.BigNumber('999999999999999999999999999999999999').add('999999999999999999999999999999999999').toString() === '1999999999999999999999999999999999998');

                    console.assert(new pir.math.BigNumber('5.7').getAbsolute().toString() === '5.7');
                    console.assert(new pir.math.BigNumber('-5.7').getAbsolute().toString() === '5.7');
                    console.assert(new pir.math.BigNumber('-').getAbsolute().toString() === '0');

                    console.assert(new pir.math.BigNumber('5.7').getInverted().toString() === '-5.7');
                    console.assert(new pir.math.BigNumber('-5.7').getInverted().toString() === '5.7');
                    console.assert(new pir.math.BigNumber('0').getInverted().toString() === '0');
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
