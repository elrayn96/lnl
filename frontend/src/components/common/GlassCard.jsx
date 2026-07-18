export default function GlassCard({ className = '', children, ...props }) {
  return <section className={`glass-card ${className}`} {...props}>{children}</section>
}
