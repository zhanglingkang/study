define(['underscore'], function (_) {
    function getRandomColor() {
        return 'hsla(' + _.random(0, 360) + ', 100%, ' + _.random(20, 100) + '%,' + Math.min(Math.random() + 0.2, 1) + ')'
    }

    function rand(min, max) {
        return Math.random() * ( max - min ) + min;
    }

    function distance(a, b) {
        var dx = a.x - b.x,
            dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     */
    function Particle() {
        //this.x = options.x
        //this.y = options.y
        //this.width = options.width
        //this.height = options.height
        //this.color = getRandomColor()
        //this.speed = _.random(6, 10)
        //this.hue = _.random(0, 360)
        //this.brightness = _.random(50, 80)
        //this.alpha = 1
        //this.decay = _.random(0.015, 0.03)
        this.path = []
        this.reset()
        this.color = getRandomColor()
    }

    Particle.prototype = {
        reset: function () {
            this.radius = 1;
            this.x = _.random(0, canvas.width);
            this.y = canvas.height - visibleHeight;
            this.vx = 0;
            this.vy = 0;
            this.hit = 0;
            this.path.length = 0
        },
        update: function (i) {
            //this.y += this.speed
            //if (this.y > canvas.height) {
            //    particles.splice(i, 1)
            //}
            this.hit = 0;

            this.path.unshift([this.x, this.y]);
            if (this.path.length > particlePath) {
                this.path.pop();
            }

            this.vy += gravity;

            this.x += this.vx;
            this.y += this.vy;

            if (this.y > canvas.height + 15) {
                //particles.splice(i, 1);
                if (visibleHeight < canvas.height) {
                    this.reset();
                } else {
                    particles.splice(i, 1);
                }
            }

            var i = pillarCount;
            while (i--) {
                var pillar = pillars[i];
                if (distance(this, pillar) < this.radius + pillar.renderRadius) {
                    //if (this.y + 20 > canvas.height) {
                    this.vx = 0;
                    this.vy = 0;
                    this.vx += -( pillar.x - this.x ) * rand(0.01, 0.03);
                    this.vy += -( pillar.y - this.y ) * rand(0.01, 0.03);
                    pillar.radius -= 0.1;
                    this.hit = 1;
                }
            }
        },
        draw: function () {
            //ctx.fillStyle = this.color
            ctx.beginPath();
            ctx.moveTo(this.x, ~~this.y);
            for (var i = 0, length = this.path.length; i < length; i++) {
                var point = this.path[i];
                ctx.lineTo(point[0], ~~point[1]);
            }
            ctx.strokeStyle = 'hsla(' + rand(hue + ( this.x / 3 ), hue + ( this.x / 3 ) + hueRange) + ', 50%, 60%, 0.3)'
            ctx.stroke()

            if (this.hit) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, rand(1, 25), 0, TWO_PI);
                ctx.fillStyle = 'hsla(' + rand(hue + ( this.x / 3 ), hue + ( this.x / 3 ) + hueRange) + ', 80%, 15%, 0.1)'
                ctx.fill();
            }
        }
    }
    function Pillar() {
        this.reset();
    }

    Pillar.prototype.reset = function () {
        this.radius = rand(20, 30);
        this.renderRadius = 0;
        this.x = rand(0, canvas.width);
        this.y = rand(canvas.height - 10, canvas.height);
        this.active = 0;
    };

    Pillar.prototype.update = function () {
        if (this.active) {
            if (this.radius <= 1) {
                this.reset();
            } else {
                this.renderRadius = this.radius;
            }
        } else {
            if (this.renderRadius < this.radius) {
                this.renderRadius += 0.5;
            } else {
                this.active = 1;
            }
        }
    };

    Pillar.prototype.draw = function () {
//        ctx.beginPath();
//        ctx.arc(this.x, this.y, this.renderRadius, 0, TWO_PI, false);
//        ctx.fill();
    };
    var canvas
    var ctx
    var audio
    var visibleHeight //canvas的可见高度
    var particles
    var callback
    var CANVAS_SPEED = 5
    var particleCount = 1000
    var particlePath = 4
    var gravity = 0.1
    var pillarCount = 110
    var pillars = []
    var playing
    var hue = 0
    var hueRange = 60
    var hueChange = 1
    var PI = Math.PI
    var TWO_PI = PI * 2
    var initCanvas = _.once(function () {
        canvas = document.createElement("canvas")
        $(canvas).css({
            position: "fixed",
            left: 0,
            top: 0,
            "z-index": 2000
        })
        updateCanvasSize()
        $(window).resize(updateCanvasSize)
        ctx = canvas.getContext("2d")
    })
    var initAudio = _.once(function () {
        audio = document.createElement("audio")
        audio.loop = true
        document.body.appendChild(audio)
    })

    function updateCanvasSize() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }

    function init() {
        initCanvas()
        initAudio()
        particles = []
        visibleHeight = 0
        var i = pillarCount
        while (i--) {
            pillars.push(new Pillar())
        }
    }

    /**
     * 晃动
     * @param {jQuery} $wobbleElement
     *
     */
    function wobble($wobbleElement) {
        wobble.$wobbleElement = $wobbleElement
        function loop() {
            var x = [-20, 20][_.random(0, 1)] + "px"
            var y = [-20, 20][_.random(0, 1)] + "px"
            $wobbleElement.css({
                transform: "translate(" + x + "," + y + ")"
            })
            wobble.animationFrameId = requestAnimationFrame(loop)
        }

        loop()
        //return deferred
    }

    function stopWobble() {
        cancelAnimationFrame(wobble.animationFrameId)
        wobble.$wobbleElement.css({
            transform: "translate(0,0)"
        })
    }

    function crush() {
        //requestAnimationFrame(function loop() {
        if (visibleHeight < canvas.height) {
            var oldVisibleHeight = visibleHeight
            visibleHeight = Math.min(visibleHeight + CANVAS_SPEED, canvas.height)
            //$(canvas).css({
            //    transform: "translateY(" + (canvas.height - visibleHeight) + "px)"
            //})

            //})
            //var i = particles.length
            //while (i--) {
            //    var distance = ( visibleHeight - oldVisibleHeight)
            //    particles[i].y += distance
            //}
            produceParticle()
        }

    }

    function down() {
        function draw() {
            ctx.fillStyle = 'hsla(0, 0%, 0%, 0.1)';
            ctx.fillRect(0, canvas.height - visibleHeight, canvas.width, visibleHeight);

            ctx.globalCompositeOperation = 'lighter';
            var i = particles.length;
            while (i--) {
                particles[i].draw();
            }

            ctx.globalCompositeOperation = 'source-over';
            i = pillarCount;
            ctx.fillStyle = 'rgba(20, 20, 20, 0.3)';
            while (i--) {
                pillars[i].draw();
            }
        }

        function update() {
            hue += hueChange;
            visibleHeight += 2;
            produceParticle();
            //if (particles.length < particleCount && visibleHeight < canvas.height) {
            //    particles.push(new Particle());
            //}

            var i = particles.length;
            while (i--) {
                particles[i].update(i);
            }

            i = pillarCount;
            while (i--) {
                pillars[i].update();
            }
        }

        function loop() {
            if (particles.length > 10 || visibleHeight < canvas.height) {
                down.animationFrameId = requestAnimationFrame(loop)
                update()
                draw()
            } else {
                stop()
                if (callback) {
                    callback()
                }
            }
            //ctx.fillStyle = 'hsla(0, 0%, 0%, 0.1)';
            //ctx.fillRect(0, canvas.height - visibleHeight, canvas.width, canvas.height)
            //hue += hueChange
            //
            //if (particles.length < particleCount) {
            //    particles.push(new Particle())
            //}
            ////crush()
            //var i = particles.length
            //while (i--) {
            //    particles[i].draw()
            //    particles[i].update(i)
            //}
            //if (particles.length > 0 || visibleHeight < canvas.height) {
            //    down.animationFrameId = requestAnimationFrame(loop)
            //} else {
            //    stop()
            //}
        }

        loop()

    }

    function produceParticle() {
        if (particles.length < particleCount && visibleHeight < canvas.height) {
            var count = 10
            while (particles.length < particleCount && count > 0) {
                count--
                particles.push(new Particle())
            }
        }
        //var avgWidth = canvas.width / MAX_PARTICLE
        //if (visibleHeight < canvas.height) {
        //    while (particles.length < MAX_PARTICLE) {
        //        particles.push(new Particle({
        //            x: _.random(0, canvas.width),//avgWidth * i,
        //            y: canvas.height - visibleHeight,
        //            width: Math.max(avgWidth - 5, 5),
        //            height: _.random(7, 15)
        //        }))
        //    }
        //}
        //for (var i = 0; i < MAX_PARTICLE; ++i) {
        //    particles.push(new Particle({
        //        x: avgWidth * i,
        //        y: 0,
        //        width: Math.max(avgWidth - 5, 5),
        //        height: _.random(7, 15)
        //    }))
        //}
    }


    /**
     *
     * @param options.selector 发生晃动的元素
     * @param options.callback
     */
    function start(options) {
        callback = options.callback
        playing = true
        init()
        //$(options.selector).append(canvas)
        $("body").append(canvas)
        wobble($(options.selector))
        audio.volume = 0.4
        audio.src = QMX_CONTEXT + "/themes/default/js/utils/crush.mp3"
        audio.currentTime = 0
        audio.play()
        wobble.timeoutId = setTimeout(function () {
            stopWobble()
            audio.src = QMX_CONTEXT + "/themes/default/js/utils/volcano.mp3"
            //audio.pause()
            audio.play()
            down()
            //wobble.timeoutId=setTimeout(function(){
            //    stopWobble()
            //    audio.pause()
            //})
        }, 5000)
    }


    function stop() {
        if (canvas) {
            playing = false
            expose.start = _.once(start)
            audio.pause()
            stopWobble()
            cancelAnimationFrame(down.animationFrameId)
            clearTimeout(wobble.timeoutId)
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
    }

    var expose = {
        start: _.once(start),
        stop: stop,
        isPlay: function () {
            return playing
        }
    }
    return expose
})