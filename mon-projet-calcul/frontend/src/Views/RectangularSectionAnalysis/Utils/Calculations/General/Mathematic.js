import regression from 'regression';
import {
  ones,
  transpose,
  pow,
  multiply,
  inv
} from 'mathjs'
class Mathematic {
    constructor() {
    }
  
    round(value, pow) {
      return Math.round(value * 10 ** (pow)) / (10 ** (pow));
    }

    integral(f, a, b, n) {
        const dx = (b - a) / n;
        let sum = 0;
        for (let i = 0; i < n; i++) {
          const x = a + (i + 0.5) * dx;
          sum += f(x);
        }
        return sum * dx;
    }

    regression(vx,vy,degree){
 
        let data = []

        for (let i=0 ; i < vx.length ; i++){
            data.push([vx[i],vy[i]])
        }

        const regressionFunction = regression.polynomial(data, { order: degree , precision:10} );
        const regressionCoefficients =  regressionFunction.equation;

        return regressionCoefficients ;
    }

    cubicRegression(vx,vy) {

      let data = []

      for (let i=0 ; i < vx.length ; i++){
          data.push({x:vx[i], y:vy[i]})
      }


      const x = data.map(point => point.x);
      const y = data.map(point => point.y);

      const X = transpose([pow(x, 3), pow(x, 2), x, ones(x.length)]);
      const Y = transpose([y]);
    
      const B = multiply(multiply(inv(multiply(transpose(X), X)), transpose(X)), Y);
    
      return {
        a: B.get([3, 0]),
        b: B.get([2, 0]),
        c: B.get([1, 0]),
        d: B.get([0, 0])
      };
    }


  }
  
  export default Mathematic