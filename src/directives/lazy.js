const images = []

document.addEventListener('scroll', () => {
    for (const image of images) {
        checkEl(image.el, image.binding)
    }
})

function isInViewport (element) {
    const rect = element.getBoundingClientRect()
    const html = document.documentElement
    return (
        rect.top >= 0 &&
    (window.innerHeight || html.clientHeight) - rect.top >= 0
    )
}

function checkEl (el, binding) {
    if (isInViewport(el)) {
        const image = new Image()
        image.src = binding.value
        image.onload = () => {
            el.src = image.src
        }
    }
}

export default {
    bind (el, binding) {
        images.push({ el, binding })
    },
    inserted (el, binding) {
        checkEl(el, binding)
    }
}
