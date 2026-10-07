import LoginForm from './login-form'

type LoginPageProps = {
  searchParams: Promise<{ registered?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  return <LoginForm professional={false} registered={params.registered === 'true'} />
}
