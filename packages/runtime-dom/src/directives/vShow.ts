import { ComponentInternalInstance, ObjectDirective } from '@vue/runtime-core'

export const vShowOldKey = Symbol('_vod')

interface VShowElement extends HTMLElement {
  // _vod = vue original display
  [vShowOldKey]: string
}

export const vShow: ObjectDirective<VShowElement> = {
  beforeMount(el, { value }, { transition }) {
    el[vShowOldKey] = el.style.display === 'none' ? '' : el.style.display
    if (transition && value) {
      transition.beforeEnter(el)
    } else {
      setDisplay(el, value)
    }
  },
  mounted(el, { value, component }, { transition }) {
    if (transition && value) {
      transition.enter(el)
    }
    if (!value && component) {
      component.effect.pause()
    }
  },
  updated(el, { value, oldValue, component }, { transition }) {
    if (!value === !oldValue) return
    if (transition) {
      if (value) {
        transition.beforeEnter(el)
        setDisplay(el, true, component)
        transition.enter(el)
      } else {
        transition.leave(el, () => {
          setDisplay(el, false, component)
        })
      }
    } else {
      setDisplay(el, value, component)
    }
  },
  beforeUnmount(el, { value, component }) {
    setDisplay(el, value, component)
  }
}

function setDisplay(
  el: VShowElement,
  value: unknown,
  component: ComponentInternalInstance | null = null
): void {
  el.style.display = value ? el[vShowOldKey] : 'none'
  if (component) {
    if (!value) {
      component.effect.pause()
    } else {
      component.effect.resume(true)
    }
  }
}

// SSR vnode transforms, only used when user includes client-oriented render
// function in SSR
export function initVShowForSSR() {
  vShow.getSSRProps = ({ value }) => {
    if (!value) {
      return { style: { display: 'none' } }
    }
  }
}
