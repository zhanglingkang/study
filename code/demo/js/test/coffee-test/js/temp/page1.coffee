###
类
###

class Animal
    constructor: (@name) ->
        console.log @name + " was born."
    
    say: (word) ->
        console.log @name + " say #{word}."

###
$import("module/animal.coffee");
###

class Snake extends Animal
    say: (word) ->
        console.log @name + " say zizizi. He can\'t say #{word}."

###
$import("module/animal.coffee");
###

class Pig extends Animal



index = "This is index."
console.log index

###
$import("module/snake.coffee");
$import("module/pig.coffee");
###

tom = new Snake "Tommy Python"
sam = new Pig "Sammy Pig"
tom.say "lalala"
sam.say "lelele"
