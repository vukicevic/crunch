var should = require('chai').should(),
    expect = require('chai').expect,
    crunch = require('../crunch');

describe('#transform', function() {
  it('Transform 8 to 28 bit int array', function() {
    var result = [15, 37628418]; result.negative = false;
    crunch.transform([242, 62, 42, 2], true).should.eql(result);
  });
  it('Transform 8 to 28 bit int array', function() {
    var result = [1048575, 268435455]; result.negative = false;
    crunch.transform([255, 255, 255, 255, 255, 255], true).should.eql(result);
  });
  it('Transform 28 to 8 bit int array', function() {
    crunch.transform([15, 37628418]).should.eql([242, 62, 42, 2]);
  });
  it('Transform 28 to 8 bit int array', function() {
    crunch.transform([1048575, 268435455]).should.eql([255, 255, 255, 255, 255, 255]);
  });
});

describe('#misc', function() {
  it('Decrement big number', function() {
    crunch.decrement([5, 76]).should.eql([5, 75]);
  });
  it('Decrement big number', function() {
    crunch.decrement([5, 0]).should.eql([4, 255]);
  });
  it('Cut leading zeros', function() {
    crunch.cut([0, 0, 0, 5, 76]).should.eql([5, 76]);
  });
  it('Cut leading zeros', function() {
    crunch.cut([0, 0]).should.eql([0]);
  });
  it('Xor two arrays', function() {
    crunch.xor([22, 11], [255, 189]).should.eql([233, 182]);
  });
  it('Get zero filled array', function() {
    crunch.zero(5).should.eql([0, 0, 0, 0, 0]);
  });
});

describe('#compare', function() {
  it('Compare equal arrays', function() {
    crunch.compare([5, 57, 84, 76], [5, 57, 84, 76]).should.equal(0);
  });
  it('Compare large to small array', function() {
    crunch.compare([5, 57, 84, 76], [57, 84, 75]).should.equal(1);
  });
  it('Compare small to large array', function() {
    crunch.compare([5, 76], [6, 57, 84, 75]).should.equal(-1);
  });
  it('Compare equal negative arrays', function() {
    crunch.compare([-5, 10], [-5, 10]).should.equal(0);
  });
  it('Compare positive to negative array', function() {
    crunch.compare([5, 10], [-5, 10]).should.equal(1);
  });
  it('Compare negative to positive array', function() {
    crunch.compare([-5, 10], [5, 10]).should.equal(-1);
  });
});

describe('#addition unsigned', function() {
  it('Add big numbers', function() {
    crunch.add([242, 62], [42, 2]).should.eql([1, 28, 64]);
  });
  it('Add big numbers', function() {
    crunch.add([6, 17], [42, 2]).should.eql([48, 19]);
  });
  it('Add big numbers', function() {
    crunch.add([26, 255, 230, 17], [42, 34]).should.eql([27, 0, 16, 51]);
  });
  it('Add big numbers', function() {
    crunch.add([234, 34], [255, 255, 230, 17]).should.eql([1, 0, 0, 208, 51]);
  });
  it('Add big numbers', function() {
    crunch.add([255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255]).should.eql([1, 255, 255, 255, 255, 255, 254]);
  });
});

describe('#addition signed', function() {
  it('Add big numbers', function() {
    crunch.add([51, 254, 144, 207], [-20, 89, 145, 32]).should.eql([31, 164, 255, 175]);
  });
  it('Add big numbers', function() {
    crunch.add([242, 62], [-242, 64]).should.eql([-2]);
  });
  it('Add big numbers', function() {
    crunch.add([-42, 2], [242, 62]).should.eql([200, 60]);
  });
  it('Add big numbers', function() {
    crunch.add([-42, 2], [42, 0]).should.eql([-2]);
  });
  it('Add big numbers', function() {
    crunch.add([-242, 62], [-42, 2]).should.eql([-1, 28, 64]);
  });
});

describe('#addition zero', function() {
  it('Add big numbers', function() {
    crunch.add([26, 255, 230, 17], [0]).should.eql([26, 255, 230, 17]);
  });
  it('Add big numbers', function() {
    crunch.add([0], [43, 123, 200, 1]).should.eql([43, 123, 200, 1]);
  });
  it('Add big numbers', function() {
    crunch.add([0], [0]).should.eql([0]);
  });
});

describe('#subtraction unsigned', function() {
  it('Subtract big numbers', function() {
    crunch.sub([242, 62], [42, 2]).should.eql([200, 60]);
  });
  it('Subtract big numbers', function() {
    crunch.sub([170, 1, 79, 119, 242, 62], [17, 241, 123, 250, 42, 2]).should.eql([152, 15, 211, 125, 200, 60]);
  });
  it('Subtract big numbers', function() {
    crunch.sub([240, 0, 0, 0, 0, 0], [1]).should.eql([239, 255, 255, 255, 255, 255]);
  });
  it('Subtract big numbers', function() {
    crunch.sub([244, 137, 7, 161], [2, 59, 86]).should.eql([244, 134, 204, 75]);
  });
  it('Subtract big numbers', function() {
    crunch.sub([20, 0, 0], [19, 0, 0]).should.eql([1, 0, 0]);
  });
});

describe('#subtraction signed', function() {
  it('Subtract big numbers', function() {
    crunch.sub([26], [255]).should.eql([-229]);
  });
  it('Subtract big numbers', function() {
    crunch.sub([188, 196], [188, 197]).should.eql([-1]);
  });
  it('Subtract big numbers', function() {
    crunch.sub([240, 0, 0, 0, 0, 0], [-1]).should.eql([240, 0, 0, 0, 0, 1]);
  });
  it('Subtract big numbers', function() {
    crunch.sub([-240, 0, 0, 0, 0, 0], [1]).should.eql([-240, 0, 0, 0, 0, 1]);
  });
  it('Subtract big numbers', function() {
    crunch.sub([-240, 0, 0, 0, 0, 0], [-1]).should.eql([-239, 255, 255, 255, 255, 255]);
  });
});

describe('#subtraction zero', function() {
  it('Subtract big numbers', function() {
    crunch.sub([20], [20]).should.eql([0]);
  });
  it('Subtract big numbers', function() {
    crunch.sub([244, 137, 7, 161], [0]).should.eql([244, 137, 7, 161]);
  });
  it('Subtract big numbers', function() {
    crunch.sub([0], [0]).should.eql([0]);
  });
});

describe('#multiplication unsigned', function() {
  it('Multiply big numbers', function() {
    crunch.mul([242, 62], [42, 2]).should.eql([39, 192, 16, 124]);
  });
  it('Multiply big numbers', function() {
    crunch.mul([162, 51, 95], [42, 18, 204]).should.eql([26, 168, 86, 115, 157, 180]);
  });
  it('Multiply big numbers', function() {
    crunch.mul([255, 65, 34, 51, 95], [42, 18, 204]).should.eql([41, 243, 109, 152, 188, 115, 157, 180]);
  });
  it('Multiply big numbers', function() {
    crunch.mul([255, 255, 255, 255], [255, 255, 255, 255]).should.eql([255, 255, 255, 254, 0, 0, 0, 1]);
  });
  it('Multiply big numbers', function() {
    crunch.mul([60, 193, 71, 209], [93, 8, 143, 237]).should.eql([22, 20, 63, 73, 97, 149, 59, 125]);
  });
});

describe('#multiplication signed', function() {
  it('Multiply big numbers', function() {
    crunch.mul([77, 242, 62], [-42, 2, 113, 43, 57, 65]).should.eql([-12, 202, 124, 133, 146, 125, 36, 79, 190]);
  });
  it('Multiply big numbers', function() {
    crunch.mul([-255, 17, 162, 62], [255, 17, 162, 62]).should.eql([-254, 36, 34, 110, 119, 14, 135, 4]);
  });
  it('Multiply big numbers', function() {
    crunch.mul([-162, 51, 95], [-42, 18, 204]).should.eql([26, 168, 86, 115, 157, 180]);
  });
});

describe('#multiplication zero', function() {
  it('Multiply big numbers', function() {
    crunch.mul([77, 242, 62], [0]).should.eql([0]);
  });
  it('Multiply big numbers', function() {
    crunch.mul([0], [77, 242, 62]).should.eql([0]);
  });
  it('Multiply big numbers', function() {
    crunch.mul([0], [0]).should.eql([0]);
  });
});

describe('#squaring', function() {
  it('Squaring a big number', function() {
    crunch.sqr([162, 62]).should.eql([102, 210, 135, 4]);
  });
  it('Squaring a big number', function() {
    crunch.sqr([78, 42, 255, 88, 11]).should.eql([23, 222, 58, 210, 110, 72, 32, 49, 144, 121]);
  });
  it('Squaring a big number', function() {
    crunch.sqr([255, 17, 162, 62]).should.eql([254, 36, 34, 110, 119, 14, 135, 4]);
  });
  it('Squaring a negative number', function() {
    crunch.sqr([-162, 62]).should.eql([102, 210, 135, 4]);
  });
  it('Squaring zero', function() {
    crunch.sqr([0]).should.eql([0]);
  });
});

describe('#division unsigned', function() {
  it('Divide big numbers', function() {
    crunch.div([170, 153, 136], [17, 68]).should.eql([9, 225]);
  });
  it('Divide big numbers', function() {
    crunch.div([170, 153, 136, 119, 102, 85], [17, 68]).should.eql([9, 225, 129, 255, 9]);
  });
  it('Divide big numbers', function() {
    crunch.div([52, 155, 168, 23, 6, 85], [19, 26, 247]).should.eql([2, 192, 234, 136]);
  });
  it('Divide by one', function() {
    crunch.div([15, 127, 73, 1], [1]).should.eql([15, 127, 73, 1]);
  });
  it('Divide by self', function() {
    crunch.div([15, 127, 73, 1], [15, 127, 73, 1]).should.eql([1]);
  });
});

describe('#division signed', function() {
  it('Divide big numbers', function() {
    crunch.div([-170, 153, 136], [17, 68]).should.eql([-9, 225]);
  });
  it('Divide big numbers', function() {
    crunch.div([170, 153, 136, 119, 102, 85], [-17, 68]).should.eql([-9, 225, 129, 255, 9]);
  });
  it('Divide big numbers', function() {
    crunch.div([-52, 155, 168, 23, 6, 85], [-19, 26, 247]).should.eql([2, 192, 234, 136]);
  });
});

describe('#division zero', function() {
  it('Divide zero', function() {
    crunch.div([0], [17, 68]).should.eql([0]);
  });
  it('Divide by zero', function() {
    expect(crunch.div([170, 153], [0])).to.be.undefined;
  });
  it('Divide zero by zero', function() {
    expect(crunch.div([0], [0])).to.be.undefined;
  });
});

describe('#modular reduction', function() {
  it('Big modulo smaller', function() {
    crunch.mod([170, 153, 136, 119, 102, 85], [17, 68]).should.eql([14, 241]);
  });
  it('Big modulo smaller', function() {
    crunch.mod([52, 155, 168, 23, 6, 85], [19, 26, 247]).should.eql([10, 237, 29]);
  });
  it('Smaller modulo big', function() {
    crunch.mod([1, 0], [1, 241]).should.eql([1, 0]);
  });
  it('Modulus modulo', function() {
    crunch.mod([1, 241], [1, 241]).should.eql([0]);
  });
  it('Zero modulo', function() {
    crunch.mod([0], [1, 241]).should.eql([0]);
  });
});

describe('#barret modular reduction', function() {
  it('Big modulo smaller', function() {
    crunch.bmr([170, 153, 136, 119, 102, 85], [17, 68]).should.eql([14, 241]);
  });
  it('Big modulo smaller', function() {
    crunch.bmr([52, 155, 168, 23, 6, 85], [19, 26, 247]).should.eql([10, 237, 29]);
  });
  it('Smaller modulo big', function() {
    crunch.bmr([1, 0], [1, 241]).should.eql([1, 0]);
  });
  it('Modulus modulo', function() {
    crunch.bmr([1, 241], [1, 241]).should.eql([0]);
  });
  it('Zero modulo', function() {
    crunch.bmr([0], [1, 241]).should.eql([0]);
  });
});

describe('#modular exponentiation', function() {
  it('Big number exponentiation', function() {
    crunch.exp([2, 92, 160], [45], [188, 14, 2]).should.eql([58, 164, 236]);
  });
  it('Big number exponentiation', function() {
    crunch.exp([2, 92, 160], [17, 190], [188, 14, 2]).should.eql([50, 49, 208]);
  });
  it('Big number exponentiation', function() {
    crunch.exp([6, 252, 83], [58, 219, 102, 99], [74, 192, 238, 73]).should.eql([52, 174, 18, 245]);
  });
  it('Big number exponentiation', function() {
    crunch.exp([1, 142, 233, 15, 246, 195, 115, 224, 238, 78, 63, 10, 210], [1, 0, 1], [10, 188, 222, 250, 188, 222, 250, 190, 250, 188, 222, 253, 174]).should.eql([7, 133, 195, 224, 133, 127, 5, 215, 82, 76, 89, 1, 192]);
  });
  it('Big number exponentiation', function() {
    crunch.exp([1, 35, 101, 20, 152, 20, 54, 18, 53, 20, 138, 254, 255, 18, 55, 134, 19, 25, 171, 205, 225, 56, 113, 70, 16, 151, 69, 1, 152, 20, 152, 97, 40, 151, 18, 70, 171, 237, 254, 253, 190, 18, 135, 54, 20, 145, 71, 97, 57, 25, 98, 20, 54, 175, 175, 171, 187, 190, 18, 54, 112], [1, 1], [8, 118, 18, 52, 175, 233, 135, 42, 203, 50, 232, 144, 71, 24, 18, 70, 23, 255, 19, 106, 196, 235, 103, 39, 21, 63, 234, 16, 148, 115, 38, 113, 144, 11, 190, 241, 67, 143, 233, 129, 47, 229, 18, 55, 129, 18, 56, 151, 18, 70, 18, 152, 87, 18, 97, 41, 20, 101, 129, 70, 18]).should.eql([1, 159, 78, 124, 229, 239, 112, 56, 255, 59, 96, 97, 44, 130, 171, 143, 191, 104, 65, 205, 217, 254, 68, 206, 182, 177, 214, 54, 223, 237, 14, 37, 120, 130, 214, 30, 91, 225, 128, 141, 153, 17, 15, 231, 171, 74, 34, 208, 10, 42, 178, 194, 68, 76, 124, 129, 74, 203, 8, 100, 40]);
  });
});

describe('#garner`s algo', function() {
  it('Big number exponentiation', function() {
    crunch.gar([54, 11, 203], [147, 221, 12, 0, 9], [11, 58, 199, 45], [6, 40, 116, 206, 132, 151, 64, 46, 129], [1, 90, 87, 231]).should.eql([79, 149, 175, 182, 42, 220, 11, 5]);
  });
  it('Big number exponentiation', function() {
    crunch.gar([37,72,61,128,78,4,188,90,40,148,179,25,237,153,121,180], [83,109,25,53,121,92,247,51], [149,43,167,106,70,148,98,21], [48,149,33,24,195,123,244,243,237,251,39,62,179,25,87,169], [103,210,31,75,139,194,84,88]).should.eql([1,2,3,4,5,6,7,8]);
  });
  it('Big number exponentiation', function() {
    crunch.gar([104,46,8,117,98,161,111,189,113,175,163,83,217,166,91,28], [158,239,229,2,116,132,105,151], [178,27,170,77,131,87,103,33], [26,39,124,1,92,246,113,161,76,42,194,69,211,163,133,193], [39,51,110,215,203,200,103,61]).should.eql([1,2,3,4,5,6,7,8]);
  });
});

describe('#modular inverse', function() {
  it('Modular inverse', function() {
    crunch.inv([170, 153, 149], [63, 253]).should.eql([38, 133]);
  });
  it('Modular inverse', function() {
    crunch.inv([147, 221, 12, 0, 9], [11, 58, 199, 45]).should.eql([1, 90, 87, 231]);
  });
  it('Modular inverse', function() {
    crunch.inv([54, 100, 205], [78, 79]).should.eql([28, 15]);
  });
  it('No inverse', function() {
    expect(crunch.inv([123],[24])).to.be.undefined;
  });
});

describe('#test prime', function() {
  it('Number is prime', function() {
    expect(crunch.testPrime([254, 87, 121, 7, 0, 217])).to.be.ok;
  });
  it('Number is prime', function() {
    expect(crunch.testPrime([7, 201])).to.be.ok;
  });
  it('Number is not prime', function() {
    expect(crunch.testPrime([58, 222, 67])).to.not.be.ok;
  });
  it('Number is not prime', function() {
    expect(crunch.testPrime([9])).to.not.be.ok;
  });
  it('Number is not prime', function() {
    expect(crunch.testPrime([44, 78, 64, 128])).to.not.be.ok;
  });
});

describe('#next prime', function() {
  it('Find next prime', function() {
    crunch.nextPrime([5, 57, 84, 76]).should.eql([5, 57, 84, 81]);
  });
  it('Find next prime', function() {
    crunch.nextPrime([18, 214, 136]).should.eql([18, 214, 145]);
  });
  it('Find next prime', function() {
    crunch.nextPrime([5, 57, 84, 76, 233, 0, 120, 91, 180, 180, 8]).should.eql([5, 57, 84, 76, 233, 0, 120, 91, 180, 180, 107]);
  });
  it('Find next prime', function() {
    crunch.nextPrime([17]).should.eql([17]);
  });
  it('Find next prime', function() {
    crunch.nextPrime([7, 200]).should.eql([7, 201]);
  });
});

describe('#factorial', function() {
  it('Find 10 factorial', function() {
    crunch.factorial(10).should.eql([55, 95, 0]);
  });
  it('Find 50 factorial', function() {
    crunch.factorial(50).should.eql([73, 238, 188, 150, 30, 210, 121, 176, 43, 30, 244, 242, 141, 25, 168, 79, 89, 115, 161, 210, 199, 128, 0, 0, 0, 0, 0]);
  });
  it('Find 100 factorial', function() {
    crunch.factorial(100).should.eql([27, 48, 150, 78, 195, 149, 220, 36, 6, 149, 40, 213, 75, 189, 164, 13, 22, 233, 102, 239, 154, 112, 235, 33, 181, 178, 148, 58, 50, 28, 223, 16, 57, 23, 69, 87, 12, 202, 148, 32, 198, 236, 179, 183, 46, 210, 238, 139, 2, 234, 39, 53, 198, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});