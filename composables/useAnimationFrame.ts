export default (nextAnimationFrameHandler:Function, interval?:number) => {
    const frame = ref<number>(0)
    const startTime = ref<number>()
    const thenTime = ref<number>()
    function animate() {
        frame.value = requestAnimationFrame(animate)
        let now = Date.now()
        let elapsed = now - (thenTime.value||0)
        if(!interval||elapsed > interval) {
            if(interval) thenTime.value = now-(elapsed%interval)
            nextAnimationFrameHandler()
        }
    }
    onMounted(() => {
        thenTime.value = Date.now()
        startTime.value = thenTime.value
        animate()
    })
    onBeforeUnmount(() => {
        cancelAnimationFrame(frame.value)
    })

}