import { ref, watch } from 'vue'

class Setting {
  constructor(name, type, defaultValue, autoSave = true) {
    this.name = name
    this.type = type
    this.defaultValue = defaultValue
    this.ref = ref()

    this.load()
    if (autoSave) {
      watch(this.ref, () => this.save())
    }
  }

  load() {
    const value = localStorage.getItem(this.name)
    switch (this.type) {
      case Boolean:
        this.ref.value = value === 'true'
        break
      case Object:
        this.ref.value = JSON.parse(value || this.defaultValue)
        break
      case Number:
        this.ref.value = Number(value || this.defaultValue)
        break
      default:
        this.ref.value = value || this.defaultValue
    }
  }

  save() {
    switch (this.type) {
      case Object:
        localStorage.setItem(this.name, JSON.stringify(this.ref.value))
        break
      default:
        localStorage.setItem(this.name, this.ref.value)
    }
  }
}

export const hideFullVin = new Setting('hideFullVin', Boolean, false).ref