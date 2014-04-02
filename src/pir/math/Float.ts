module pir.math {
	export interface IAddResult {
		result: string;
		carryOver: number;
	}
	
	export class Float {

		private isNegative: boolean;
		private isPositive: boolean;
		private isMarkedNegative = false;
		private integerPart: string;
		private fractionalPart: string;
		private integerPartLength: number;
		private fractionalPartLength: number;

		constructor(asString: string) {
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

		private stripLeadingZeros(src: string) {
			for (var i = 0, n = src.length; i < n; i++) {
				if (src.charAt(i) !== '0') break;
			}
			return src.substring(i);
		}

		private stripTailingZeros(src: string) {
			for (var i = src.length - 1; i >= 0; i--) {
				if (src.charAt(i) !== '0') break;
			}
			return src.substring(0, i + 1);
		}

		private leftPadWithZeros(src: string, length: number) {
			while (src.length < length) src = '0' + src;
			return src;
		}

		private rightPadWithZeros(src: string, length: number) {
			while (src.length < length) src = src + '0';
			return src;
		}

		getIntegerPart() {
			return this.integerPart;
		}

		getFractionalPart() {
			return this.fractionalPart;
		}

		getIntegerPartLength() {
			if (this.integerPartLength == null) {
				this.integerPartLength = this.getIntegerPart().length;
			}
			return this.integerPartLength;
		}

		getFractionalPartLength() {
			if (this.fractionalPartLength == null) {
				this.fractionalPartLength = this.getFractionalPart().length;
			}
			return this.fractionalPartLength;
		}

		isLessThan(other: Float);
		isLessThan(other: string);
		isLessThan(other) {
			return this.compareWith(other) > 0;
		}

		isMoreThan(other: Float);
		isMoreThan(other: string);
		isMoreThan(other) {
			return this.compareWith(other) < 0;
		}


		equals(other: Float);
		equals(other: string);
		equals(other) {
			return this.compareWith(other) == 0;
		}

		compareWith(other: Float);
		compareWith(other: string);
		compareWith(other) {
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
					result = this.compareParts(
						this.rightPadWithZeros(this.getFractionalPart(), length),
						this.rightPadWithZeros(other.getFractionalPart(), length)
						);
				}
				if (this.getIsNegative()) result = -result;
			}

			return result;
		}

		private compareParts(a: string, b: string) {
			var result = 0;

			if (a.length > b.length) {
				result = -1;
			} else if (a.length < b.length) {
				result = 1;
			} else {
				for (var i = 0, n = a.length; i < n; i++) {
					result = this.compareDigits(a.charAt(i), b.charAt(i));
					if (result) break;
				}
			}

			return result;
		}

		private compareDigits(a: string, b: string) {
			return parseInt(b) - parseInt(a);
		}

		add(other: Float): Float;
		add(other: string): Float;
		add(other) {
			if (typeof other === 'string') {
				other = new Float(other);
			}
			
			var fractionalPartLength = Math.max(this.getFractionalPartLength(), other.getFractionalPartLength());

			var fractionalResult = this.addPart(
				this.rightPadWithZeros(this.getFractionalPart(), fractionalPartLength),
				this.rightPadWithZeros(other.getFractionalPart(), fractionalPartLength)
			);
			
			var fractionalCarryOver = fractionalResult.substring(0, fractionalResult.length - fractionalPartLength);
			fractionalResult = fractionalResult.substring(fractionalResult.length - fractionalPartLength);
			
			var integerPartLength = Math.max(this.getIntegerPartLength(), other.getIntegerPartLength());
			var integerResult = this.addPart(
				this.leftPadWithZeros(this.getIntegerPart(), integerPartLength),
				this.leftPadWithZeros(other.getIntegerPart(), integerPartLength)
			);
			if (fractionalCarryOver) {
				integerPartLength = Math.max(integerResult.length, fractionalCarryOver.length);
				integerResult = this.addPart(
					this.leftPadWithZeros(integerResult, integerPartLength),
					this.leftPadWithZeros(fractionalCarryOver, integerPartLength)
				);
			}
			
			return new Float((this.getIsNegative() ? '-' : '') + integerResult + '.' + fractionalResult);
		}

		addPart(a: string, b: string): string {
			var result = '';
			var carryOver = 0;
			for (var i = Math.max(a.length, b.length) - 1; i >= 0; i--) {
				var addResult = this.addDigits(a.charAt(i), b.charAt(i), carryOver);
				result = addResult.result + result;
				carryOver = addResult.carryOver;
			}
			if (carryOver) {
				result = carryOver + result;
			}
			return result;
		}
		
		addDigits(a: string, b: string, carryOver: number): IAddResult {
			var result = parseInt(a) + parseInt(b) + carryOver;
			var resultStr = result + '';
			return {
				result: resultStr.charAt(resultStr.length - 1),
				carryOver: parseInt(resultStr.slice(0, -1) || '0')
			};
		}

		getIsPositive() {
			if (this.isPositive == null) {
				this.isPositive = !this.getIsMarkedNegative() && !this.getIsZero();
			}
			return this.isPositive;
		}

		getIsNegative() {
			if (this.isNegative == null) {
				this.isNegative = this.getIsMarkedNegative() && !this.getIsZero();
			}
			return this.isNegative;
		}

		getIsZero() {
			return this.getFractionalPartLength() == 0 && this.getIntegerPartLength() == 0;
		}

		getIsMarkedNegative() {
			return this.isMarkedNegative;
		}

		toString() {
			var fractionalPart = this.getFractionalPart();
			if (fractionalPart) fractionalPart = '.' + fractionalPart;
			return (this.getIsNegative() ? '-' : '') + (this.getIntegerPart() || '0') + fractionalPart;
		}

		toNumber() {
			return Number(this.toString());
		}

		valueOf() {
			return this.toString();
		}
	}
}