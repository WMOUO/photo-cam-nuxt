export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { image, toText } = body

  if (!image || !image.startsWith('data:image')) {
    return { status: 'error', message: '圖片格式錯誤' }
  }

  // ✅ 這裡將圖片 POST 給 mac 的列印伺服器（例如 http://localhost:8787/print）
  try {
    const res = await fetch('http://localhost:8787/print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, toText })
    })

    const result = await res.json()
    return result
  } catch (err: any) {
    return { status: 'error', message: '無法連線到列印伺服器', detail: err?.message }
  }
})
