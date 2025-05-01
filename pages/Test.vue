<template>
    <div>
        <Button @click="printImageOnly" label="列印圖" icon="pi pi-print" />
    </div>
</template>

<script setup lang="ts">
    const imageUrl = ref('test.png')
    const printImageOnly = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

        printWindow.document.write(`
            <!DOCTYPE html>
                <html>
                    <head>
                        <style>
                            @page {
                                size: A4 landscape;
                                margin: 0;
                            }
                            html, body {
                                margin: 0;
                                padding: 0;
                                height: 100%;
                                width: 100%;
                            }
                            img {
                                width: 100%;
                                height: 100%;
                                object-fit: contain;
                                display: block;
                            }
                        </style>
                    </head>
                    <body>
                        <img src="test.png" onload="window.print(); window.close();" />
                    </body> 
                </html>
    `)
    printWindow.document.close()
}

</script>