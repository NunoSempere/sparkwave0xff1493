'use strict';

const tD = require("../trackDependencies.js")
const errors = require("../errors.js")
var {assert, expect} = require('chai');

describe('#processTheDependencyTreeStack', function() {

  let trees = [
  // INPUT1
  ({
    X: {
      libraryName: 'X',
      finalDependenciesList: [],
      dependenciesStack: [ 'Y', 'R' ]
    },
    Y: {
      libraryName: 'Y',
      finalDependenciesList: [],
      dependenciesStack: [ 'Z' ]
    }
  }),
  // INPUT2
  ({
    Y: {
      libraryName: 'Y',
      finalDependenciesList: [],
      dependenciesStack: [ 'Z' ]
    },
    A: {
      libraryName: 'A',
      finalDependenciesList: [],
      dependenciesStack: [ 'Q', 'R', 'S' ]
    },
    X: {
      libraryName: 'X',
      finalDependenciesList: [],
      dependenciesStack: [ 'Y' ]
    },
    Z: {
      libraryName: 'Z',
      finalDependenciesList: [],
      dependenciesStack: [ 'A', 'B' ]
    }
  }
  ),
  // INPUT3
  ({
    A: {
      libraryName: 'A',
      finalDependenciesList: [],
      dependenciesStack: [ 'B', 'C' ]
    },
    B: {
      libraryName: 'B',
      finalDependenciesList: [],
      dependenciesStack: [ 'C', 'E' ]
    },
    C: {
      libraryName: 'C',
      finalDependenciesList: [],
      dependenciesStack: [ 'G' ]
    },
    D: {
      libraryName: 'D',
      finalDependenciesList: [],
      dependenciesStack: [ 'A', 'F' ]
    },
    E: {
      libraryName: 'E',
      finalDependenciesList: [],
      dependenciesStack: [ 'F' ]
    },
    F: {
      libraryName: 'F',
      finalDependenciesList: [],
      dependenciesStack: [ 'H' ]
    }
  }),
  // cyclic
  ({
    A: {
      libraryName: 'A',
      finalDependenciesList: [],
      dependenciesStack: [ 'B' ]
    },
    B: {
      libraryName: 'B',
      finalDependenciesList: [],
      dependenciesStack: [ 'C' ]
    },
    C: {
      libraryName: 'C',
      finalDependenciesList: [],
      dependenciesStack: [ 'D' ]
    },
    D: {
      libraryName: 'D',
      finalDependenciesList: [],
      dependenciesStack: [ 'E' ]
    },
    E: {
      libraryName: 'E',
      finalDependenciesList: [],
      dependenciesStack: [ 'A' ]
    }
  })
];
  let outputs = [
`X depends on R Y Z
Y depends on Z`,
`Y depends on A B Q R S Z
A depends on Q R S
X depends on A B Q R S Y Z
Z depends on A B Q R S`,
`A depends on B C E F G H
B depends on C E F G H
C depends on G
D depends on A B C E F G H
E depends on F H
F depends on H`,
`A depends on B C D E
B depends on A C D E
C depends on A B D E
D depends on A B C E
E depends on A B C D`
  ];
  

  for(let i in trees){
    it('should deal adequately with a variety of tree stacks: #' + i, () =>  {
      let result = tD.processTheDependencyTreeStack(trees[i]);
      let resultPrettyPrint = tD.prettyFormatLibTree(result);
      assert.equal(resultPrettyPrint, outputs[i]);
    });
  }
});

describe('#createSubtreeFromLine', async function() {
  it('should create a subtree when given a normal line', function() {
    let parsedLine = tD.createSubtreeFromLine("A depends on B C D")
    assert.equal(parsedLine[0], "A")
    assert.deepEqual(
      parsedLine[1],
      ({
        "libraryName": "A",
        "finalDependenciesList": [],
        "dependenciesStack": ["B", "C", "D"]
      })
    )
  });

  it('should create a subtree when given a very long line', function() {

    let parsedLine = tD.createSubtreeFromLine("A depends on "+loremIpsum)
    assert.equal(parsedLine[0], "A")
    assert.deepEqual(
      parsedLine[1],
      ({
        "libraryName": "A",
        "finalDependenciesList": [],
        "dependenciesStack": loremIpsumArray
      })
    )
  });

  let malformedInputs = ["A depende de B C D", "A depends on", "A", "depends on",""]
  for(let malformedInput of malformedInputs){
    it('should throw an error when given a malformed input: "'+malformedInput+'"', function() {
      try {
        tD.createSubtreeFromLine(malformedInput);
        throw new Error(errors.wrongError)
      } catch (e) { 
        if (e.message == errors.wrongError) {
          throw e;
        }
        assert.equal(e.message, errors.lineMalformed);
      }
       
    });  
  }

});

describe('#fileNameIntoOutput', async function() {
  let fileNames = ["./test/INPUT1.txt","./test/INPUT2.txt","./test/INPUT3.txt", "./test/cyclical.txt"];
  let outputs = [
`X depends on R Y Z
Y depends on Z`,

`Y depends on A B Q R S Z
A depends on Q R S
X depends on A B Q R S Y Z
Z depends on A B Q R S`,

`A depends on B C E F G H
B depends on C E F G H
C depends on G
D depends on A B C E F G H
E depends on F H
F depends on H`,
`A depends on B C D E
B depends on A C D E
C depends on A B D E
D depends on A B C E
E depends on A B C D`,
  ];
  

  for(let i in fileNames){
    it('should output a string with the dependencies when given a filename: ' + fileNames[i], (done) =>  {
      let callback = (result) => {
        let resultPrettyPrint = tD.prettyFormatLibTree(result);
        assert.equal(resultPrettyPrint, outputs[i]);
        done();
      }
      tD.fileNameIntoOutput(fileNames[i], callback)       
    });
  }

  let chainedFileName = "./test/chained.txt"
  let chainedOutPutStart = 'A depends on Alfa B Bravo C Charlie D Delta E Echo F Foxtrot G Golf H Hotel I India J Juliett K Kilo L Lima M Mike N November O Oscar P Papa Q Quebec R Romeo S Sierra T Tango U Uniform V Victor W Whiskey X X-Ray Y Yankee Z Zulu'
  it('should output a string with the dependencies when given a file which contains a long list of chained libraries: ' + chainedFileName, (done) =>  {
    let callback = (result) => {
      let resultPrettyPrint = tD.prettyFormatLibTree(result);
      assert.isTrue(resultPrettyPrint.startsWith(chainedOutPutStart));
      done();
    }
    tD.fileNameIntoOutput(chainedFileName, callback)       
  });


  let corruptedFileNames = ["./test/emptyFile.txt", "./test/nonExistentFile.txt", "./test/repeated.txt"]
  let errorsCorruptedFiles = [errors.lineMalformed, errors.ENOENT_test, errors.libraryIsRepeated]  
  /* 
    The errors are thrown just fine, but the standard readline library in node.js has a bug in their error handling (!). 
    I've made a comment in this issue: https://github.com/nodejs/node/issues/30831
  */
  /*
  for(let i in corruptedFileNames){
    it("should throw an error when given an input with corrupted files: " + corruptedFileNames[i], async (done) => {
      let callback = (result) => {done()}
      tD.fileNameIntoOutput(corruptedFileNames[i], callback).then(() => {
        console.log("all done");
      }).catch(err => {
          assert.equal(err.message, errorsCorruptedFiles[i]);
      });
    })
  }
  */
});


/* LOREM IPSUM */
const unique = array => [...new Set(array)];

let loremIpsum  = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac varius massa. Maecenas eget mattis erat. Mauris luctus libero eget tortor finibus maximus eget non nulla. Nunc at maximus nisl. Praesent efficitur arcu metus, sed porttitor leo ultricies nec. Suspendisse in quam nisl. Suspendisse et auctor mi. Sed vulputate, risus id dictum tincidunt, risus ante faucibus arcu, vitae fringilla mi turpis nec erat. Suspendisse ac ex eu tortor fringilla pretium at eget arcu. Proin dapibus est ut aliquet fermentum. Pellentesque quis consectetur augue. Morbi maximus, lorem non consequat vulputate, metus libero lacinia mauris, id tempus mauris risus ac purus. Fusce."

const loremIpsumArray = unique([ 'Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'consectetur', 'adipiscing',  'elit.', 'Nulla', 'ac', 'varius', 'massa.', 'Maecenas', 'eget',  'mattis', 'erat.', 'Mauris', 'luctus',  'libero', 'eget', 'tortor', 'finibus',  'maximus', 'eget',  'non', 'nulla.', 'Nunc',  'at', 'maximus',  'nisl.', 'Praesent', 'efficitur', 'arcu', 'metus,', 'sed', 'porttitor', 'leo', 'ultricies',  'nec.',  'Suspendisse', 'in', 'quam',  'nisl.', 'Suspendisse', 'et', 'auctor', 'mi.', 'Sed',  'vulputate,',  'risus', 'id', 'dictum', 'tincidunt,', 'risus', 'ante', 'faucibus', 'arcu,', 'vitae', 'fringilla', 'mi', 'turpis', 'nec', 'erat.', 'Suspendisse', 'ac', 'ex', 'eu', 'tortor',  'fringilla', 'pretium', 'at', 'eget',  'arcu.', 'Proin', 'dapibus', 'est', 'ut', 'aliquet', 'fermentum.',  'Pellentesque', 'quis',  'consectetur', 'augue.',  'Morbi', 'maximus,', 'lorem', 'non', 'consequat',  'vulputate,',  'metus', 'libero', 'lacinia',  'mauris,', 'id', 'tempus', 'mauris', 'risus', 'ac', 'purus.', 'Fusce.' ])