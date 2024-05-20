<template>
    <div class="w-full h-80 absolute bottom-0 left-0 bg-slate-700 flex flex-col items-center justify-start gap-4 text-white font-['Kelly_Slab'] pt-8 text-center">
        <h1 class="text-4xl">{{$t('contactme')}}</h1>
        <div class="flex flex-wrap items-center justify-center gap-4 [&>a]:aspect-square [&>a]:rounded-full [&>a]:w-12 [&>a]:border [&>a]:border-white [&>a]:flex [&>a]:items-center [&>a]:justify-center [&>a]:p-2 [&>a]:cursor-pointer">
            <!-- <a href="https://www.linkedin.com/in/mihail-divulin">
                <IconLinkedin class="w-full h-full"/>
            </a> -->
            <a href="https://github.com/Archameuse">
                <IconGithub class="w-full h-full"/>
            </a>
            <a href="https://t.me/Archameus">
                <IconTg class="w-full h-full"/>
            </a>
            <a @click="typeWriter('divulinm@gmail.com')">
                <IconMail class="w-full h-full"/>
            </a>
            <a @click="typeWriter('archameus')">
                <IconDiscord class="w-full h-full"/>
            </a>
        </div>
        <h1 ref="textbox" class="select-text p-4 [word-break:break-word] text-2xl sm:text-4xl"></h1>
    </div>
</template>

<script setup lang="ts">
const textbox = ref<HTMLElement>()
const timeout = ref<NodeJS.Timeout>()

const typeWriter = async (text:string) => {
    if(!textbox.value) return
    if(timeout.value) clearTimeout(timeout.value)
    textbox.value.innerText = ''
    for(let char of text) {
        await new Promise(resolve => {
            timeout.value = setTimeout(resolve,Math.floor(Math.random()*120)+30)
        })
        textbox.value.innerText+=char
    }
}
</script>
