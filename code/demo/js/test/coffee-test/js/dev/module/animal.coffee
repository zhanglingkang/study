###
类
###

class Animal
    constructor: (@name) ->
        console.log @name + " was born."
    
    say: (word) ->
        console.log @name + " say #{word}."
