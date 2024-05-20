<template>
    <nav class="flex flex-col md:flex-row-reverse md:px-8 text-xl md:text-2xl lg:text-4xl text-center  justify-between  w-full 2xl:w-2/3 items-center pt-2 md:pt-8 gap-2 text-black">
        <ul class="flex gap-4">
            <IconFlagUK class="h-12 w-12" :class="i18n.locale.value==='en' ? 'saturate-[90%]' : 'saturate-[10%]'" @click="i18n.setLocale('en')"/>
            <IconFlagUkraine class="h-12 w-12" :class="i18n.locale.value==='ua' ? 'saturate-[90%]' : 'saturate-[10%]'" @click="i18n.setLocale('ua')"/>
            <IconFlagRussia class="h-12 w-12" :class="i18n.locale.value==='ru' ? 'saturate-[90%]' : 'saturate-[10%]'" @click="i18n.setLocale('ru')"/>
        </ul>
        <ul class="flex border-b-2 border-black w-full justify-evenly md:max-w-md lg:max-w-2xl ">
            <li @click="aboutme" class="active:scale-90 transition-all">{{ $t('navbar1') }}</li>
            <li @click="projects" class="active:scale-90 transition-all">{{ $t('navbar2') }}</li>
            <li @click="contacts" class="active:scale-90 transition-all">{{ $t('navbar3') }}</li>
        </ul>
    </nav>
</template>

<script setup lang="ts">
const i18n = useI18n()
const lang = i18n.locale
const computePosition = computed(() => {
    return 'left:'+(lang.value==='en' ? '0' : lang.value==='ru' ? '33.333333%' : '66.666666%')
})
function kek() {
    i18n.setLocale(i18n.locale.value==='en' ? 'ru' : 'en')
}

const aboutme = () => {
    window.scrollTo(0,3200)
}
const projects = () => {
    window.scrollTo(0,4800)
}
const contacts = () => {
    window.scrollTo(0,99999)
}
</script>

<style>
ul * {
    cursor: pointer;
}

</style>