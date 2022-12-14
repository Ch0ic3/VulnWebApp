


var comp = {"company":"google"}
comp.__proto__.toString = () => {
    console.log("yahoo")
}

console.log(comp.toString())