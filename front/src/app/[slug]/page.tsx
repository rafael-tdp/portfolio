import PublicViewPage from '../public-view/[slug]/page'

interface Props { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ params, searchParams }: Props) {
  const resolvedParams = await params
  return <PublicViewPage params={resolvedParams} searchParams={searchParams} />
}
