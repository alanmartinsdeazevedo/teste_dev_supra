<template>
  <div class="color-picker">
    <div class="swatch-wrap">
      <div class="swatch" :style="{ background: modelValue }" />
      <input
        ref="inputRef"
        type="color"
        :value="modelValue"
        class="color-native"
        @input="onNative"
      />
    </div>
    <input
      type="text"
      class="hex-input"
      :value="modelValue"
      maxlength="7"
      spellcheck="false"
      @input="onHex"
      @blur="onBlur"
    />
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const isValidHex = (v: string) => /^#[0-9A-Fa-f]{6}$/.test(v)

const onNative = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

const onHex = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  if (isValidHex(val)) emit('update:modelValue', val)
}

const onBlur = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  if (!isValidHex(val)) (e.target as HTMLInputElement).value = props.modelValue
}
</script>

<style scoped>
.color-picker {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 4px 8px 4px 4px;
  background: var(--surface);
  cursor: text;
  transition: border-color 0.15s;
}

.color-picker:focus-within {
  border-color: var(--secondary);
}

.swatch-wrap {
  position: relative;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.swatch {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: border-color 0.15s;
}

.swatch:hover {
  border-color: var(--border-hover);
}

.color-native {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
}

.hex-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  font-family: var(--mono);
  color: var(--text);
  width: 60px;
  padding: 0;
}
</style>
