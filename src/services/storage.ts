import { supabase } from './supabase'

/**
 * Sube un archivo a un bucket de Supabase
 * @param bucket Nombre del bucket (ej. 'fleet_assets')
 * @param path Ruta del archivo dentro del bucket (ej. 'vehicles/uuid/file.pdf')
 * @param file Objeto File a subir
 * @returns La URL pública del archivo subido
 */
export const uploadFile = async (bucket: string, path: string, file: File): Promise<string> => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: '3600'
  })
  
  if (error) {
    throw new Error(`Error al subir archivo: ${error.message}`)
  }
  
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
  return publicUrl
}

/**
 * Elimina un archivo de un bucket de Supabase
 * @param bucket Nombre del bucket
 * @param path Ruta del archivo dentro del bucket
 */
export const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) {
    throw new Error(`Error al eliminar archivo: ${error.message}`)
  }
  return true
}
