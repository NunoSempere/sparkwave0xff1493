
## Install:

## From git:
```
git clone https://github.com/NunoSempere/sparkwave0xff1493
cd sparkwave0xff1493
npm install
```
### From npm (gets installed to your local node_modules):
```
npm install @lokiodinevich/sparkwave0xff1493
```

## Use

### From command line (after installing from git.)
```
node trackDependencies.js test/INPUT1.txt # Use a test file (INPUT1.txt, INPUT2.txt or INPUT3.txt)
node trackDependencies.js yourFileName.txt # Use your own file
```

### Within a project (after installing from npm.)
```
const lib = require("@lokiodinevich/sparkwave0xff1493")
lib.fileNameIntoOutput("yourFileName.txt")

```

```
const lib = require("@lokiodinevich/sparkwave0xff1493")

let callback = (result) => {
    console.log(result)
    let resultPrettyFormat = lib.prettyFormatLibTree(result);
    console.log(resultPrettyFormat)
}

lib.fileNameIntoOutput("yourFileName.txt", callback)

```