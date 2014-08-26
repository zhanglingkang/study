###
$import("module/animal.coffee");
###

class Snake extends Animal
    say: (word) ->
        console.log @name + " say zizizi. He can\'t say #{word}."
