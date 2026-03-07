<template>
  <button
    class="chat-item"
    :class="{ active: isActive }"
    @click="$emit('select')"
  >
    <ChatAvatar :chat="chat" :size="44" />

    <div class="item-body">
      <div class="item-top">
        <span class="item-name">{{ chat.name }}</span>
        <span class="item-time">{{ chat.lastTime }}</span>
      </div>
      <div class="item-bottom">
        <span class="item-preview">{{ chat.lastMessage }}</span>
        <span v-if="chat.unread > 0" class="unread-badge">{{ chat.unread }}</span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { Chat } from '../../composables/useChats'
import ChatAvatar from './ChatAvatar.vue'
defineProps<{ chat: Chat; isActive: boolean }>()
defineEmits(['select'])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

.chat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  width: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  transition: background 0.15s;
  font-family: 'DM Sans', sans-serif;
  text-align: left;
}
.chat-item:hover { background: rgba(32,45,89,0.05); }
.chat-item.active { background: rgba(32,45,89,0.09); }

.item-body { flex: 1; min-width: 0; }
.item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}
.item-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1c1e21;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-time {
  font-size: 0.7rem;
  color: #b0b3b8;
  flex-shrink: 0;
}
.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}
.item-preview {
  font-size: 0.8rem;
  color: #65676b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.unread-badge {
  flex-shrink: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: linear-gradient(135deg, #202d59, #a31e22);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
}
</style>