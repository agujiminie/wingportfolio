import { useEffect, useState } from 'react'
import CatGaze from './components/cat/CatGaze'
import CatGazeAtlas from './components/cat/CatGazeAtlas'
import { CAT_FRAMES } from './components/cat/catFrames'
import { GAZE_ATLAS } from './components/cat/gazeAtlas'
import './cat-page.css'

export default function CatPage() {
  const [version, setVersion] = useState('refined')
  const versions = [
    { id: 'original', label: '原版', note: '移动鼠标或拖动猫咪 · 原始照片直接切换' },
    { id: 'smooth', label: '柔和跟随', note: '移动鼠标或拖动猫咪 · 同一组照片，转头稍有缓冲' },
    { id: 'interpolated', label: '上版补帧', note: '上一版的素材和跟随速度 · 可切换对比' },
    { id: 'refined', label: '修正版', note: '移动鼠标或拖动猫咪 · 跟随更快，身体更稳定' },
  ]
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Cat · Wing Zeng'
    return () => { document.title = previousTitle }
  }, [])

  return (
    <main className="cat-page" aria-label="Margo follows your gaze">
      <a className="cat-page__home" href="#/">← Home</a>
      {version === 'refined' ? <CatGazeAtlas key={version} idle={false} /> : version === 'interpolated'
        ? <CatGazeAtlas key={version} frames={GAZE_ATLAS} responsive={false} sensitivity={1} idle={false} /> : <CatGaze
        key={version}
        frames={CAT_FRAMES}
        idle={false}
        smooth={version !== 'original'}
      />}
      <div className="cat-page__comparison" lang="zh-CN">
        <div className="cat-page__versions" role="group" aria-label="选择跟随效果">
          {versions.map(item => (
            <button key={item.id} type="button" aria-pressed={version === item.id} onClick={() => setVersion(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <p className="cat-page__note" aria-live="polite">{versions.find(item => item.id === version).note}</p>
      </div>
    </main>
  )
}
