import type { Area } from 'react-easy-crop'

const MAX_BYTES = 280_000
const OUTPUT_SIZE = 256

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => reject(new Error('Não foi possível ler a imagem')))
    image.src = src
  })
}

export async function getCroppedImageDataUrl(
  imageSrc: string,
  pixelCrop: Area,
): Promise<string> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Não foi possível processar a imagem')

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  return canvas.toDataURL('image/jpeg', 0.92)
}

export function compressDataUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Não foi possível processar a imagem'))
        return
      }

      const scale = Math.max(OUTPUT_SIZE / img.width, OUTPUT_SIZE / img.height)
      const w = img.width * scale
      const h = img.height * scale
      ctx.drawImage(img, (OUTPUT_SIZE - w) / 2, (OUTPUT_SIZE - h) / 2, w, h)

      let quality = 0.88
      let result = canvas.toDataURL('image/jpeg', quality)

      while (result.length > MAX_BYTES && quality > 0.4) {
        quality -= 0.08
        result = canvas.toDataURL('image/jpeg', quality)
      }

      if (result.length > MAX_BYTES) {
        reject(new Error('Imagem muito grande. Tente outra foto.'))
        return
      }

      resolve(result)
    }
    img.onerror = () => reject(new Error('Não foi possível ler a imagem'))
    img.src = dataUrl
  })
}

export async function processProfileImage(
  imageSrc: string,
  pixelCrop: Area,
): Promise<string> {
  const cropped = await getCroppedImageDataUrl(imageSrc, pixelCrop)
  return compressDataUrl(cropped)
}
