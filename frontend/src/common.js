// Clear all the elements on current page and ready for render a new page
export function clearPage() {
    const container = document.getElementById("container")
    if (container != null) {
        container.remove()
    }
}

export function template(id) {
    const template = document.getElementById(id)
    return template.content.cloneNode(true)
}

export function invalid(input) {
    input.classList.remove("is-valid")
    input.classList.add("is-invalid")
}

export function valid(input) {
    input.classList.remove("is-invalid")
    input.classList.add("is-valid")
}