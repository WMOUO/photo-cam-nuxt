<template>
    <div>
        <Button @click="printA6Image" label="列印圖" icon="pi pi-print" />
    </div>
</template>

<script setup lang="ts">
    const imageUrl = ref('test.png')
    const printA6Image = () => {
    const win = window.open('', '_blank')
    if (!win) return

    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
            @page {
                size: 148mm 105mm;
                margin: 0;
            }
            html, body {
                margin: 0;
                padding: 0;
                height: 100%;
                width: 100%;
                overflow: hidden;
            }
            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }
            </style>
        </head>
        <body>
            <img src="/test.png" onload="window.print(); window.close();" />
        </body>
        </html>
    `)
    win.document.close()
    }

</script>