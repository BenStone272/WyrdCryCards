const DB_NAME = 'warcry-fighter-photos'
const STORE_NAME = 'photos'
const DB_VERSION = 1
const DEFAULT_OFFSET_Y = 50

type StoredPhotoRecord = {
  blob: Blob
  offsetY: number
}

type LoadedPhoto = {
  url: string | null
  offsetY: number
}

function normalizeStoredPhoto(value: unknown): StoredPhotoRecord | null {
  if (value instanceof Blob) {
    return { blob: value, offsetY: DEFAULT_OFFSET_Y }
  }

  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as { blob?: unknown; offsetY?: unknown }
  if (!(candidate.blob instanceof Blob)) {
    return null
  }

  const offsetY = typeof candidate.offsetY === 'number' ? candidate.offsetY : DEFAULT_OFFSET_Y
  return { blob: candidate.blob, offsetY }
}

function openDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB not available in this environment'))
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function resizeImage(file: File, maxWidth: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const srcUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(srcUrl)
      const scale = Math.min(1, maxWidth / img.width)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get 2D canvas context'))
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('canvas.toBlob returned null'))
          }
        },
        'image/jpeg',
        0.82,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(srcUrl)
      reject(new Error('Failed to load image for resizing'))
    }

    img.src = srcUrl
  })
}

export async function savePhoto(fighterId: string, file: File, offsetY: number = DEFAULT_OFFSET_Y): Promise<string> {
  const blob = await resizeImage(file, 800)
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put({ blob, offsetY }, fighterId)

    tx.oncomplete = () => {
      db.close()
      resolve(URL.createObjectURL(blob))
    }

    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

export async function loadPhoto(fighterId: string): Promise<LoadedPhoto> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(fighterId)

    req.onsuccess = () => {
      db.close()
      const record = normalizeStoredPhoto(req.result)
      if (!record) {
        resolve({ url: null, offsetY: DEFAULT_OFFSET_Y })
        return
      }

      resolve({ url: URL.createObjectURL(record.blob), offsetY: record.offsetY })
    }

    req.onerror = () => {
      db.close()
      reject(req.error)
    }
  })
}

export async function savePhotoOffset(fighterId: string, offsetY: number): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const getReq = store.get(fighterId)

    getReq.onsuccess = () => {
      const record = normalizeStoredPhoto(getReq.result)
      if (!record) {
        return
      }

      store.put({ blob: record.blob, offsetY }, fighterId)
    }

    getReq.onerror = () => {
      db.close()
      reject(getReq.error)
    }

    tx.oncomplete = () => {
      db.close()
      resolve()
    }

    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

export async function deletePhoto(fighterId: string): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(fighterId)

    tx.oncomplete = () => {
      db.close()
      resolve()
    }

    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}
