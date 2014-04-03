module pir.math {
	export interface IAddResult {
		result: string;
		carryOver: string;
	}

	export class BigNumber {

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

		private stripLeadingZeros(src: string): string {
			for (var i = 0, n = src.length; i < n; i++) {
				if (src.charAt(i) !== '0') break;
			}
			return src.substring(i);
		}

		private stripTailingZeros(src: string): string {
			for (var i = src.length - 1; i >= 0; i--) {
				if (src.charAt(i) !== '0') break;
			}
			return src.substring(0, i + 1);
		}

		private leftPadWithZeros(src: string, length: number): string {
			while (src.length < length) src = '0' + src;
			return src;
		}

		private rightPadWithZeros(src: string, length: number): string {
			while (src.length < length) src = src + '0';
			return src;
		}

		getIntegerPart(): string {
			return this.integerPart;
		}

		getFractionalPart(): string {
			return this.fractionalPart;
		}

		getIntegerPartLength(): number {
			if (this.integerPartLength == null) {
				this.integerPartLength = this.getIntegerPart().length;
			}
			return this.integerPartLength;
		}

		getFractionalPartLength(): number {
			if (this.fractionalPartLength == null) {
				this.fractionalPartLength = this.getFractionalPart().length;
			}
			return this.fractionalPartLength;
		}

		isLessThan(other: BigNumber): boolean;
		isLessThan(other: string): boolean;
		isLessThan(other) {
			return this.compareWith(other) < 0;
		}

		isMoreThan(other: BigNumber): boolean;
		isMoreThan(other: string): boolean;
		isMoreThan(other) {
			return this.compareWith(other) > 0;
		}


		equals(other: BigNumber): boolean;
		equals(other: string): boolean;
		equals(other) {
			return this.compareWith(other) == 0;
		}

		compareWith(other: BigNumber): number;
		compareWith(other: string): number;
		compareWith(other) {
			if (typeof other == 'string') {
				var otherFloat = new BigNumber(other);
			} else {
				var otherFloat = <BigNumber>other;
			}

			if (!this.getIsNegative() && otherFloat.getIsNegative()) {
				var result = 1;
			} else if (this.getIsNegative() && !otherFloat.getIsNegative()) {
				var result = -1;
			} else {
				var result = this.toAbsoluteString().localeCompare(otherFloat.toAbsoluteString());
				if (this.getIsNegative()) result = -result;
			}

			return result;
		}

		getAbsolute(): BigNumber {
			return new BigNumber(this.toAbsoluteString());
		}

		getInverted(): BigNumber {
			return new BigNumber(this.toInvertedString());
		}

		add(other: BigNumber): BigNumber;
		add(other: string): BigNumber;
		add(other) {
			if (typeof other === 'string') {
				var otherFloat = new BigNumber(other);
			} else {
				var otherFloat = <BigNumber>other;
			}

			var fractionalPartLength = Math.max(this.getFractionalPartLength(), otherFloat.getFractionalPartLength());
			var thisFractionalPart = this.rightPadWithZeros(this.getFractionalPart(), fractionalPartLength);
			var otherFractionalPart = this.rightPadWithZeros(otherFloat.getFractionalPart(), fractionalPartLength);

			var integerPartLength = Math.max(this.getIntegerPartLength(), otherFloat.getIntegerPartLength());
			var thisIntegerPart = this.leftPadWithZeros(this.getIntegerPart(), integerPartLength);
			var otherIntegerPart = this.leftPadWithZeros(otherFloat.getIntegerPart(), integerPartLength);

			var result = this.addPart(
				thisIntegerPart + thisFractionalPart,
				otherIntegerPart + otherFractionalPart
				);

			if (fractionalPartLength) {
				result = result.slice(0, -fractionalPartLength) + '.' + result.slice(-fractionalPartLength);
			}
			return new BigNumber((this.getIsNegative() ? '-' : '') + result);
		}

		addPart(a: string, b: string): string {
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
		}

		addDigits(a: string, b: string, carryOver: string): IAddResult {
			var result = parseInt(a) + parseInt(b) + parseInt(carryOver || '0');
			var resultStr = result + '';
			return {
				result: resultStr.charAt(resultStr.length - 1),
				carryOver: resultStr.slice(0, -1)
			};
		}

		getIsPositive(): boolean {
			if (this.isPositive == null) {
				this.isPositive = !this.getIsMarkedNegative() && !this.getIsZero();
			}
			return this.isPositive;
		}

		getIsNegative(): boolean {
			if (this.isNegative == null) {
				this.isNegative = this.getIsMarkedNegative() && !this.getIsZero();
			}
			return this.isNegative;
		}

		getIsZero(): boolean {
			return this.getFractionalPartLength() == 0 && this.getIntegerPartLength() == 0;
		}

		getIsMarkedNegative(): boolean {
			return this.isMarkedNegative;
		}

		toAbsoluteString(): string {
			var fractionalPart = this.getFractionalPart();
			if (fractionalPart) fractionalPart = '.' + fractionalPart;
			return (this.getIntegerPart() || '0') + fractionalPart;
		}

		toInvertedString(): string {
			return (this.getIsNegative() || this.getIsZero() ? '' : '-') + this.toAbsoluteString();
		}

		toString(): string {
			return (this.getIsNegative() ? '-' : '') + this.toAbsoluteString();
		}

		toNumber(): number {
			return Number(this.toString());
		}

		valueOf(): string {
			return this.toString();
		}
	}
}