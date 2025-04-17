<template>
  <div class="relative w-screen h-screen flex flex-col items-center justify-center">
    <!-- 全螢幕按鈕 -->
    <div v-if="!isFullScreen" class="absolute top-4 left-4 z-10 hover:!bg-transparent">
      <Button @click="requestFullScreen" variant="text" severity="secondary" rounded class="hover:!bg-transparent">
        <i class="material-icons !text-5xl text-white">fullscreen</i>
      </Button>
    </div>

    <!-- 鏡頭畫面 -->
    <div class="absolute inset-0 flex items-center justify-center overflow-hidden">
      <video
        ref="video"
        class="w-full h-full object-cover transform scale-x-[-1] bg-black"
        autoplay
        playsinline
        muted
      ></video>
    </div>

    <canvas ref="canvas" class="hidden"></canvas>

    <!-- 拍照預覽 -->
    <div
      v-if="previewUrl"
      class="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-20"
    >
      <img :src="previewUrl" alt="preview" class="h-[90%] rounded shadow-lg" />
      <div class="mt-4 flex gap-4 w-1/3 justify-between">
        <Button variant="text" severity="danger" @click="closePreview" rounded>
          <i class="material-icons !text-5xl">cancel</i>
        </Button>
        <Button variant="text" severity="success" @click="confirmPrint" rounded>
          <i class="material-icons !text-5xl">check_circle</i>
        </Button>
      </div>
    </div>

    <!-- To[...] 文字輸入 -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="inline-flex items-center text-white text-6xl font-bold">
        <span>TO[</span>
        <input
          type="text"
          v-model="content"
          class="bg-transparent border-none focus:outline-none text-white font-bold text-6xl text-center p-0 m-0 w-auto min-w-[2ch] tracking-normal"
          @input="adjustWidth"
          ref="inputEl"
        />
        <span>]</span>
      </div>
    </div>

    <!-- 相簿與快門 -->
    <div class="absolute top-4 right-4 z-10 flex gap-2">
      <Button @click="goToGallery" variant="text" severity="secondary" rounded class="hover:!bg-transparent">
        <i class="material-icons !text-3xl text-white">dehaze</i>
      </Button>
    </div>

    <div class="absolute bottom-4 mid z-10 flex gap-2">
      <Button
        variant="text"
        severity="secondary"
        rounded
        @click="capturePhoto"
        :disabled="isUploading"
        class="shadow hover:!bg-transparent"
      >
        <i class="material-icons !text-5xl text-white">radio_button_checked</i>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from '#app'
import { useToast } from 'primevue/usetoast'

const video = ref<HTMLVideoElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const content = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const router = useRouter()
const toast = useToast()

const isUploading = ref(false)
const isCameraReady = ref(false)
const isFullScreen = ref(false)

onMounted(() => {
  document.addEventListener('fullscreenchange', checkFullScreen)
  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    })
    .then((stream) => {
      if (video.value) {
        video.value.srcObject = stream
        video.value.addEventListener('loadedmetadata', () => {
          isCameraReady.value = true
        })
      }
    })
    .catch((err) => {
      console.error('❌ 無法啟動攝影機:', err)
      toast.add({ severity: 'error', summary: '錯誤', detail: '無法啟動攝影機', life: 3000 })
    })
  adjustWidth()
})

const checkFullScreen = () => {
  const doc = document as any
  isFullScreen.value = !!(
    document.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  )
}

const requestFullScreen = () => {
  const el = document.documentElement as any
  el.requestFullscreen?.() ||
    el.webkitRequestFullscreen?.() ||
    el.mozRequestFullScreen?.() ||
    el.msRequestFullscreen?.()
}

const adjustWidth = () => {
  nextTick(() => {
    if (!inputEl.value) return
    content.value = content.value.replace(/[^A-Z]/gi, '').toUpperCase()
    inputEl.value.style.width = '1ch'
    inputEl.value.style.width = `${inputEl.value.scrollWidth + 10}px`
  })
}

const capturePhoto = async () => {
  if (!isCameraReady.value || isUploading.value || !video.value || !canvas.value) return
  isUploading.value = true
  let imageUrl = ''
  try {
    await document.fonts.ready
    const ctx = canvas.value.getContext('2d')
    if (!ctx) throw new Error('無法取得 canvas context')
    const width = video.value.videoWidth
    const height = video.value.videoHeight
    if (width === 0 || height === 0) throw new Error('攝影機尚未準備好')
    canvas.value.width = width
    canvas.value.height = height
    ctx.save()
    ctx.translate(width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video.value, 0, 0, width, height)
    ctx.restore()
    console.log(ctx.font)
    ctx.font = '66px "Lexend", sans-serif'
    console.log(ctx.font)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`To[${content.value}]`, width / 2, height / 2)
    document.fonts.check('66px Lexend') 
    imageUrl = canvas.value.toDataURL('image/png', 1)
    previewUrl.value = imageUrl
  } catch (err) {
    console.error(err)
    toast.add({ severity: 'error', summary: '拍照錯誤', detail: `${err}`, life: 3000 })
    isUploading.value = false
    return
  }

  toast.add({ severity: 'info', summary: '圖片上傳中', detail: '請稍候…', life: 0, group: 'uploading' })

  try {
    const res = await fetch('https://upload-worker.5316eictlws-2.workers.dev/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageUrl }),
    })
    const data = await res.json()
    console.log('✅ 上傳成功', data)
    await toast.removeGroup('uploading')
    toast.add({ severity: 'success', summary: '上傳成功', detail: '圖片已成功上傳', life: 3000 })
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `captured_${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err: any) {
    await toast.removeGroup('uploading')
    toast.add({ severity: 'error', summary: '上傳失敗', detail: err?.message || '請稍後再試', life: 3000 })
  } finally {
    isUploading.value = false
  }
}

const closePreview = () => {
  previewUrl.value = ''
}

const confirmPrint = () => {
  const win = window.open('', '_blank')
  if (!win) return
  const style = `
    @media print {
      @page {
        size: A6 landscape;
        margin: 0;
      }
      body {
        margin: 0;
        background: black;
      }
      img {
        width: 100vw;
        height: 100vh;
        object-fit: cover;
      }
    }
  `
  win.document.write(`
    <!DOCTYPE html>
    <html><head><style>${style}</style></head>
    <body><img src="${previewUrl.value}" onload="window.print(); window.close();" /></body></html>
  `)
  win.document.close()
  closePreview()
}

const goToGallery = () => {
  router.push('/pictureBoard')
}
</script>
