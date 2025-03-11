<template>
  <div class="nav-item" :class="{ active: active }" @click="$emit('click')">
    <a-icon :type="item.icon" :style="{ fontSize: '24px' }" />
    <span class="label">{{ item.name }}</span>
  </div>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.nav-item.active {
  color: #1890ff;
}

.label {
  font-size: 12px;
  margin-top: 4px;
}
</style>