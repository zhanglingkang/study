define(['underscore'], function (_) {
    /**
     * @param {Object} options
     * @param options.x
     * @param options.y
     */
    function Particle(options) {
        var variable = ["x", "y"]
        if (_.random(0, 1)) {
            variable = variable.reverse()
        }
        this.k = [-1, 1][_.random(0, 1)] * Math.random()//k表示斜率
        this.variable = variable//变量顺序
        this.direction = [-1, 1][_.random(0, 1)]//方向
        this.x = options.x
        this.y = options.y
        this.color = getRandomColor()
        this.radius = _.random(1, 3)
        this.speed = this.direction * _.random(10, 15)
        this.lastPositon = [{
            x: this.x,
            y: this.y
        }]
    }

    Particle.prototype = {
        updatePosition: function () {
            this.lastPositon.push({
                x: this.x,
                y: this.y
            })
            if (this.lastPositon.length > 3) {
                this.lastPositon.shift()
            }
            this[this.variable[0]] += this.speed
            this[this.variable[1]] += this.speed * this.k
        },
        update: function (i) {
            this.updatePosition()
            if (this.x < 0 || this.y < 0 || this.x > canvas.width || this.y > canvas.height) {
                particles.splice(i, 1)
                bombOneIfNeed()
            }
        },
        draw: function () {
            ctx.fillStyle = this.color
//            ctx.beginPath()
//            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
//            ctx.fill()
            ctx.beginPath()
            ctx.moveTo(this.lastPositon[this.lastPositon.length - 1].x, this.lastPositon[this.lastPositon.length - 1].y)
            ctx.lineTo(this.x, this.y)
            ctx.strokeStyle = this.color
            ctx.stroke()
        }
    }
    /**
     * @param {Object} options
     * @param options.x
     * @param options.y
     * @param options.imageData
     */
    function Digit(options) {
        this.x = options.x
        this.y = options.y
        this.imageData = options.imageData
    }

    Digit.prototype = {
        update: _.noop,
        getCenter: function () {
            return {
                x: this.x + this.imageData.width / 2,
                y: this.y + this.imageData.height / 2
            }
        },
        draw: function () {
            ctx.putImageData(this.imageData, this.x, this.y)
        }
    }

    function bombOneIfNeed() {
        if (particles.length == 0) {
            if (digits.length > 0) {
                try {
                    audio.currentTime = 0
                } catch (e) {

                }
                audio.play()
                var digit = digits.pop()
                var particlesLength = 200
                var center = digit.getCenter()
                while (particlesLength--) {
                    particles.push(new Particle(center))
                }
            }
        }
    }

    var digits = []
    var particles = []
    var canvas
    var ctx
    var numberWidth = 1008 / 8//呈现爆炸特效的数字宽度
    var audio
    var rawRequestAnimationFrame = window.requestAnimationFrame
    var lastRequestAnimationFrameId
    var playing
    var callback
    var MAX_FONT_SIZE = 220
    var needDrawText
    var requestAnimationFrame = function (fn) {
        lastRequestAnimationFrameId = rawRequestAnimationFrame(fn)
        return lastRequestAnimationFrameId
    }

    var initAudio = _.once(function () {
        audio = document.createElement("audio")
        audio.src = QMX_CONTEXT + "/themes/default/js/utils/bomb.mp3"
        document.body.appendChild(audio)
    })
    var initCanvas = _.once(function () {
        canvas = document.createElement("canvas")
        $(canvas).css({
            position: "fixed",
            left: 0,
            top: 0,
            "z-index": 1000
        })
        updateCanvasSize()
        $(window).resize(updateCanvasSize)
        document.body.appendChild(canvas)
        ctx = canvas.getContext("2d")
    })

    function updateCanvasSize() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }

    function getRandomColor() {
        return 'hsla(' + _.random(0, 360) + ', 100%, ' + 50 + '%,' + Math.min(Math.random() + 0.2, 1) + ')'
    }

    function getCenter(fontSize) {
        return {
            x: canvas.width / 2,
            y: canvas.height / 2 + getFontHeight(fontSize) / 2
        }
    }

    function getFontHeight(fontSize) {
        return fontSize * 0.8
    }

    function updateTextRandomColorList() {
        drawText.randomColorList = []
        var linearLength = 10
        for (var i = 0; i <= linearLength; ++i) {
            drawText.randomColorList.push(getRandomColor())
        }
    }

    /**
     * @param options
     * @param options.text
     * @param options.fontSize
     * @param options.fillStyle
     */
    function drawText(options) {
        if (!drawText.randomColorList) {
            updateTextRandomColorList()
        }
        var center = getCenter(options.fontSize)
        if (!options.fillStyle) {
            var linearText = ctx.createLinearGradient(0, center.y - getFontHeight(options.fontSize), 0, center.y)
            drawText.randomColorList.forEach(function (color, i) {
                linearText.addColorStop(i / drawText.randomColorList.length, color)
            })
            ctx.fillStyle = linearText
        } else {
            ctx.fillStyle = options.fillStyle
        }
        //ctx.fillStyle = "white"
        ctx.font = options.fontSize + "px Arial"
        ctx.textAlign = "center"
        ctx.fillText(options.text, center.x, center.y)
    }

    /**
     *
     */
    function bomb() {
        bombOneIfNeed()
        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            drawText({
                text: needDrawText,
                fontSize: MAX_FONT_SIZE,
                fillStyle: "white"
            })
            var i = digits.length;
            while (i--) {
                digits[i].draw()
                digits[i].update()
            }
            var i = particles.length
            while (i--) {
                particles[i].draw()
                particles[i].update(i)
            }
            if (digits.length != 0 || particles.length != 0) {
                requestAnimationFrame(loop)
            } else {
                stop()
                if (callback) {
                    callback()
                }
            }
        }

        loop()
    }

    //public
    /**
     *
     * @param {number} number 呈现爆炸特效的数字
     */
    function play(number, cb) {
        needDrawText = number
        playing = true
        number = number + ""
        callback = cb
        initCanvas()
        initAudio()
        var fontSizeList = []
        for (var i = 0; i <= MAX_FONT_SIZE; i += 2) {
            fontSizeList.push(1 + i)
        }
        fontSizeList.maxFontSize = fontSizeList[fontSizeList.length - 1]
        $(canvas).css({
            backgroundColor: "#03121F",
            opacity: 0.9
        })
        function loop() {
            if (fontSizeList.length > 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                drawText({
                    fontSize: fontSizeList.shift(),
                    text: number
                })
                requestAnimationFrame(loop)
            } else {
                var numberOffsetX = (canvas.width - numberWidth * number.length) / 2
                var width = numberWidth
                var height = getFontHeight(fontSizeList.maxFontSize) + 30
                var x = 0
                var y = (canvas.height - height) / 2
                for (var i = 0; i < number.length; ++i) {
                    x = numberOffsetX + i * width
                    digits.push(new Digit({
                        x: x,
                        y: y,
                        imageData: ctx.getImageData(x, y, width, height)
                    }))
                }
                bomb()

            }
        }

        loop()
    }

    function stop() {
        if (playing !== undefined) {
            updateTextRandomColorList()
            $(canvas).css({
                backgroundColor: "initial",
                opacity: "initial"
            })
            //callback = null
            playing = false
            expose.start = _.once(play)
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            particles = []
            digits = []
            audio.pause()
            cancelAnimationFrame(lastRequestAnimationFrameId)
        }
    }

    var expose = {
        start: _.once(play, callback),
        stop: stop,
        showNumber: function (number) {
            initCanvas()
            $(canvas).css({
                backgroundColor: "#03121F",
                opacity: 0.8
            })
            drawText({
                text: number,
                fontSize: MAX_FONT_SIZE,
                fillStyle: "white"
            })
        },
        stopShowNumber: stop,
        isPlay: function () {
            return playing
        }
    }
    return expose
})