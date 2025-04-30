<template>
    <div>
        <Button @click="handlePrint" label="列印" icon="pi pi-print" class="p-button-info mb-4" />
        <img id="print-img" :src="imageUrl" class="print-img" />
    </div>
</template>

<script setup lang="ts">
  const imageUrl = '/test.png' // 注意：這是修改後的新圖
const handlePrint = () => {
    window.print()
}
</script>

<style>
@media print {
    @page {
        size: A4 landscape;
        margin: 0;
    }
    body * {
      visibility: hidden; /* 預設所有元素都隱藏 */
    }
    #print-img {
        visibility: visible; /* 只讓圖片顯示 */
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
    }
}
</style>
