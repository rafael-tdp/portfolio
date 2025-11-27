import { Storage } from '@google-cloud/storage'
import fs from 'fs'

/**
 * Service pour gérer le stockage de fichiers sur Google Cloud Storage
 */
class StorageService {
  private storage: Storage | null = null
  private bucketName: string
  private isConfigured: boolean = false

  constructor() {
    this.bucketName = process.env.GCS_BUCKET_NAME || ''
    this.initializeStorage()
  }

  private initializeStorage() {
    const projectId = process.env.GCS_PROJECT_ID
    const keyFilename = process.env.GCS_KEY_FILE
    const credentials = process.env.GCS_CREDENTIALS // JSON string for production

    if (!this.bucketName) {
      console.warn('[StorageService] GCS_BUCKET_NAME not configured - file uploads will use local storage')
      return
    }

    try {
      if (credentials) {
        // Parse JSON credentials from environment variable (production)
        const parsedCredentials = JSON.parse(credentials)
        this.storage = new Storage({
          projectId: parsedCredentials.project_id || projectId,
          credentials: parsedCredentials,
        })
        this.isConfigured = true
        console.log('[StorageService] Initialized with JSON credentials')
      } else if (keyFilename && fs.existsSync(keyFilename)) {
        // Use key file (local development)
        this.storage = new Storage({
          projectId,
          keyFilename,
        })
        this.isConfigured = true
        console.log('[StorageService] Initialized with key file')
      } else if (projectId) {
        // Use default credentials (when running on GCP)
        this.storage = new Storage({ projectId })
        this.isConfigured = true
        console.log('[StorageService] Initialized with default credentials')
      } else {
        console.warn('[StorageService] No GCS credentials configured - using local storage')
      }
    } catch (error) {
      console.error('[StorageService] Failed to initialize GCS:', error)
      this.isConfigured = false
    }
  }

  /**
   * Vérifie si GCS est configuré
   */
  public isGCSConfigured(): boolean {
    return this.isConfigured && this.storage !== null
  }

  /**
   * Upload un fichier vers Google Cloud Storage
   * @param filePath Chemin local du fichier temporaire
   * @param destinationPath Chemin de destination dans le bucket (ex: companies/123/logo.png)
   * @param contentType Type MIME du fichier
   * @returns URL publique du fichier uploadé
   */
  public async uploadFile(
    filePath: string,
    destinationPath: string,
    contentType?: string
  ): Promise<string> {
    if (!this.isGCSConfigured()) {
      throw new Error('GCS is not configured')
    }

    const bucket = this.storage!.bucket(this.bucketName)

    const options: any = {
      destination: destinationPath,
      metadata: {
        cacheControl: 'public, max-age=31536000', // Cache 1 year
      },
    }

    if (contentType) {
      options.metadata.contentType = contentType
    }

    await bucket.upload(filePath, options)

    // With uniform bucket-level access, public access is controlled at the bucket level
    // Make sure your bucket has "allUsers" with "Storage Object Viewer" role

    // Return the public URL
    const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${destinationPath}`
    return publicUrl
  }

  /**
   * Upload un buffer directement vers GCS
   * @param buffer Buffer du fichier
   * @param destinationPath Chemin de destination dans le bucket
   * @param contentType Type MIME du fichier
   * @returns URL publique du fichier uploadé
   */
  public async uploadBuffer(
    buffer: Buffer,
    destinationPath: string,
    contentType: string
  ): Promise<string> {
    if (!this.isGCSConfigured()) {
      throw new Error('GCS is not configured')
    }

    const bucket = this.storage!.bucket(this.bucketName)
    const blob = bucket.file(destinationPath)

    await blob.save(buffer, {
      metadata: {
        contentType,
        cacheControl: 'public, max-age=31536000',
      },
    })

    // With uniform bucket-level access, public access is controlled at the bucket level

    // Return the public URL
    const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${destinationPath}`
    return publicUrl
  }

  /**
   * Supprime un fichier de GCS
   * @param destinationPath Chemin du fichier dans le bucket
   */
  public async deleteFile(destinationPath: string): Promise<void> {
    if (!this.isGCSConfigured()) {
      console.warn('[StorageService] GCS not configured, cannot delete file')
      return
    }

    try {
      const bucket = this.storage!.bucket(this.bucketName)
      await bucket.file(destinationPath).delete()
    } catch (error: any) {
      // Ignore 404 errors (file doesn't exist)
      if (error.code !== 404) {
        throw error
      }
    }
  }

  /**
   * Extrait le chemin GCS depuis une URL publique
   * @param publicUrl URL publique GCS
   * @returns Chemin dans le bucket ou null si non-GCS URL
   */
  public getPathFromUrl(publicUrl: string): string | null {
    const prefix = `https://storage.googleapis.com/${this.bucketName}/`
    if (publicUrl.startsWith(prefix)) {
      return publicUrl.substring(prefix.length)
    }
    return null
  }
}

// Export singleton instance
export default new StorageService()
