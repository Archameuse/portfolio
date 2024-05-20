<template>
  <main class="h-[400rem] w-full relative select-none">
    <section class="transition-all ease-out overflow-hidden w-full h-screen sticky top-0 left-0 flex flex-col items-center font-['Kelly_Slab'] text-white">
      <img :style="`object-position: 0 -${bgScroll}px;background-position-y: -${bgScroll}px;`" src="public/image.png" class="absolute top-0 left-0 -z-10 w-full h-full min-w-[140rem] pointer-events-none object-cover">
      <MainHeader />
      <div class="w-full h-full flex flex-col justify-end smH:justify-center items-center">
        <div class="wrapper w-full relative flex flex-col justify-evenly items-center h-[min(200vh/3,24rem)] text-center bg-black bg-opacity-50">
          <div class="landing">
            <h1 class="name text-7xl lg:text-9xl shadow-gray-50 text-white [text-shadow:_0_2px_8px_white]">{{ $t('name') }}</h1>
            <h2 id="descr" class="name text-5xl lg:text-6xl text-white after:content-['|'] after:animate-blink"></h2>
          </div>
          <div ref="circle" class="circle rounded-[100%] h-full aspect-square bg-white absolute opacity-20 overflow-hidden">
            <span class="absolute top-0 left-0 w-full text-center pt-2 opacity-0 asteroidstext">
              Generation: {{ asteroidsGen }} <br/>
              Highscore: {{ asteroidsScore }}
            </span>
            <Asteroids :fps="80" ai :instances="5" :timetolive="5"  @genupdate="(val) => asteroidsGen=val" @scoreupdate="(val) => asteroidsScore=val"/>
          </div>
          <div class="aboutme absolute left-0 top-0 w-full h-full flex flex-col item-center justify-center gap-8 opacity-0">
            <div class="absolute top-0 left-0 bg-[url('public/aboutmebg2.jpg')] bg-center bg-cover bg-no-repeat w-full h-full brightness-75 blur-sm"></div>
              <div class="absolute z-20 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] aspect-square pause">
                <div class="w-full h-full border-2 border-opacity-20 smH:border-opacity-90 border-dashed border-white rounded-full overflow-hidden animate-rotate"></div>
                <div @mouseleave="descrleave" ref="skills" class="absolute rounded-full top-0 left-0 w-full h-full bg-black text-center transition-opacity duration-300" style="pointer-events: none; opacity: 0;">
                    <Skills />
                </div>
              </div>
              <div id="textwrapper" class="absolute z-0 left-0 top-0 w-full h-full flex flex-col text-center py-8 px-2 items-center overflow-hidden">
                <h1 class="text-7xl border-b-4 border-dotted textglow">{{ $t('hello') }}</h1>
                <div class="h-full flex flex-col justify-center">
                  <h2 class="text-sm smmH:text-lg mdH:text-2xl mt-2 mdH:mt-8">{{ $t('descr1') }}</h2>
                  <h2 class="text-sm smmH:text-lg  mdH:text-2xl">{{ $t('descr2') }}</h2>
                  <h2 class="text-sm smmH:text-lg  mdH:text-2xl">{{ $t('descr3') }}</h2>
                  <h2 class="text-sm smmH:text-lg  mdH:text-2xl underline w-fit mx-auto" @mouseenter="descrhover">{{ $t('descr4') }}</h2>
                </div>
              </div> 
          </div>
          <div class="projects absolute top-0 left-0 w-full h-full grid grid-rows-3 [&>div]:rounded-xl [&>div]:shadow-md [&>div]:overflow-hidden [&>div]:relative [&>div]:h-full [&>div]:w-full gap-0 opacity-0">
            <div class="group">
              <img draggable="false" class="absolute left-0 top-0 w-full h-full object-cover" src="public/tweeter.webp">
              <a href="https://tweeterlast.vercel.app" class="project group-hover:opacity-100 group-hover:animate-animevents cursor-pointer transition-opacity opacity-0 pointer-events-none absolute top-0 left-0 bg-black bg-opacity-50 w-full h-full p-2 hidescroll">
                {{ $t('project1') }}
              </a>
            </div>
            <div class="group">
              <img draggable="false" class="absolute left-0 top-0 w-full h-full object-cover" src="public/mf.png">
              <a href="https://magicfootballsite.vercel.app" class="project group-hover:opacity-100 group-hover:animate-animevents cursor-pointer transition-opacity opacity-0 pointer-events-none absolute top-0 left-0 bg-black bg-opacity-50 w-full h-full p-2 hidescroll">
                {{ $t('project2') }}
              </a>
            </div>
            <div class="bg-black text-nowrap">
              <div @click="scrollContacts" class="absolute left-0 top-0 bg-opacity-80 w-full h-full overflow-hidden flex flex-col justify-center items-start xsm:px-4 after:content-['</div>'] moretogether mdH:md:text-xl mdH:lg:text-2xl cursor-pointer">
                <span class="pl-4 xsm:pl-8 ">{{ $t('moretogether') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <MainFooter />
  </main>
</template>

<script setup lang="ts">
const {t} = useI18n()
useHead({
  title: computed(() => t('name'))
})


  const SCROLL_END = 4500
  const asteroidsGen = ref<number>(0)
  const asteroidsScore = ref<number>(0)
  const bgScroll = ref<number>(0)
  const skills = ref<HTMLElement>()
  const circle=ref<HTMLElement>()

  const scrollContacts = () => {window.scrollTo(0,99999)}
  const scroll = (e:Event) => {
    bgScroll.value = Math.floor(window.scrollY/4)
    document.documentElement.style.setProperty('--scroll', String(Math.min(window.scrollY/SCROLL_END,1)))
  }

  const descrhover = () => {
    if(!skills.value) return
    skills.value.style.pointerEvents = 'all'
    skills.value.style.opacity = '100%'
  }
  const descrleave = () => {
    if(!skills.value) return
    skills.value.style.pointerEvents = 'none'
    skills.value.style.opacity = '0'
  }

  onMounted(() => {
    window.addEventListener('scroll', scroll)
    window.scrollBy(0,1)
    window.scrollBy(0,-1)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('scroll',scroll)
  })
</script>

<style >
body::after{
   position:absolute; width:0; height:0; overflow:hidden; z-index:-1; 
   content:url('public/aboutmebg.jpg') url('public/aboutmebg2.jpg');   
}
:root {
  --scroll:0;
  scroll-behavior: smooth;
}
.hidescroll::-webkit-scrollbar {
    display: none;
}

.hidescroll {
    overflow-y: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.wrapper {
  animation: main 1s linear calc(var(--scroll)*-1s) 1 both paused;
}

.circle {
  animation: circle 1s linear calc(var(--scroll)*-1s) 1 both paused;
}
.asteroidstext {
  animation: asteroids 1s linear calc(var(--scroll)*-1s) 1 both paused;
}
.landing {
  animation: landing 1s linear calc(var(--scroll)*-1s) 1 both paused;
}
.aboutme {
  animation: aboutme 1s linear calc(var(--scroll)*-1s) 1 both paused;
}
.projects {
  animation: projects 1s linear calc(var(--scroll)*-1s) 1 both paused;
}
.project {
  animation: project 1s linear calc(var(--scroll)*-1s) 1 both paused;
}

#descr:before {
  content: 'Full Stack Web Dev';
  animation: type 3s linear 1s;
  animation-fill-mode: forwards;
}
.pause:hover div {
  border: none;
}
.moretogether  {
  --text: 'bg-green-200';
  text-shadow: 0 0 3px black;
  animation: type2 10s linear 1s infinite;
  animation-fill-mode: forwards;
  background-color: rgb(187 247 208 / 0.8);
}
.moretogether::before {
  content: '<div class="' '' var(--text) '' '">';
}

@keyframes main {
  20%,40% {
    height: calc(200vh/3);
    width: calc(200vh/3);
  }
  60%,80% {
    height: calc(200vh/3);
    width: min(calc(150vh/3),100vw);
    background-color: rgba(0, 0, 0, 0.5);
  }
  90% {background-color:transparent;}
  100% {
    height: calc(300vh/4);
    width: min(calc(300vh/4),100vw);
    background-color: transparent;
  }
}

@keyframes circle {
  20%,40% {
    border-radius: 0%;
    opacity:100%;
  }
  60%,100%{opacity:0;border-radius: 0%;width: 100%;}
}

@keyframes asteroids {
  15%,40% {
    opacity:100%
  }
  60%,100%{opacity: 0%}
}
@keyframes landing {
  20%,100% {
    pointer-events: none;
    opacity:0%;
  }
}
@keyframes aboutme {
  40%,90%,100%{opacity:0%;display: none;}
  60%,80% {opacity:100%;display: block;}
}
@keyframes projects {
  0%,80%{display: none;}
  80%{opacity:0%;}
  90% {opacity:100%;gap: 0;}
  100% {opacity:100%; gap:1rem;}
}
@keyframes project {
  0%,80%{pointer-events: none !important;}
}

@keyframes type {
  8%{content: 'Full Stack Web Dev'}
  14%{content: 'Full Stack Web Deve'}
  22%{content: 'Full Stack Web Devel'}
  25%{content: 'Full Stack Web Develp'}
  30%{content: 'Full Stack Web Develpo'}
  33%{content: 'Full Stack Web Develpoe'}
  52%{content: 'Full Stack Web Develpo'}
  60%{content: 'Full Stack Web Develp'}
  67%{content: 'Full Stack Web Devel'}
  74%{content: 'Full Stack Web Develo'}
  84%{content: 'Full Stack Web Develop'}
  92%{content: 'Full Stack Web Develope'}
  100%{content: 'Full Stack Web Developer'}
}

@keyframes type2 {
  0%{--text:'bg-green-200';}
  2%{--text:'bg-green-20';}
  3%{--text:'bg-green-2';}
  4.5%{--text:'bg-green-';}
  5.5%{--text:'bg-green';}
  7%{--text:'bg-gree';}
  9%{--text:'bg-gre';}
  10%{--text:'bg-gr';}
  11%{--text:'bg-g';}
  13%{--text:'bg-';}
  14.5%{--text:'bg-r';}
  16%{--text:'bg-re';}
  17%{--text:'bg-red';}
  18.5%{--text:'bg-red-';}
  20%{--text:'bg-red-2';}
  21%{--text:'bg-red-20';}
  22%{--text:'bg-red-200';background-color: rgb(187 247 208 / 0.8)}
  24%{background-color: rgb(254 202 202 / 0.8)}
  32%{--text:'bg-red-20';}
  33%{--text:'bg-red-2';}
  34%{--text:'bg-red-';}
  34.5%{--text:'bg-red';}
  36%{--text:'bg-re';}
  38%{--text:'bg-r';}
  40%{--text:'bg-';}
  41%{--text:'bg-b';}
  42%{--text:'bg-bl';}
  44%{--text:'bg-blu';}
  46%{--text:'bg-blue';}
  47%{--text:'bg-blue-';}
  49%{--text:'bg-blue-2';}
  50.5%{--text:'bg-blue-20';}
  52%{--text:'bg-blue-200';background-color: rgb(254 202 202 / 0.8)}
  54%{background-color: rgb(191 219 254 / 0.8)}
  60%{--text:'bg-blue-20';}
  63%{--text:'bg-blue-2';}
  64%{--text:'bg-blue-';}
  66%{--text:'bg-blue';}
  69%{--text:'bg-blu';}
  71%{--text:'bg-bl';}
  73%{--text:'bg-b';}
  74%{--text:'bg-';}
  75%{--text:'bg-g';}
  77%{--text:'bg-gr';}
  79%{--text:'bg-gre';}
  80.5%{--text:'bg-gree';}
  82.5%{--text:'bg-green';}
  84%{--text:'bg-green-';}
  86%{--text:'bg-green-2';}
  88%{--text:'bg-green-20';}
  89%{--text:'bg-green-200';background-color: rgb(191 219 254 / 0.8)}
  91%{background-color: rgb(187 247 208 / 0.8)}
  100%{--text:'bg-green-200';}
}

</style>