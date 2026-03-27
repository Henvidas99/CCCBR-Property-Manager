<template>
  <div class="chat-avatar-wrap" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- Group -->
    <div v-if="chat.type === 'group'" class="group-icon" :style="{ background: groupColor }">
      <img v-if="chat.avatarUrl" :src="chat.avatarUrl" :alt="chat.name ?? ''" class="group-img" />
      <svg v-else xmlns="http://www.w3.org/2000/svg" :width="size * 0.45" :height="size * 0.45" fill="none"
        viewBox="0 0 24 24" stroke="white">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>

    <!-- Direct -->
    <div v-else class="avatar-ring-wrap">
      <img v-if="otherMemberPhoto" :src="otherMemberPhoto" :alt="chat.name ?? ''" class="avatar-img" />
      <div v-else class="avatar-initials" :style="{ fontSize: size * 0.35 + 'px' }">
        {{ initials }}
      </div>
    </div>

    <!-- Online dot -->
    <span v-if="showOnlineDot" class="online-dot" title="En línea" />
    <span v-else-if="otherMember?.user.lastSeenAt && chat.type === 'direct'" class="last-seen-label"
      :title="formatLastSeenAt(otherMember.user.lastSeenAt)">
      {{ formatLastSeenAt(otherMember.user.lastSeenAt) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { Chat } from '~/composables/useChats'
import { useChats } from '~/composables/useChats'
import { useUser } from '~/composables/useUser'
import { formatLastSeenAt } from '~/helpers/global.helpers';

const props = withDefaults(defineProps<{ chat: Chat; size?: number }>(), { size: 42 })
const { isOnline } = useChats()
const { user } = useUser()

// Color del grupo basado en el nombre (consistente)
const groupColor = computed(() => {
  const colors = ['#202d59', '#a31e22', '#1e5f74', '#2d6a4f', '#6a2d8f', '#8f4e2d']
  const name = props.chat.name ?? ''
  const idx = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length
  return colors[idx]
})

// Para chats directos, obtener la foto del otro usuario
const otherMember = computed(() => {
  if (props.chat.type !== 'direct') return null
  return props.chat.members?.find(m => m.userId !== user.value?.id) ?? null
})

const otherMemberPhoto = computed(() => otherMember.value?.user?.photo || null)

const initials = computed(() => {
  const name = props.chat.name ?? otherMember.value?.user?.fullName ?? '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
})

const showOnlineDot = computed(() => {
  if (props.chat.type !== 'direct') return false
  const otherId = otherMember.value?.userId
  return otherId ? isOnline(otherId) : false
})

</script>

<style scoped>
.chat-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.group-icon {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.group-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-ring-wrap {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #202d59, #a31e22);
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  display: block;
}

.avatar-initials {
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  border-radius: 50%;
  background: #e8eaf0;
  color: #202d59;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Syne', sans-serif;
  border: 2px solid #fff;
}

.online-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 10px;
  height: 10px;
  background: #22c55e;
  border-radius: 50%;
  border: 2px solid #fff;
}

.last-seen-label {
  position: absolute;
  bottom: -14px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.6rem;
  font-weight: 500;
  color: #b0b3b8;
  white-space: nowrap;
  pointer-events: none;
}
</style>