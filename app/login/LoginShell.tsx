import Image from 'next/image'

export function LoginShell() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Tendr" width={120} height={40} className="mx-auto brightness-0 invert" priority />
          <p className="mt-2 text-white/50 text-sm">Sign in to your account</p>
        </div>
        <div className="bg-deep-slate rounded-2xl p-8 border border-deep-slate h-48 animate-pulse" />
      </div>
    </div>
  )
}
