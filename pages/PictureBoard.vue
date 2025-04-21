<template>
    <div class="w-full h-full flex flex-col items-center bg-gray-100">
      <div class="fixed top-0 left-0 right-0 z-50 flex items-center px-4 py-2 bg-gray-100 w-full">
        <Button
          @click="goBack"
          variant="text"
          icon="pi pi-arrow-left"
          severity="secondary"
          rounded
          class="absolute left-0 px-4 py-2 hover:!bg-transparent"
        >
            <i class="material-icons !text-3xl text-black">arrow_back_ios_new
            </i>
        </Button>
        <h1 class="text-3xl mx-auto text-black font-black">photo</h1>
      </div>
  
      <div v-if="loading" class="mt-10 text-lg text-gray-600">載入中...</div>
  
      <div class="grid grid-cols-5 gap-2 p-4 w-full mt-[2.5%]" v-else>
        <div v-for="(photo, index) in photos" :key="index" class="relative">
          <img
            :src="photo"
            class="w-full h-auto rounded-lg shadow-md"
            @error="onImageError(photo)"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from '#app'
  import Button from 'primevue/button'
  
  const photos = ref<string[]>([])
  const loading = ref(true)
  const router = useRouter()
  
  const goBack = () => {
    router.push('/')
  }
  
  const onImageError = (url: string) => {
    console.warn('⚠️ 無法載入圖片：', url)
  }
  
  onMounted(async () => {
    try {
      const res = await fetch('https://upload-worker.5316eictlws-2.workers.dev/api/list')
      const data = await res.json()
      photos.value = data.files
      console.log('✅ 圖片清單：', data.files)
    } catch (error) {
      console.error('❌ 讀取圖片清單失敗', error)
    } finally {
      loading.value = false
    }
  })
  </script>
  