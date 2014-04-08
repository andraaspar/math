module pir.math {
	export interface IAddResult {
		result: string;
		carryOver: string;
	}
	export interface IComparableStrings {
		thisCombined: string;
		otherCombined: string;
		integerPartLength: number;
		fractionalPartLength: number;
	}

	export class BigNumber {

		private isNegative: boolean;
		private isPositive: boolean;
		private isMarkedNegative = false;
		private integerPart: string;
		private fractionalPart: string;
		private integerPartLength: number;
		private fractionalPartLength: number;

		constructor(value: string);
		constructor(value: number);
		constructor(value) {
			var valueStr = value + '';
			if (!/-?[0-9]*\.?[0-9]*/.test(valueStr)) {
				throw 'Invalid value: ' + valueStr;
			}
			if (valueStr.charAt(0) === '-') {
				this.isMarkedNegative = true;
				valueStr = valueStr.substring(1);
			}

			var split = valueStr.split('.');
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
		isLessThan(other: number): boolean;
		isLessThan(other) {
			return this.compareWith(other) < 0;
		}

		isMoreThan(other: BigNumber): boolean;
		isMoreThan(other: string): boolean;
		isMoreThan(other: number): boolean;
		isMoreThan(other) {
			return this.compareWith(other) > 0;
		}


		equals(other: BigNumber): boolean;
		equals(other: string): boolean;
		equals(other: number): boolean;
		equals(other) {
			return this.compareWith(other) == 0;
		}

		compareWith(other: BigNumber): number;
		compareWith(other: string): number;
		compareWith(other: number): number;
		compareWith(other) {
			var otherBN = this.castValue(other);

			if (!this.getIsNegative() && otherBN.getIsNegative()) {
				var result = 1;
			} else if (this.getIsNegative() && !otherBN.getIsNegative()) {
				var result = -1;
			} else {
				var cs = this.getComparableStrings(otherBN);
				var result = cs.thisCombined.localeCompare(cs.otherCombined);
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

		castValue(value: BigNumber): BigNumber;
		castValue(value: string): BigNumber;
		castValue(value: number): BigNumber;
		castValue(value) {
			if (typeof value === 'number') {
				return new BigNumber(<number>value);
			} else if (typeof value === 'string') {
				return new BigNumber(<string>value);
			} else {
				return <BigNumber>value;
			}
		}

		getComparableStrings(other: BigNumber): IComparableStrings {
			var fractionalPartLength = Math.max(this.getFractionalPartLength(), other.getFractionalPartLength());
			var thisFractionalPart = this.rightPadWithZeros(this.getFractionalPart(), fractionalPartLength);
			var otherFractionalPart = this.rightPadWithZeros(other.getFractionalPart(), fractionalPartLength);

			var integerPartLength = Math.max(this.getIntegerPartLength(), other.getIntegerPartLength());
			var thisIntegerPart = this.leftPadWithZeros(this.getIntegerPart(), integerPartLength);
			var otherIntegerPart = this.leftPadWithZeros(other.getIntegerPart(), integerPartLength);

			return {
				thisCombined: thisIntegerPart + thisFractionalPart,
				otherCombined: otherIntegerPart + otherFractionalPart,
				fractionalPartLength: fractionalPartLength,
				integerPartLength: integerPartLength
			};
		}

		add(other: BigNumber): BigNumber;
		add(other: string): BigNumber;
		add(other: number): BigNumber;
		add(other) {
			var otherBN = this.castValue(other);
			var cs = this.getComparableStrings(otherBN);
			var isNegative = false;

			if (this.getIsNegative() == otherBN.getIsNegative()) {
				var result = this.addPart(cs.thisCombined, cs.otherCombined);
				isNegative = this.getIsNegative();
			} else {
				if (this.getAbsolute().isMoreThan(otherBN.getAbsolute())) {
					var result = this.subtractPart(cs.thisCombined, cs.otherCombined);
					isNegative = this.getIsNegative();
				} else {
					var result = this.subtractPart(cs.otherCombined, cs.thisCombined);
					isNegative = otherBN.getIsNegative();
				}
			}

			if (cs.fractionalPartLength) {
				result = result.slice(0, -cs.fractionalPartLength) + '.' + result.slice(-cs.fractionalPartLength);
			}
			if (isNegative) {
				result = '-' + result;
			}
			return new BigNumber(result);
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

		subtract(other: BigNumber): BigNumber;
		subtract(other: string): BigNumber;
		subtract(other: number): BigNumber;
		subtract(other) {
			return this.add(this.castValue(other).getInverted());
		}

		subtractPart(a: string, b: string): string {
			var result = '';
			var carryOver = '';
			for (var i = Math.max(a.length, b.length) - 1; i >= 0; i--) {
				var subtractResult = this.subtractDigits(a.charAt(i), b.charAt(i), carryOver);
				result = subtractResult.result + result;
				carryOver = subtractResult.carryOver;
			}
			return result;
		}

		subtractDigits(a: string, b: string, carryOver: string): IAddResult {
			var aNum = parseInt(a);
			var bNum = parseInt(b);
			var carryOverNum = parseInt(carryOver || '0');

			bNum += carryOverNum;

			b = bNum + '';
			carryOver = b.slice(0, -1);
			b = b.slice(-1);

			carryOverNum = parseInt(carryOver || '0');
			bNum = parseInt(b);

			var result = aNum - bNum;
			while (result < 0) {
				result += 10;
				carryOverNum += 1;
			}

			var resultStr = result + '';
			if (resultStr.length > 1) {
				carryOver = resultStr.slice(0, -1);
				resultStr = resultStr.slice(-1);
			} else {
				carryOver = carryOverNum + '';
			}

			return {
				result: resultStr,
				carryOver: carryOver
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