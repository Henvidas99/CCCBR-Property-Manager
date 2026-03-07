<template>
  <div class="chat-avatar-wrap" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- Group icon -->
    <div v-if="chat.type === 'group'" class="group-icon" :style="{ background: chat.avatarColor }">
      <svg xmlns="http://www.w3.org/2000/svg" :width="size * 0.45" :height="size * 0.45" fill="none" viewBox="0 0 24 24" stroke="white">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
    <!-- Direct avatar -->
    <div v-else class="avatar-ring-wrap">
      <img :src="chat.avatar" :alt="chat.name" class="avatar-img" />
    </div>
    <!-- Online dot -->
    <span v-if="chat.online && chat.type === 'direct'" class="online-dot" />
  </div>
</template>

<script setup lang="ts">
import type { Chat } from '../../composables/useChats'
withDefaults(defineProps<{ chat: Chat; size?: number }>(), { size: 42 })
</script>

<style scoped>
.chat-avatar-wrap { position: relative; flex-shrink: 0; }
.group-icon {
  width: 100%; height: 100%;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
}
.avatar-ring-wrap {
  width: 100%; height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #202d59, #a31e22);
  padding: 2px;
}
.avatar-img {
  width: 100%; height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  display: block;
}
.online-dot {
  position: absolute;
  bottom: 1px; right: 1px;
  width: 10px; height: 10px;
  background: #22c55e;
  border-radius: 50%;
  border: 2px solid #fff;
}
</style>