const MAX_BYTES = 280_000

export function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Escolha um arquivo de imagem'))
      return
    }

    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      const size = 256
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Não foi possível processar a imagem'))
        return
      }

      const scale = Math.max(size / img.width, size / img.height)
      const w = img.width * scale
      const h = img.height * scale
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)

      let quality = 0.88
      let dataUrl = canvas.toDataURL('image/jpeg', quality)

      while (dataUrl.length > MAX_BYTES && quality > 0.4) {
        quality -= 0.08
        dataUrl = canvas.toDataURL('image/jpeg', quality)
      }

      if (dataUrl.length > MAX_BYTES) {
        reject(new Error('Imagem muito grande. Tente outra foto.'))
        return
      }

      resolve(dataUrl)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler a imagem'))
    }

    img.src = url
  })
}
