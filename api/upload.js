// api/upload.js - COMPLET
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: 'eu-west-3',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  try {
    const { filename, email } = req.body
    
    if (!filename || !email) {
      return res.status(400).json({ error: 'Filename et email requis' })
    }

    const key = `hb3d/${Date.now()}-${filename}`
    
    const command = new PutObjectCommand({
      Bucket: 'hb3d-lille',
      Key: key,
      ContentType: 'application/octet-stream',
      Metadata: { 
        email: email,
        project: 'HB3D-Lille'
      }
    })
    
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    
    res.json({ 
      success: true, 
      uploadUrl: url, 
      key: key 
    })
    
  } catch (error) {
    console.error('S3 Error:', error)
    res.status(500).json({ error: error.message })
  }
}
