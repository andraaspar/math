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
			console.assert(!c.isGreaterThan(d));
			console.assert(c.isLessThan(d));
			console.assert(!c.equals(d));
			
			console.assert(!(new Float('3.4').isLessThan('-5.5')));
		}
	}
}

var mathTestMain = new pir.math.test.Main();