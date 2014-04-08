/// <reference path='../BigNumber.ts'/>

module pir.math.test {
	export class Main {
		constructor() {
			window.addEventListener('load', this.onDOMLoaded.bind(this));
		}
		
		onDOMLoaded(): void {
			console.log('pir.math test');
			
			var a = new BigNumber('-000111222333444555666777888');
			console.log(a);
			console.assert(a + 'px' === '-111222333444555666777888px');
			
			var b = new BigNumber('2.300');
			console.log(b);
			console.assert(b + 'px' === '2.3px');
			console.assert(<any>b * 1 === 2.3);
			
			var c = new BigNumber('9999999999999999999999999999999999999.00000000000000000009');
			var d = new BigNumber('9999999999999999999999999999999999999.0000000000000000009');
			console.assert(c.isMoreThan(d) === false);
			console.assert(c.isLessThan(d) === true);
			console.assert(c.equals(d) === false);
			
			console.assert(new BigNumber('0').isMoreThan('-.1') === true);
			console.assert(new BigNumber('0').equals('') === true);
			console.assert(new BigNumber('0').equals('-') === true);
			console.assert(new BigNumber('.1').isMoreThan('.01') === true);
			console.assert(new BigNumber('.1').isLessThan('') === false);
			console.assert(new BigNumber('10').isMoreThan('7') === true);
			
			console.assert(new BigNumber('5.5').isLessThan('-3.4') === false);
			console.assert(new BigNumber('-5.5').isLessThan('-3.4') === true);
			console.assert(new BigNumber('5.5').isLessThan('3.4') === false);
			
			console.assert(new BigNumber('-3.4').isMoreThan('-5.5') === true);
			console.assert(new BigNumber('3.4').isMoreThan('-5.5') === true);
			console.assert(new BigNumber('3.4').isMoreThan('5.5') === false);
			
			console.assert(new BigNumber('3.4').equals('5.5') === false);
			console.assert(new BigNumber('5.5').equals('-5.5') === false);
			console.assert(new BigNumber('5.5').equals('5.5') === true);
			
			console.assert(new BigNumber('55.55').add('16.5').toString() === '72.05');
			console.assert(new BigNumber('-99.98').add('-0.03').toString() === '-100.01');
			console.assert(new BigNumber('999999999999999999999999999999999999').add('999999999999999999999999999999999999').toString() === '1999999999999999999999999999999999998');
			
			console.assert(new BigNumber('5.7').getAbsolute().toString() === '5.7');
			console.assert(new BigNumber('-5.7').getAbsolute().toString() === '5.7');
			console.assert(new BigNumber('-').getAbsolute().toString() === '0');
			
			console.assert(new BigNumber('5.7').getInverted().toString() === '-5.7');
			console.assert(new BigNumber('-5.7').getInverted().toString() === '5.7');
			console.assert(new BigNumber('0').getInverted().toString() === '0');
			
			console.assert(new BigNumber('10').subtract(7).toString() === '3');
			console.assert(new BigNumber('111').subtract('97').toString() === '14');
			console.assert(new BigNumber('15.65').add('-15.65').toString() === '0');
			console.assert(new BigNumber('2.3').subtract(2).toString() === '0.3');
			console.assert(new BigNumber(-5.2).subtract(2.4).toString() === '-7.6');
			console.assert(new BigNumber(-5.2).subtract(-2.4).toString() === '-2.8');
			console.assert(new BigNumber(10).add(-11).toString() === '-1');
			console.assert(new BigNumber(-1).add(77).toString() === '76');
		}
	}
}

var mathTestMain = new pir.math.test.Main();