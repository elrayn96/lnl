const palette = ['#7c5cff', '#ff5c93', '#20c9a6', '#ff9f43', '#3699ff']
export default function AnonymousAvatar({ name = '?', size = 'md' }) {
  const index = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length
  return <span className={`avatar avatar--${size}`} style={{ '--avatar-color': palette[index] }} aria-hidden="true">{name.slice(0, 2).toUpperCase()}</span>
}
