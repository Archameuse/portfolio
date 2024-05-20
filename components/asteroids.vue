<template>
    <canvas class="w-full h-full" ref="scene"></canvas>
</template>

<script setup lang="ts">
import * as tf from '@tensorflow/tfjs';
const props = defineProps({
    instances: {
        default: 1,
        type: Number
    },
    x: Number,
    y: Number,
    onlyBog: Boolean,
    ai: Boolean,
    ui: Boolean,
    punishafk: Boolean,
    fps: {
        type: Number,
        default: 60
    },
    timetolive: {
        type: Number,
        default: 0
    }
})
const emit = defineEmits<{
    (e: 'genupdate', gen:number):void
    (e: 'scoreupdate', score:number):void
}>()
const SCENE_SIZE = {
        x: props.x || 500,
        y: props.y || 500
    }
const COLOR = {primary:'black',secondary:'white'}
const HIGHSCORE = ref<number>(0)
const scene = ref<HTMLCanvasElement>()
const context = ref<CanvasRenderingContext2D|null>(null)
const GAMES = new Set<GAME>()
const SAVED_GAMES = new Set<GAME>()
const BOG = ref<GAME>()
const fpsInterval = computed(() => 1000/props.fps)

let BESTBRAIN:{brain:NeuralNetwork,score:number}
const GENERATION = ref<number>(0)
class GAME {
    hitboxes:boolean;
    showtarget:boolean;
    currentlvl:number;
    maxlvl:number;
    aperlvl:number;
    score:number;
    lives:number;
    safezone:number;
    spawnsize:number;
    bulletsmax:number;
    ship:SHIP;
    bullets: Set<BULLET>;
    asteroids: Set<ASTEROID>;
    constructor(brain?:NeuralNetwork) {
        this.hitboxes = false,
        this.showtarget = true, //for ai only
        this.currentlvl = 1,
        this.maxlvl = 5,
        this.aperlvl = 2,
        this.score = 0,
        this.lives = 0,
        this.safezone = 80,
        this.spawnsize = 3,    //undefined for random(1-3)
        this.bulletsmax = 3,
        this.bullets = new Set(),
        this.asteroids = new Set(),
        this.ship = new SHIP(this,brain)
        this.AddAsteroids()
    }
    Drawlives() {
        let ctx = context.value
        if(!ctx) return
        for(let i = 0; i < this.lives;i++) {
            let l = 10
            let x = SCENE_SIZE.x - 30*i - this.ship.size*2
            let y = 30
            let a = deg2rad(90)
            let angles = [
                deg2rad(180),
                deg2rad(-60),
                deg2rad(80),
                deg2rad(60),
            ]
            ctx.beginPath()
            ctx.lineTo(Math.floor(x + l * Math.cos(a + angles[0])), Math.floor(y + l * Math.sin(a + angles[0])))
            ctx.lineTo(Math.floor(x + l * Math.cos(a + angles[1])), Math.floor(y + l * Math.sin(a + angles[1])))
            ctx.lineTo(Math.floor(x + l/this.ship.size * Math.cos(a + angles[2])), Math.floor(y + l/this.ship.size * Math.sin(a + angles[2])))
            ctx.lineTo(Math.floor(x + l * Math.cos(a + angles[3])), Math.floor(y + l * Math.sin(a + angles[3])))
            ctx.closePath()
            ctx.stroke()
        }
    }
    ScoreFunc(score:number) {
        this.score = this.score + score
        if(this.score > HIGHSCORE.value) HIGHSCORE.value = Math.floor(this.score)
        if(!BOG.value||this.score > BOG.value.score) BOG.value = this
    }
    AddAsteroids() {
        for(let i = 0; i < this.currentlvl*this.aperlvl; i++) this.asteroids.add(new ASTEROID(this.spawnsize,this))
    }
    Collision() {
        this.asteroids.forEach(asteroid => {
            if(this.ship.collision) if(collision(this.ship.x, this.ship.y, this.ship.size, asteroid.x, asteroid.y, asteroid.size)) this.ship.death()
            this.bullets.forEach(bullet => {
                if(collision(asteroid.x,asteroid.y,asteroid.size,bullet.x,bullet.y,bullet.size)) {
                    asteroid.death()
                    bullet.death()
                }
            })
        })
    }
    NewLVL() {
        this.currentlvl = Math.min(this.currentlvl+1,this.maxlvl)
        this.AddAsteroids()
    }
}
class SHIP {
    alive:boolean;
    game:GAME;
    speed: {move:number, rotate:number}
    velocity: {x:number,y:number,a:number}
    accel:{move:number,rotate:number}
    friction:{move:number,rotate:number}
    size:number;
    x:number;
    y:number;
    a:number;
    collision:boolean;
    keyState: {
        ArrowUp?:boolean;
        ArrowLeft?:boolean;
        ArrowRight?:boolean;
    };
    brain?:NeuralNetwork;
    timetolive:number;
    timeout?:NodeJS.Timeout;
    constructor(game:GAME, brain?:NeuralNetwork) {
        this.alive = true
        this.size = 10
        this.game = game
        this.speed = {
                move:  0.2,
                rotate: 3
        },
        this.velocity = {
            x: 0,
            y: 0,
            a: 0
        },
        this.accel = {
            move: 0.03, //useless for now
            rotate:  0.08
        },
        this.friction = {
            move: 0.97,
            rotate: 0.92
        },
        this.size = 10,
        this.x = SCENE_SIZE.x/2,
        this.y = SCENE_SIZE.y/2,
        this.a = 90,
        this.collision = true,
        this.keyState = {},
        this.brain = brain||undefined
        this.timetolive = props.timetolive //seconds, only for ai
        this.timeout = this.brain&&this.timetolive>0 ? setTimeout(() => this.death(), this.timetolive*1000) : undefined
    }
    draw() {
        let ctx = context.value
        if(!ctx) return
        let x = this.x
        let y = this.y
        let a = deg2rad(this.a)
        let l = this.size
        let angles = [
            deg2rad(180),
            deg2rad(-60),
            deg2rad(80),
            deg2rad(60),
        ]
        ctx.beginPath()
        ctx.lineTo(Math.floor(x + l * Math.cos(a + angles[0])), Math.floor(y + l * Math.sin(a + angles[0])))
        ctx.lineTo(Math.floor(x + l * Math.cos(a + angles[1])), Math.floor(y + l * Math.sin(a + angles[1])))
        ctx.lineTo(Math.floor(x + l/this.size * Math.cos(a + angles[2])), Math.floor(y + l/this.size * Math.sin(a + angles[2])))
        ctx.lineTo(Math.floor(x + l * Math.cos(a + angles[3])), Math.floor(y + l * Math.sin(a + angles[3])))
        ctx.closePath()
        ctx.stroke()
        if(this.game.hitboxes) {
            ctx.beginPath()
            ctx.arc(Math.floor(this.x), Math.floor(this.y), Math.floor(this.size), 0, Math.PI * 2)
            ctx.closePath()
            ctx.stroke()
        }
    }
    move() {
        this.a += this.velocity.a
        this.x += this.velocity.x
        this.y += this.velocity.y
        wraparound(this, this.size)
    }
    shoot() {
        if(!this.alive || this.game.bullets.size >= this.game.bulletsmax) return
        let a = this.a
        let x = this.x - this.size * Math.cos(deg2rad(a))
        let y = this.y - this.size * Math.sin(deg2rad(a))
        this.game.bullets.add(new BULLET(this.game, x, y, a))
        // game.score -= 5
    }
    controls() {
        if(this.keyState.ArrowUp) {
            this.velocity.x -= this.speed.move * Math.cos(deg2rad(this.a))
            this.velocity.y -= this.speed.move * Math.sin(deg2rad(this.a))
        }
        // if(!this.keyState.ArrowUp) this.speed.move *= this.friction.move
        if(this.keyState.ArrowLeft && this.velocity.a > -this.speed.rotate) this.velocity.a -= this.speed.rotate * this.accel.rotate
        if(this.keyState.ArrowRight && this.velocity.a < this.speed.rotate) this.velocity.a += this.speed.rotate * this.accel.rotate
        if(!this.keyState.ArrowLeft && !this.keyState.ArrowRight) this.velocity.a *= this.friction.rotate
        if(this.a > 360) this.a = this.velocity.a
        if(this.a < 0) this.a = 360 - this.velocity.a
        this.velocity.x *= this.friction.move
        this.velocity.y *= this.friction.move
    }
    death() {
        if(this.timeout) clearTimeout(this.timeout)
        this.collision = false
        this.alive = false
        this.game.lives--
        if(this.game.lives < 0) {
            if(props.ai) {
                SAVED_GAMES.add(this.game)
                GAMES.delete(this.game)
                if(GAMES.size===0) this.timeout = setTimeout(init, 10)
            }
        } else if (this.game.lives >= 0) {
            this.timeout = setTimeout(() => this.respawn(), 2000)
        }
    }
    respawn() {
        this.x = SCENE_SIZE.x/2
        this.y = SCENE_SIZE.y/2
        this.a = 90
        this.velocity = {x: 0, y: 0, a: 0}
        this.alive = true
        setTimeout(() => this.collision = true, 2000)
    }
    think() {
        if(!this.brain) return
        let x:number = this.x / SCENE_SIZE.x
        let y:number = this.y / SCENE_SIZE.y
        let a:number = this.a / 360
        let bullets:number = this.game.bullets.size / this.game.bulletsmax
        let vX:number = this.velocity.x / this.speed.move
        let vY:number = this.velocity.y / this.speed.move
        let vA:number = this.velocity.a / this.speed.rotate
        let aX:number = 0
        let aY:number = 0
        let aA:number = 0
        let aS:number = 0
        let aL:number = 0
        let aN = this.game.asteroids.size
        let nearDist:number
        this.game.asteroids.forEach(asteroid => {
            let dist = distance(x, y, asteroid.x / SCENE_SIZE.x, asteroid.y / SCENE_SIZE.y)
            if (!nearDist || dist < nearDist) {
                if(!dist) return
                aX = asteroid.x / SCENE_SIZE.x
                aY = asteroid.y / SCENE_SIZE.y
                aA = asteroid.a / 360
                aL = asteroid.level / this.game.spawnsize
                aS = asteroid.speed / asteroid.maxspeed
                nearDist = dist
            }
        })
        if((this.game.showtarget && props.onlyBog && BOG.value == this.game) || this.game.showtarget && !props.onlyBog){
            let ctx = context.value
            if(ctx) {
                ctx.beginPath()
                ctx.arc(Math.floor(aX * SCENE_SIZE.x), Math.floor(aY * SCENE_SIZE.y), 5, 0, Math.PI * 2)
                ctx.closePath()
                ctx.stroke()
            }
        }
        let inputs = [x, y, a, bullets, vX, vY, vA, aX, aY, aA, aS, aL, aN]
        let output = this.brain.predict(inputs as number[])
        // this.keyState['ArrowUp'] = true
        if(!output) return console.log('error with prediction output')
        if(output[0] >= 0.5) this.keyState['ArrowUp'] = true
        else                this.keyState['ArrowUp'] = false
        if(output[1] > output[2]) {
            this.keyState['ArrowLeft'] = true
            this.keyState['ArrowRight'] = false
        } else {
            this.keyState['ArrowRight'] = true
            this.keyState['ArrowLeft'] = false
        }
        if(output[3] >= 0.5) this.shoot()
        if(props.punishafk&&this.keyState['ArrowUp'] === false) this.game.ScoreFunc(-5)
    }
}
class BULLET {
        speed: number;
        size: number;
        maxdist: number;
        outset: number;
        x: number;
        y: number;
        a: number;
        traveled: number;
        game: GAME;
        constructor(game:GAME, x:number, y:number, a:number) {
            this.speed = 10,
            this.size = 2,
            this.maxdist = 450,
            this.outset = 5,
            this.x = x - this.outset * Math.cos(deg2rad(a)),
            this.y = y - this.outset * Math.sin(deg2rad(a)),
            this.a = a,
            this.traveled = 0
            this.game = game
        }
        draw() {
            let ctx = context.value
            if(!ctx) return
            ctx.strokeRect(this.x - this.size/2, this.y - this.size, this.size, this.size)
        }
        move() {
            this.x -= this.speed * Math.cos(deg2rad(this.a))
            this.y -= this.speed * Math.sin(deg2rad(this.a))
            this.traveled += this.speed
            if(this.traveled>this.maxdist) this.death()
            wraparound(this, this.size)
        }
        death() {
            this.game.bullets.delete(this)
        }
    }
    class ASTEROID {
        size: number;
        angles: number;
        level: number;
        x: number;
        y: number;
        a: number;
        maxspeed: number;
        speed: number;
        angle: number[];
        length: number[];
        game: GAME;
        constructor(level:number, game:GAME, x?:number, y?:number, a?:number){
            this.size = 10 * level,
            this.angles = 10
            this.level = level || random(3),
            this.x = x || randgap(0, game.ship.x - game.safezone, game.ship.x + game.safezone, SCENE_SIZE.x) || random(SCENE_SIZE.x),
            this.y = y || randgap(0, game.ship.y - game.safezone, game.ship.y + game.safezone, SCENE_SIZE.y) || random(SCENE_SIZE.y),
            this.a = a || Math.random() * 360,
            this.maxspeed = 3
            this.speed = Math.random() * this.maxspeed-0.3 + 0.3
            this.angle = [],
            this.length = []
            this.game = game
        }
        draw(){
            let ctx = context.value
            if(!ctx) return
            if (this.angle.length < 1) {
                for (let i = 0; i < this.angles; i++) {
                this.angle.push(deg2rad(360/this.angles * i))  
                if(this.length[i-1]) this.length.push(random(this.size * 0.2) + this.length[i-1] * 0.9)   
                else this.length.push(this.size)  
            }}
            ctx.beginPath()
            for (let i = 0; i <= this.angle.length; i++) {
                ctx.lineTo(Math.floor(this.x + this.length[i] * Math.cos(this.a + this.angle[i])), Math.floor(this.y + this.length[i] * Math.sin(this.a + this.angle[i])))
            }
            ctx.closePath()
            ctx.stroke()
            if(this.game.hitboxes) {
                ctx.beginPath()
                ctx.arc(Math.floor(this.x), Math.floor(this.y), Math.floor(this.size), 0, Math.PI * 2)
                ctx.closePath()
                ctx.stroke()
            }
        }
        move(){
            this.x -= this.speed * Math.cos(deg2rad(this.a))
            this.y -= this.speed * Math.sin(deg2rad(this.a))
            wraparound(this, this.size)
        }
        death() {
            this.game.asteroids.delete(this)
            this.game.ScoreFunc(Math.round(10/this.level)*10)
            if(this.level > 1) {
                this.game.asteroids.add(new ASTEROID(this.level-1,this.game,this.x,this.y))
                this.game.asteroids.add(new ASTEROID(this.level-1,this.game,this.x,this.y))
            } else if(this.game.asteroids.size===0) this.game.NewLVL()
            
        }
    }
    class NeuralNetwork {
        input_nodes: number;
        hidden_nodes: number;
        output_nodes: number;
        input_weights: tf.Tensor<tf.Rank>;
        output_weights: tf.Tensor<tf.Rank>;
        constructor(input_nodes:number, hidden_nodes:number, output_nodes:number) {
            this.input_nodes = input_nodes
            this.hidden_nodes = hidden_nodes
            this.output_nodes = output_nodes
            this.input_weights = tf.randomNormal([this.input_nodes, this.hidden_nodes])
            this.output_weights = tf.randomNormal([this.hidden_nodes, this.output_nodes])
        }
        predict(user_input:number[]) {
            let output:Float32Array | Int32Array | Uint8Array | undefined
            tf.tidy(() => {
                let input_layer = tf.tensor(user_input, [1, this.input_nodes])
                let hidden_layer = input_layer.matMul(this.input_weights).sigmoid()
                let output_layer = hidden_layer.matMul(this.output_weights).sigmoid()
                output = output_layer.dataSync()
            })
            return output
        }
        clone() {
            let clonie = new NeuralNetwork(this.input_nodes, this.hidden_nodes, this.output_nodes)
            clonie.dispose()
            clonie.input_weights = tf.clone(this.input_weights)
            clonie.output_weights = tf.clone(this.output_weights)
            return clonie
        }
        dispose() {
            this.input_weights.dispose()
            this.output_weights.dispose()
        }
        mutate(percentage:number) {
            function fn(x:number) {
                if(Math.random() < percentage) {
                    let offset = Math.random()*2 - 1
                    let newx = x + offset
                    return newx
                }
                return x
            }
            let brain = this
            let ih = brain.input_weights.dataSync().map(fn)
            let ih_shape = brain.input_weights.shape
            brain.input_weights.dispose()
            brain.input_weights = tf.tensor(ih, ih_shape)

            let ho = brain.output_weights.dataSync().map(fn)
            let ho_shape = brain.output_weights.shape
            brain.output_weights.dispose()
            brain.output_weights = tf.tensor(ho, ho_shape)
            return brain
        }
        crossover(parentB:NeuralNetwork) {
            let parentA = this
            let parentA_in_dna = parentA.input_weights.dataSync()
            let parentB_in_dna = parentB.input_weights.dataSync()
            let parentA_out_dna = parentA.output_weights.dataSync()
            let parentB_out_dna = parentB.output_weights.dataSync()

            let midIn = Math.floor(Math.random() * parentA_in_dna.length);
            let midOut = Math.floor(Math.random() * parentA_out_dna.length);
            let child_in_dna = [...parentA_in_dna.slice(0, midIn), ...parentB_in_dna.slice(midIn, parentB_in_dna.length)];
            let child_out_dna = [...parentA_out_dna.slice(0, midOut), ...parentB_out_dna.slice(midOut, parentB_out_dna.length)];
        
            let child = parentA.clone();
            let input_shape = parentA.input_weights.shape;
            let output_shape = parentA.output_weights.shape;

            child.dispose();

            child.input_weights = tf.tensor(child_in_dna, input_shape);
            child.output_weights = tf.tensor(child_out_dna, output_shape);
            return child
        }
    }



function wraparound(obj:{x:number,y:number}, size:number) {
        if(!size) size = 0 
        if(obj.x > SCENE_SIZE.x + size) obj.x = 0 - size
        if(obj.x < 0 - size) obj.x = SCENE_SIZE.x + size
        if(obj.y > SCENE_SIZE.y + size) obj.y = 0 - size
        if(obj.y < 0 - size) obj.y = SCENE_SIZE.y + size
    }
    function deg2rad(deg:number){
        return deg * Math.PI/180
    }
    function random(int:number){
        return Math.floor(Math.random() * int) + 1
    }
    function collision(p1x:number, p1y:number, r1:number, p2x:number, p2y:number, r2:number) {
        var a;
        var x;
        var y;
      
        a = r1 + r2;
        x = p1x - p2x;
        y = p1y - p2y;
        
        if (a > Math.sqrt((x * x) + (y * y))) {
            return true;
        } else {
            return false;
        }
    }
    function randgap(min1:number, max1:number, min2:number, max2:number) {
        let dif1 = max1 - min1 + 1
        let dif2 = max2 - min2 + 1
        let total = dif1+dif2
        let gap = min2-max1 - 1
        let rand = Math.floor(Math.random() * total + min1)
        if(rand > max1 && rand < min2) rand += gap
        return rand
    }

    function distance(x1:number, y1:number, x2:number, y2:number) {
        x1 = Math.abs(x1 - 250)
        x2 = Math.abs(x2 - 250)
        y1 = Math.abs(y1 - 250)
        y2 = Math.abs(y2 - 250)
        let difX = Math.abs(x1-x2)
        let difY = Math.abs(y1-y2)
        let dist = Math.sqrt(difX ** 2 + difY ** 2)
        return dist
    }

function animate() {
    if(!context.value) return
    let ctx = context.value
    ctx.clearRect(0, 0, SCENE_SIZE.x, SCENE_SIZE.y);
    ctx.fillRect(0, 0, SCENE_SIZE.x, SCENE_SIZE.y)
    if(props.ui) {
        ctx.fillStyle = COLOR.secondary
        ctx.fillText("SCORE : " + Math.floor(HIGHSCORE.value), 20, 35)
        if(props.ai){
            ctx.fillText("Generation : " + GENERATION.value.toString(), 20, 55)
            ctx.fillText("Population : " + GAMES.size.toString(), 20, 75)
        }
        ctx.fillStyle = COLOR.primary
    }
    // functions
    GAMES.forEach(game => {
        game.Drawlives()
        game.ship.controls()
        if(game.ship.brain&&props.ai) game.ship.think()
        if(game.ship.alive) game.ship.move()
        game.bullets.forEach(bullet => bullet.move())
        game.asteroids.forEach(asteroid => asteroid.move())
        game.Collision()
    })
    // draw bog
    if(props.onlyBog&&BOG.value) {
        let game = BOG.value
        game.Drawlives()
        if(game.ship.alive) game.ship.draw()
        game.bullets.forEach(bullet => bullet.draw())
        game.asteroids.forEach(asteroid => asteroid.draw())
    } else { // draw all
        GAMES.forEach(game => {
            game.Drawlives()
            if(game.ship.alive) game.ship.draw()
            game.bullets.forEach(bullet => bullet.draw())
            game.asteroids.forEach(asteroid => asteroid.draw())
        })
    }
}

function init() {
    GAMES.clear()
    if(!props.ai) {
        for(let i = 0; i < props.instances; i++)
        GAMES.add(new GAME())
    } else if(props.ai) {
        emit('genupdate',GENERATION.value)
        emit('scoreupdate',HIGHSCORE.value)
        let brain:NeuralNetwork = new NeuralNetwork(13,26,4)
        if(SAVED_GAMES.size>0) {
            let sortgames = Array.from(SAVED_GAMES).sort((a,b) => b.score-a.score)
            sortgames.filter((val) => {if(val.ship.brain) return true})
            if(!BESTBRAIN?.brain||BESTBRAIN?.score<sortgames[0].score) {
                BESTBRAIN = {
                    // @ts-ignore
                    brain: sortgames[0].ship.brain,
                    score: sortgames[0].score
                }
                
            }
            // @ts-ignore
            if(!sortgames[1]) brain = sortgames[0].ship.brain.clone()
            // @ts-ignore
            else brain = sortgames[0].ship.brain?.crossover(sortgames[1].ship.brain?.clone())
            // else if(BESTBRAIN.brain===sortgames[0].ship.brain) brain = BESTBRAIN.brain.crossover(sortgames[1].ship.brain.clone())
            // @ts-ignore
            // else brain = BESTBRAIN.brain.crossover(sortgames[0].ship.brain.clone())
            for(let i = 0; i < props.instances; i++) {
                if(i===0 && props.instances > 2) GAMES.add(new GAME(BESTBRAIN?.brain as NeuralNetwork||brain))
                else GAMES.add(new GAME(brain.mutate(0.2)))
            }
        } else {
            for(let i = 0; i < props.instances; i++) GAMES.add(new GAME(new NeuralNetwork(13,26,4)))
        }
        GENERATION.value++
        // HIGHSCORE.value = 0
    }
}

onMounted(() => {
    if(!scene.value) return console.log('no canvas found')
    const canvas = scene.value
    context.value = canvas.getContext('2d', {alpha:false})
    if(context.value) {
        let ctx = context.value
        canvas.width = SCENE_SIZE.x
        canvas.height = SCENE_SIZE.y
        ctx.fillStyle = COLOR.primary
        ctx.strokeStyle = COLOR.secondary
        ctx.font = '21px Arial'
    }
    init()
})
    onMounted(() => {
        document.body.addEventListener('keydown', keyHandler)
        document.body.addEventListener('keyup', keyHandler)
    })
    onBeforeUnmount(() => {
        document.body.removeEventListener('keydown', keyHandler)
        document.body.removeEventListener('keyup', keyHandler)

    })
    function keyHandler(e:KeyboardEvent){
        if(props.ai) return
        GAMES.forEach(game => {
            if(e.code === 'ArrowDown' && e.type === 'keydown') game.ship.shoot()
            if(e.code==='ArrowUp'||e.code==='ArrowLeft'||e.code==='ArrowRight') game.ship.keyState[e.code] = e.type === 'keydown'
        })
     }
     function handleClick(e:MouseEvent){
        GAMES.forEach(game =>  {
            game.asteroids.add(new ASTEROID(1, game, e.clientX, e.clientY))
        })
     }
useAnimationFrame(animate, fpsInterval.value)



</script>