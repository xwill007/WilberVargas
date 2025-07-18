import { useEffect, useRef, useState } from 'react'
import { useXR } from '@react-three/xr'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

function VRVideoLocal({ 
  position = [0, 1.7, -4],
  width = 8,
  aspectRatio = 16/9,
  videoSource = '/videos/sample.mp4',
  rotationSpeed = 0.000
}) {
  const { isPresenting } = useXR()
  const height = width / aspectRatio
  const meshRef = useRef()
  const rotatingRef = useRef(false)
  const [videoTexture, setVideoTexture] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoElementRef = useRef(null)

  useEffect(() => {
    const video = document.createElement('video')
    video.src = videoSource
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'
    videoElementRef.current = video

    // Wait for video to be loaded before creating texture
    video.addEventListener('loadeddata', () => {
      const texture = new THREE.VideoTexture(video)
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.format = THREE.RGBAFormat
      texture.colorSpace = THREE.SRGBColorSpace
      
      setVideoTexture(texture)
      setIsLoading(false)
    })

    // Handle video errors
    video.addEventListener('error', (e) => {
      console.error('Error loading video:', e)
      setIsLoading(false)
    })

    const startPlayback = async () => {
      if (!hasInteracted && video) {
        try {
          setHasInteracted(true)
          await video.play()
          video.muted = false
        } catch (error) {
          console.error('Playback failed:', error)
        }
      }
    }

    const handleClick = () => {
      rotatingRef.current = !rotatingRef.current
      startPlayback()
    }

    const handleKeyPress = (event) => {
      if (event.code === 'Space') {
        if (video.paused) {
          video.play()
        } else {
          video.pause()
        }
      }
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKeyPress)
      if (video) {
        video.pause()
        video.remove()
      }
      if (videoTexture) {
        videoTexture.dispose()
      }
    }
  }, [videoSource, hasInteracted])

  const handlePlayPause = async () => {
    if (!videoElementRef.current) return

    try {
      if (isPlaying) {
        videoElementRef.current.pause()
      } else {
        videoElementRef.current.muted = false
        await videoElementRef.current.play()
      }
      setIsPlaying(!isPlaying)
      setHasInteracted(true)
    } catch (error) {
      console.error('Video playback error:', error)
    }
  }

  useFrame((state, delta) => {
    if (meshRef.current && rotatingRef.current) {
      meshRef.current.rotation.y += rotationSpeed
    }
  })

  if (isLoading) {
    return (
      <group position={position}>
        <Html>
          <div style={{
            color: 'white',
            background: 'rgba(0,0,0,0.5)',
            padding: '10px',
            borderRadius: '5px'
          }}>
            Loading video...
          </div>
        </Html>
      </group>
    )
  }

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial 
          map={videoTexture}
          side={THREE.DoubleSide}
          transparent
          toneMapped={false}
        />
      </mesh>

      {/* Play/Pause Button */}
      <Html position={[0, -height/2 - 0.5, 0]}>
        <button
          onClick={handlePlayPause}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: isPlaying ? '#ff4444' : '#44ff44',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </Html>
    </group>
  )
}

export default VRVideoLocal