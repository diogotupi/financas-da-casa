import type { Person } from '../types'
import { PEOPLE } from '../types'

interface Props {
  person: Person
  photo?: string
  size?: 'small' | 'default' | 'large'
  title?: string
}

export function Avatar({ person, photo, size = 'default', title }: Props) {
  const info = PEOPLE[person]
  const sizeClass =
    size === 'small' ? 'small' : size === 'large' ? 'large' : ''

  return (
    <span
      className={`avatar ${sizeClass}`.trim()}
      style={{ background: photo ? 'transparent' : info.color }}
      title={title ?? info.name}
    >
      {photo ? (
        <img src={photo} alt="" className="avatar-img" />
      ) : (
        info.initial
      )}
    </span>
  )
}
