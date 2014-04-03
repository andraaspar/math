/// <reference path='../Float.ts'/>

module pir.math.test {
	export class Main {
		constructor() {
			window.addEventListener('load', this.onDOMLoaded.bind(this));
		}
		
		onDOMLoaded() {
			console.log('pir.math test');
			
			var a = new Float('-000111222333444555666777888');
			console.log(a);
			console.assert(a + 'px' === '-111222333444555666777888px');
			
			var b = new Float('2.300');
			console.log(b);
			console.assert(b + 'px' === '2.3px');
			console.assert(<any>b * 1 === 2.3);
			console.log(<any>b - 2);
			
			var c = new Float('9999999999999999999999999999999999999.00000000000000000009');
			var d = new Float('9999999999999999999999999999999999999.0000000000000000009');
			console.assert(c.isMoreThan(d) === false);
			console.assert(c.isLessThan(d) === true);
			console.assert(c.equals(d) === false);
			
			console.assert(new Float('0').isMoreThan('-.1') === true);
			console.assert(new Float('0').equals('') === true);
			console.assert(new Float('0').equals('-') === true);
			console.assert(new Float('.1').isMoreThan('.01') === true);
			console.assert(new Float('.1').isLessThan('') === false);
			
			console.assert(new Float('5.5').isLessThan('-3.4') === false);
			console.assert(new Float('-5.5').isLessThan('-3.4') === true);
			console.assert(new Float('5.5').isLessThan('3.4') === false);
			
			console.assert(new Float('-3.4').isMoreThan('-5.5') === true);
			console.assert(new Float('3.4').isMoreThan('-5.5') === true);
			console.assert(new Float('3.4').isMoreThan('5.5') === false);
			
			console.assert(new Float('3.4').equals('5.5') === false);
			console.assert(new Float('5.5').equals('-5.5') === false);
			console.assert(new Float('5.5').equals('5.5') === true);
			
			console.assert(new Float('55.55').add('16.5').toString() === '72.05');
			console.assert(new Float('-99.98').add('-0.03').toString() === '-100.01');
			console.assert(new Float('999999999999999999999999999999999999').add('999999999999999999999999999999999999').toString() === '1999999999999999999999999999999999998');
		}
	}
}

var mathTestMain = new pir.math.test.Main();