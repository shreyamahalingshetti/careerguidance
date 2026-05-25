export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Career Guidance System. Built with Next.js, Prisma, and NextAuth.</p>
      </div>
    </footer>
  )
}