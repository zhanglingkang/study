define(['underscore'], function (_) {

    var canvas
    var ctx
    var fireworks = []
    var particles = []
    var audioList = []
    var audioDuration = 6400
    var options = {
        fireworkNumber: 40,
        particleCount: 40,
        audioNumber: 3
    }
    var playing


    function updateCanvasSize() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }

    var random = _.random
    var initCanvas = _.once(function () {

        canvas = document.createElement("canvas")
        $(canvas).css({
            position: "fixed",
            left: 0,
            top: 0,
            "z-index": -1
        })
        updateCanvasSize()
        $(window).resize(updateCanvasSize)
        document.body.appendChild(canvas)
        ctx = canvas.getContext("2d")
    })
    var initAudio = _.once(function () {
        for (var i = 0; i < options.audioNumber; ++i) {
            var audio = document.createElement("audio")
            audio.loop = true
            audio.src = DSHOW_CONTEXT + "/statics/js/utils/firework.mp3"
            audio.initialTime = audioDuration / options.audioNumber * i
            document.body.appendChild(audio)
            audioList.push(audio)
        }
    })
    var playAudio = function () {
        audioList.forEach(function (audio, i) {
            audio.currentTime = 0
            setTimeout(function () {
                if (playing) {
                    audio.play()
                }
            }, i * audioDuration / options.audioNumber)
        })
    }
    var stopPlayAudio = function () {
        audioList.forEach(function (audio) {
            audio.pause()
        })
    }
    var produceFireworks = function () {
        var width = canvas.width
        var height = canvas.height
        if (fireworks.length < options.fireworkNumber) {
            var x = random(0, width)
            fireworks.push(new Firework(x, height, x, random(0, height / 2)))
        }
    }


    function calculateDistance(p1x, p1y, p2x, p2y) {
        var xDistance = p1x - p2x,
            yDistance = p1y - p2y;
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }

    function Firework(sx, sy, tx, ty) {
        // actual coordinates
        this.x = sx;
        this.y = sy;
        // starting coordinates
        this.sx = sx;
        this.sy = sy;
        // target coordinates
        this.tx = tx;
        this.ty = ty;
        // distance from starting point to target
        this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
        this.distanceTraveled = 0;
        // track the past coordinates of each firework to create a trail effect, increase the coordinate count to create more prominent trails
        this.coordinates = [];
        this.coordinateCount = 3;
        // populate initial coordinate collection with the current coordinates
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.atan2(ty - sy, tx - sx);
        this.speed = 2;
        this.acceleration = 1.05;
        this.hue = random(0, 360)
        this.brightness = random(50, 70);
        // circle target indicator radius
        this.targetRadius = 1;
    }

    // update firework
    Firework.prototype.update = function (index) {
        // remove last item in coordinates array
        this.coordinates.pop();
        // add current coordinates to the start of the array
        this.coordinates.unshift([this.x, this.y]);

        // cycle the circle target indicator radius
        if (this.targetRadius < 8) {
            this.targetRadius += 0.3;
        } else {
            this.targetRadius = 1;
        }

        // speed up the firework
        this.speed *= this.acceleration;

        // get the current velocities based on angle and speed
        var vx = Math.cos(this.angle) * this.speed,
            vy = Math.sin(this.angle) * this.speed;
        // how far will the firework have traveled with velocities applied?
        this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

        // if the distance traveled, including velocities, is greater than the initial distance to the target, then the target has been reached
        if (this.distanceTraveled >= this.distanceToTarget) {
            createParticles(this.tx, this.ty, this.hue);
            // remove the firework, use the index passed into the update function to determine which to remove
            fireworks.splice(index, 1);
        } else {
            // target not reached, keep traveling
            this.x += vx;
            this.y += vy;
        }
    }

    // draw firework
    Firework.prototype.draw = function () {
        ctx.beginPath();
        // move to the last tracked coordinate in the set, then draw a line to the current x and y
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'hsl(' + this.hue + ', 100%, ' + this.brightness + '%)';
        ctx.stroke();

        //ctx.beginPath();
        //ctx.arc( this.tx, this.ty, this.targetRadius, 0, Math.PI * 2 );
        //ctx.stroke();
    }

    // create particle
    function Particle(x, y, hue) {
        this.x = x;
        this.y = y;
        // track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
        this.coordinates = [];
        this.coordinateCount = 5;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        // set a random angle in all possible directions, in radians
        this.angle = random(0, Math.PI * 2);
        this.speed = random(1, 10);
        // friction will slow the particle down
        this.friction = 0.95;
        // gravity will be applied and pull the particle down
        this.gravity = 1;
        // set the hue to a random number +-20 of the overall hue variable
        this.hue = random(hue - 20, hue + 20);
        this.brightness = random(50, 80);
        this.alpha = 1;
        // set how fast the particle fades out
        this.decay = random(0.015, 0.03);
    }

    // update particle
    Particle.prototype.update = function (index) {
        // remove last item in coordinates array
        this.coordinates.pop();
        // add current coordinates to the start of the array
        this.coordinates.unshift([this.x, this.y]);
        // slow down the particle
        this.speed *= this.friction;
        // apply velocity
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        // fade out the particle
        this.alpha -= this.decay;

        // remove the particle once the alpha is low enough, based on the passed in index
        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    }

    // draw particle
    Particle.prototype.draw = function () {
        ctx.beginPath();
        // move to the last tracked coordinates in the set, then draw a line to the current x and y
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
        ctx.stroke();
    }

    // create particle group/explosion
    function createParticles(x, y, hue) {
        // increase the particle count for a bigger explosion, beware of the canvas performance hit with the increased particles though
        var particleCount = options.particleCount;
        while (particleCount--) {
            particles.push(new Particle(x, y, hue));
        }
    }

    var play
    var stopPlay
    (function () {
        var animationFrameId
        play = function () {
            playAudio()
            function loop() {
                // this function will run endlessly with requestAnimationFrame
                animationFrameId = requestAnimationFrame(loop);

                // normally, clearRect() would be used to clear the canvas
                // we want to create a trailing effect though
                // setting the composite operation to destination-out will allow us to clear the canvas at a specific opacity, rather than wiping it entirely
                ctx.globalCompositeOperation = 'destination-out';
                // decrease the alpha property to create more prominent trails
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // change the composite operation back to our main mode
                // lighter creates bright highlight points as the fireworks and particles overlap each other
                ctx.globalCompositeOperation = 'lighter';

                // loop over each firework, draw it, update it
                var i = fireworks.length;
                while (i--) {
                    fireworks[i].draw();
                    fireworks[i].update(i);
                }

                // loop over each particle, draw it, update it
                var i = particles.length;
                while (i--) {
                    particles[i].draw();
                    particles[i].update(i);
                }

                produceFireworks()
            }

            loop()

        }
        stopPlay = function () {
            cancelAnimationFrame(animationFrameId)
            stopPlayAudio()
        }
    }())


    // public
    var config = _.compose(function () {

    }, _.partial(_.extend, options))

    function start() {
        if (playing) {
            return
        }
        playing = true
        initCanvas()
        initAudio()
        produceFireworks()
        play()
    }

    function stop() {
        if(playing!==undefined) {
            fireworks = []
            particles = []
            playing = false
            stopPlay()
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
    }

    return {
        config: config,
        start: start,
        stop: stop,
        isPlay: function () {
            return playing
        }
    }

})


