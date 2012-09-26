pivotOut = function(theta) {
//  var mapped = (((theta-Math.PI/6)*(3)) % (Math.PI));
  var mapped = ((theta+Math.PI/6)*3/Math.PI);// % (Math.PI)
  console.log(theta, mapped);
  if(Math.abs(mapped%1) <= 0.01){
    console.log('good');
  } else { 
    console.log('bad');
  };
}

pivotOut(0);
pivotOut(0.1);
pivotOut(1*Math.PI/6);
pivotOut(2*Math.PI/6);
pivotOut(3*Math.PI/6);
pivotOut(4*Math.PI/6);
pivotOut(5*Math.PI/6);
pivotOut(6*Math.PI/6);
pivotOut(7*Math.PI/6);
pivotOut(8*Math.PI/6);
pivotOut(9*Math.PI/6);
pivotOut(10*Math.PI/6);
pivotOut(11*Math.PI/6);
pivotOut(12*Math.PI/6);
